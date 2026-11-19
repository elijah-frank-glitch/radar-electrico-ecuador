// Función serverless de Vercel: GET /api/datos
// Lee datos públicos en vivo y los devuelve normalizados. La respuesta se cachea en la CDN
// 30 minutos (CENACE actualiza cada 30 min), así que muchos clics no golpean las fuentes.
//
// Fuentes:
//  - CENACE, Información Operativa (oficial): producción por central, curva de demanda e importación.
//  - El Comercio (API pública de WordPress): última cota de Mazar publicada (CELEC / monitor Hidro Info).

import https from 'node:https'
import tls from 'node:tls'
import { SECTIGO_DV_R36 } from './_lib/certs.js'

const UA = { 'user-agent': 'Mozilla/5.0 (compatible; RadarElectricoEC/1.0; +https://radar-electrico-ecuador.vercel.app)' }
const URL_CENACE = 'https://www.cenace.gob.ec/info-operativa/InformacionOperativa.htm'
const URL_EC = 'https://www.elcomercio.com/wp-json/wp/v2/posts?tags=107601,30880&per_page=8&_fields=id,date_gmt,link,title,excerpt'

type Plot = { id: string; pos: number; data: { name?: string; y?: unknown; x?: unknown; values?: number[]; labels?: string[] }[] }

function decodificar(y: unknown): number[] {
  if (Array.isArray(y)) return y.map((v) => (v === null ? NaN : Number(v)))
  if (y && typeof y === 'object' && 'bdata' in y) {
    const o = y as { dtype: string; bdata: string }
    const buf = Buffer.from(o.bdata, 'base64')
    const T = ({ f8: Float64Array, f4: Float32Array, i4: Int32Array, i2: Int16Array, u2: Uint16Array, i1: Int8Array, u1: Uint8Array, u4: Uint32Array } as const)[o.dtype as 'f8']
    if (!T) return []
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    return Array.from(new T(ab))
  }
  return []
}

// fetch con un reintento: las webs públicas a veces cortan la primera conexión
async function traer(url: string, ms = 8000): Promise<Response> {
  let ultimo: unknown
  for (let intento = 0; intento < 2; intento++) {
    try {
      const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(ms) })
      if (r.ok) return r
      ultimo = new Error(`HTTP ${r.status}`)
      if (r.status === 429 || r.status === 403) break // no insistir si nos limitan
    } catch (e) { ultimo = e }
  }
  throw ultimo instanceof Error ? ultimo : new Error(String(ultimo))
}

// GET con https nativo y el intermedio de Sectigo añadido a las raíces (CENACE a veces envía la cadena incompleta)
const CA = [...tls.rootCertificates, SECTIGO_DV_R36]
function traerTextoTLS(url: string, ms = 8000, intento = 0): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: UA, ca: CA, timeout: ms }, (res) => {
      if ((res.statusCode ?? 0) >= 300) {
        res.resume()
        return reject(new Error(`HTTP ${res.statusCode}`))
      }
      res.setEncoding('utf8')
      let cuerpo = ''
      res.on('data', (c: string) => (cuerpo += c))
      res.on('end', () => resolve(cuerpo))
      res.on('error', reject)
    })
    req.on('timeout', () => req.destroy(new Error('timeout')))
    req.on('error', reject)
  }).catch((e) => (intento < 1 ? traerTextoTLS(url, ms, intento + 1) : Promise.reject(e))) as Promise<string>
}

const num = (s: string) => Number(s.replace(/[\s   .]/g, '').replace(',', '.'))
const r1 = (x: number) => Math.round(x * 10) / 10

async function leerCenace() {
  const html = await traerTextoTLS(URL_CENACE)
  // Posiciones de cada sección para asignar los gráficos
  const iRT = html.indexOf('PRODUCCIÓN EN TIEMPO REAL')
  const iDem = html.indexOf('DEMANDAS EMPRESAS')
  const iDia = html.indexOf('INFORMACIÓN OPERATIVA DIARIA', iDem)
  const iMes = html.indexOf('INFORMACIÓN OPERATIVA MENSUAL', iDia)
  if (iRT < 0 || iDia < 0) throw new Error('Formato de la página de CENACE cambió')

  const plots: Plot[] = []
  const re = /Plotly\.newPlot\(\s*"([^"]+)",\s*(\[[\s\S]*?\])\s*,\s*\{/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    try { plots.push({ id: m[1], pos: m.index, data: JSON.parse(m[2]) }) } catch { /* ignorar */ }
  }
  const enSeccion = (a: number, b: number) => plots.filter((p) => p.pos > a && (b < 0 || p.pos < b))
  const curva = (ps: Plot[]) => ps.find((p) => p.data.some((t) => t.name === 'DEMANDA NACIONAL'))
  const barrasHidro = (ps: Plot[]) => ps.find((p) => p.data.some((t) => (t.name || '').trim() === 'Coca Codo'))

  const serie = (p: Plot | undefined, nombre: string) => {
    const t = p?.data.find((d) => (d.name || '').trim() === nombre)
    return t ? decodificar(t.y) : []
  }
  const validos = (a: number[]) => a.filter((v) => Number.isFinite(v))
  const max = (a: number[]) => (validos(a).length ? Math.max(...validos(a)) : NaN)
  const prom = (a: number[]) => { const v = validos(a); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : NaN }
  const ultimo = (a: number[]) => { const v = validos(a); return v.length ? v[v.length - 1] : NaN }

  const fecha = (desde: number) => (html.slice(desde, desde + 400).replace(/<[^>]+>/g, ' ').match(/[A-Za-zéá]+, \d{1,2} de [a-z]+ de \d{4}/) || [])[0] ?? null

  const rt = enSeccion(iRT, iDem)
  const dia = enSeccion(iDia, iMes)
  const curvaRT = curva(rt)
  const curvaDia = curva(dia)

  const plantasDia: Record<string, number> = {}
  for (const t of barrasHidro(dia)?.data ?? []) {
    const v = decodificar(t.y)[0]
    if (t.name && Number.isFinite(v)) plantasDia[t.name.trim()] = Math.round(v / 24) // MWh del día → MW promedio
  }

  const texto = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const demandaActual = (texto.match(/DEMANDA TOTAL ([\d ]+?) ANTERIOR/) || [])[1]
  // Bloques "PRODUCCIÓN TOTAL … IMPORTACIÓN x HIDRÁULICA" en orden: tiempo real, diaria, mensual, anual
  const bloques = [...texto.matchAll(/PRODUCCIÓN TOTAL [\d ]+ EXPORTACIÓN [\d ]+ IMPORTACIÓN ([\d ]+?) HIDR/g)]
  const importDia = bloques[1]?.[1]

  const demHoy = serie(curvaRT, 'DEMANDA NACIONAL')
  const demAyer = serie(curvaDia, 'DEMANDA NACIONAL')
  const impHoy = serie(curvaRT, 'Importación')
  const termAyer = serie(curvaDia, 'Térmica')
  const hidroAyer = serie(curvaDia, 'Hidráulica')

  return {
    url: URL_CENACE,
    fechaTiempoReal: fecha(iRT),
    fechaDiaria: fecha(iDia),
    demandaActualMW: demandaActual ? num(demandaActual) : ultimo(demHoy),
    demandaMaxHoyMW: Math.round(max(demHoy)),
    demandaMaxAyerMW: Math.round(max(demAyer)),
    importacionActualMW: r1(ultimo(impHoy)),
    importacionPromAyerMW: importDia ? r1(num(importDia) / 24) : r1(prom(serie(curvaDia, 'Importación'))),
    termicaMaxAyerMW: Math.round(max(termAyer)),
    hidroPromAyerMW: Math.round(prom(hidroAyer)),
    plantasPromAyerMW: plantasDia,
  }
}

// Primera cifra con decimales (p. ej. "2 120,01") que aparece después de "cota" o "embalse"
function extraerCota(html: string): number | null {
  const txt = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#8239;|&#160;/g, ' ')
  const i = txt.search(/cota|embalse/i)
  if (i < 0) return null
  const re = /2[\s.   ]?1[0-5]\d,\d{1,2}/g
  re.lastIndex = i
  const m = re.exec(txt)
  if (!m) return null
  const cota = num(m[0])
  return cota >= 2095 && cota <= 2154 ? cota : null
}

async function leerCotaMazar() {
  // Etiquetas "mazar" de El Comercio (la búsqueda de texto de WordPress es demasiado lenta)
  const posts = (await (await traer(URL_EC)).json()) as {
    id: number; date_gmt: string; link: string; title: { rendered: string }; excerpt: { rendered: string }
  }[]
  const candidatos = posts
    .filter((p) => /mazar|embalse/i.test(p.title.rendered))
    .sort((a, b) => b.date_gmt.localeCompare(a.date_gmt))
    .slice(0, 2)
  // Se revisan en orden (la más reciente primero) para hacer el mínimo de peticiones:
  // El Comercio limita la frecuencia (HTTP 429) si se le consulta muy seguido.
  let fallo: unknown = null
  for (const p of candidatos) {
    const r = await (async () => {
      let cota = extraerCota(p.excerpt.rendered)
      if (cota === null) {
        try {
          const c = (await (await traer(`https://www.elcomercio.com/wp-json/wp/v2/posts/${p.id}?_fields=content`, 6000)).json()) as { content: { rendered: string } }
          cota = extraerCota(c.content.rendered)
        } catch (e) { fallo = e }
      }
      return cota === null ? null : {
        cota,
        fechaPublicacion: p.date_gmt + 'Z',
        titulo: p.title.rendered.replace(/<[^>]+>/g, '').replace(/&#8217;/g, '’'),
        url: p.link,
        fuente: 'El Comercio (datos CELEC / monitor Hidro Info)',
      }
    })()
    if (r) return r
  }
  if (fallo) throw fallo
  return null
}

function causa(e: unknown): string {
  const err = e as { message?: string; cause?: { code?: string; message?: string } }
  const c = err?.cause ? ` (${err.cause.code ?? err.cause.message})` : ''
  return (err?.message ?? String(e)) + c
}

export async function GET() {
  const [cenace, mazar] = await Promise.allSettled([leerCenace(), leerCotaMazar()])
  const errores: string[] = []
  if (cenace.status === 'rejected') errores.push('CENACE: ' + causa(cenace.reason))
  if (mazar.status === 'rejected') errores.push('Cota de Mazar: ' + causa(mazar.reason))
  const cuerpo = {
    consultado: new Date().toISOString(),
    cenace: cenace.status === 'fulfilled' ? cenace.value : null,
    mazar: mazar.status === 'fulfilled' ? mazar.value : null,
    errores,
  }
  const ok = cuerpo.cenace || cuerpo.mazar
  return new Response(JSON.stringify(cuerpo), {
    status: ok ? 200 : 502,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // CDN: 30 min frescos, hasta 1 día sirviendo la versión anterior mientras se renueva
      'cache-control': !ok ? 'no-store' : errores.length ? 'public, s-maxage=600, stale-while-revalidate=3600' : 'public, s-maxage=1800, stale-while-revalidate=86400',
    },
  })
}
