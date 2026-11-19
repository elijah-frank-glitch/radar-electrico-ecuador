// GET /api/noticias — lista (solo metadatos: título, enlace, fecha) de notas recientes de El Comercio
// sobre el sistema eléctrico. La usa la actualización automática diaria, porque El Comercio
// bloquea su API a los servidores de GitHub Actions. No reproduce el contenido de las notas.
// Caché de CDN de 3 horas.

const UA = { 'user-agent': 'Mozilla/5.0 (compatible; RadarElectricoEC/1.0; +https://radar-electrico-ecuador.vercel.app)' }
const TEMA = /apag[oó]n|apagones|cortes? de (luz|energ|electric)|racionamiento|mazar|coca codo|cenace|celec|estiaje|hidroel[eé]ctric|d[eé]ficit (el[eé]ctrico|de energ|de potencia)|sistema el[eé]ctrico|crisis (el[eé]ctrica|energ)|termoel[eé]ctric|barcaza/i

type WpPost = { id: number; date_gmt: string; link: string; title: { rendered: string } }

const limpiar = (s: string) =>
  s.replace(/<[^>]+>/g, '').replace(/&#8217;|&#8216;/g, "'").replace(/&#8220;|&#8221;|&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).trim()

export async function GET() {
  const desde = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10)
  const campos = `after=${desde}T00:00:00&_fields=id,date_gmt,link,title`
  const consultas = [`per_page=100&${campos}`, `tags=107601,30880&per_page=30&${campos}`]
  const errores: string[] = []
  const listas = await Promise.all(
    consultas.map(async (q) => {
      try {
        const r = await fetch(`https://www.elcomercio.com/wp-json/wp/v2/posts?${q}`, { headers: UA, signal: AbortSignal.timeout(9000) })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return (await r.json()) as WpPost[]
      } catch (e) {
        errores.push((e as Error).message)
        return [] as WpPost[]
      }
    }),
  )
  const notas = [...new Map(listas.flat().map((p) => [p.id, p])).values()]
    .map((p) => ({ id: p.id, url: p.link, titulo: limpiar(p.title.rendered), fecha: p.date_gmt.slice(0, 10) }))
    .filter((n) => TEMA.test(n.titulo))
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 20)
  const ok = errores.length < consultas.length
  return new Response(JSON.stringify({ medio: 'El Comercio', consultado: new Date().toISOString(), notas, errores }), {
    status: ok ? 200 : 502,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': ok ? 'public, s-maxage=10800, stale-while-revalidate=86400' : 'no-store',
    },
  })
}
