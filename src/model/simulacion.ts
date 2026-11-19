// Simulación Monte Carlo del balance de potencia en hora pico del sistema ecuatoriano.
// Modelo simplificado y transparente: no reemplaza al modelo SDDP de Cenace.

export const NIVELES = [
  { id: 0, corto: 'Sin apagones', largo: 'Sin apagones generalizados', desc: 'La oferta cubre la demanda de hora pico.' },
  { id: 1, corto: 'Solo industria', largo: 'Cortes solo industriales', desc: 'Se cubre el déficit desconectando industria y con autogeneración (≈450 MW).' },
  { id: 2, corto: 'Cortes residenciales', largo: 'Alta probabilidad de cortes residenciales', desc: 'El déficit supera lo que libera la industria: cortes programados en hogares.' },
  { id: 3, corto: 'Generalizado', largo: 'Apagón / racionamiento generalizado', desc: 'Déficit residencial > 800 MW (cortes de 11+ h), Mazar cerca de su cota mínima o colapso del sistema.' },
] as const

export type Parametros = {
  cotaInicial: number
  hidrologia: number // multiplicador de caudales (0,6 = muy seco, 1 = normal de estiaje, 1,5 = lluvioso)
  caudalPauteBase: number // m3/s
  caudalCocaBase: number // m3/s
  disponibilidadTermica: number // 0..1
  capacidadTermica: number // MW
  nuevaTermica: number // MW que entran en operación durante el horizonte
  probImportacion: number // probabilidad diaria de que Colombia venda
  demandaPico: number // MW
  crecimientoDemanda: number // % anual
  aliviaIndustria: number // MW
  runs: number
  dias: number
  semilla: number
}

export const PARAMS_BASE: Parametros = {
  cotaInicial: 2120.01,
  hidrologia: 1,
  caudalPauteBase: 40,
  caudalCocaBase: 160,
  disponibilidadTermica: 0.85,
  capacidadTermica: 1450,
  nuevaTermica: 0,
  probImportacion: 0.6,
  demandaPico: 5150,
  crecimientoDemanda: 5.5,
  aliviaIndustria: 450,
  runs: 2500,
  dias: 60,
  semilla: 2026,
}

// Constantes físicas / calibración
const HM3_POR_METRO = 7 // volumen de Mazar por metro de cota cerca de 2120 msnm
const COTA_CRITICA = 2115
const COTA_MINIMA = 2098
const MW_POR_M3S_PAUTE = 12.5 // cascada Mazar + Paute-Molino + Sopladora en hora pico
const MAX_PAUTE = 1650
const MW_POR_M3S_COCA = 5.33 // 789 MW con 148 m3/s
const MAX_COCA = 1450
const OTROS_HIDRO = 1300 // Agoyán, San Francisco, Minas, Toachi-Pilatón, Delsitanisagua, menores + ERNC
const P_FALLA_SISTEMICA = 0.0008 // por día, sube con estrés (apagón nacional jun-2024 como precedente)

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function normal(r: () => number) {
  let u = 0
  while (u === 0) u = r()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
}

export type ResultadoDia = {
  dia: number
  cota: [number, number, number, number, number] // p5 p25 p50 p75 p95
  margen: [number, number, number, number, number]
  pNivel: [number, number, number, number]
}

export type ResultadoHorizonte = {
  dias: number
  pPeor: [number, number, number, number] // prob. de que el peor día del horizonte sea cada nivel
  diasResidencialesEsperados: number
  horasCorteMediana: number // entre corridas con cortes residenciales
  pCruceCritica: number
}

export type Resultado = {
  porDia: ResultadoDia[]
  horizontes: ResultadoHorizonte[]
  diaMedianoCritica: number | null
  muestrasCota: number[][] // algunas trayectorias para dibujar
}

function pct(sorted: number[], p: number) {
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))))
  return sorted[i]
}

export const HORIZONTES = [3, 7, 14, 30, 60]

export function simular(p: Parametros): Resultado {
  const r = rng(p.semilla)
  const D = p.dias
  const N = p.runs
  const cotas: Float64Array[] = Array.from({ length: D }, () => new Float64Array(N))
  const margenes: Float64Array[] = Array.from({ length: D }, () => new Float64Array(N))
  const niveles: Uint8Array[] = Array.from({ length: D }, () => new Uint8Array(N))
  const horas: Float32Array[] = Array.from({ length: D }, () => new Float32Array(N))
  const diaCritica = new Int16Array(N).fill(-1)
  const muestras: number[][] = []

  const qPmed = p.caudalPauteBase * p.hidrologia
  const qCmed = p.caudalCocaBase * p.hidrologia ** 0.8

  for (let n = 0; n < N; n++) {
    let h = p.cotaInicial
    // Incertidumbre paramétrica: cada corrida tiene su propia "temporada" (más o menos seca que la base)
    const temporada = Math.exp(normal(r) * 0.3 - 0.045)
    let zP = normal(r) * 0.3 // anomalía log del caudal del Paute
    let zC = normal(r) * 0.2
    let importa = r() < p.probImportacion
    let termAnom = 0
    let lluvia = 0
    const tray: number[] = []
    for (let d = 0; d < D; d++) {
      // Caudales AR(1) lognormales + pulsos de lluvia ocasionales
      // Régimen de lluvias persistente (frentes de varios días), como el repunte del feriado de noviembre
      if (lluvia > 0) lluvia--
      else if (r() < 0.035 * p.hidrologia * (1 + d / 60)) lluvia = 3 + Math.floor(r() * 8)
      zP = 0.85 * zP + Math.sqrt(1 - 0.85 ** 2) * 0.45 * normal(r)
      zC = 0.88 * zC + Math.sqrt(1 - 0.88 ** 2) * 0.28 * normal(r)
      const pulso = lluvia > 0 ? 2.2 + r() * 1.3 : 1
      const qP = qPmed * temporada * Math.exp(zP - 0.072) * pulso
      const qC = Math.min(330, qCmed * Math.sqrt(temporada) * Math.exp(zC - 0.03))

      // Importaciones: cadena de Markov; Colombia endurece desde diciembre (El Niño)
      const diaCalendario = 19 + d // días desde el 0 de noviembre
      const pApagar = diaCalendario > 42 ? 0.18 : 0.1
      const pPrender = (p.probImportacion * pApagar) / Math.max(0.01, 1 - p.probImportacion)
      importa = importa ? r() > pApagar : r() < pPrender
      const imp = importa ? 150 + r() * 230 : 0

      // Térmica con disponibilidad persistente; nueva térmica entra linealmente en el horizonte
      termAnom = 0.7 * termAnom + 0.3 * normal(r) * 0.06
      const disp = Math.min(0.97, Math.max(0.55, p.disponibilidadTermica + termAnom))
      const termica = (p.capacidadTermica + p.nuevaTermica * Math.min(1, d / 30)) * disp

      // Coca Codo: paros por sedimentos (33 paros en 2025)
      const sedimento = r() < 0.03 ? 0.35 : 1
      const coca = Math.min(MAX_COCA, MW_POR_M3S_COCA * qC) * sedimento

      const otros = OTROS_HIDRO * Math.pow(Math.exp(zP), 0.25) * Math.min(1.3, p.hidrologia ** 0.4) + normal(r) * 60

      const demanda = p.demandaPico * (1 + (p.crecimientoDemanda / 100) * (d / 365)) + normal(r) * 110

      // Política de descarga de Mazar: sobre la cota crítica se turbina para cubrir el déficit
      const oferta0 = coca + otros + termica + imp
      let R: number
      if (h <= COTA_CRITICA) {
        // Bajo la cota crítica se opera casi a filo de agua (en 2024 se siguió bajando
        // lentamente hacia la mínima); la cuenca intermedia aporta ~25% extra a Paute-Molino
        R = qP * 1.25 + (h > 2104 ? 15 : 0)
      } else {
        const necesario = (demanda - oferta0) / MW_POR_M3S_PAUTE
        const techo = h > COTA_CRITICA + 1.5 ? 125 : qP + ((h - COTA_CRITICA) / 1.5) * (125 - qP)
        R = Math.max(qP * 0.6, Math.min(techo, necesario))
      }
      const paute = Math.min(MAX_PAUTE, MW_POR_M3S_PAUTE * R)
      // La descarga media diaria es menor que la de hora pico
      const Rmedia = h <= COTA_CRITICA ? qP + (h > 2104 ? 15 : 0) : 0.78 * R
      h = h + ((qP - Rmedia) * 86400) / (HM3_POR_METRO * 1e6)
      h = Math.min(2153, Math.max(COTA_MINIMA - 2, h))
      if (h <= COTA_CRITICA + 0.3 && diaCritica[n] < 0) diaCritica[n] = d

      const margen = oferta0 + paute - demanda
      let nivel = 0
      let hrs = 0
      if (margen < 0) nivel = 1
      if (margen < -p.aliviaIndustria) {
        const deficitRes = -(margen + p.aliviaIndustria)
        nivel = deficitRes > 800 ? 3 : 2
        hrs = Math.min(14, Math.max(2, deficitRes / 70))
      }
      if (h < 2104) nivel = 3
      const pFalla = P_FALLA_SISTEMICA * (margen < 0 ? 3 : 1)
      if (r() < pFalla) nivel = 3

      cotas[d][n] = h
      margenes[d][n] = margen
      niveles[d][n] = nivel
      horas[d][n] = hrs
      if (n < 40) tray.push(h)
    }
    if (n < 40) muestras.push(tray)
  }

  const porDia: ResultadoDia[] = []
  for (let d = 0; d < D; d++) {
    const c = Array.from(cotas[d]).sort((a, b) => a - b)
    const m = Array.from(margenes[d]).sort((a, b) => a - b)
    const cnt = [0, 0, 0, 0]
    for (let n = 0; n < N; n++) cnt[niveles[d][n]]++
    porDia.push({
      dia: d + 1,
      cota: [pct(c, 0.05), pct(c, 0.25), pct(c, 0.5), pct(c, 0.75), pct(c, 0.95)],
      margen: [pct(m, 0.05), pct(m, 0.25), pct(m, 0.5), pct(m, 0.75), pct(m, 0.95)],
      pNivel: cnt.map((x) => x / N) as [number, number, number, number],
    })
  }

  const horizontes: ResultadoHorizonte[] = HORIZONTES.filter((H) => H <= D).map((H) => {
    const cnt = [0, 0, 0, 0]
    let diasRes = 0
    let cruces = 0
    const horasRuns: number[] = []
    for (let n = 0; n < N; n++) {
      // Nivel "sostenido": el más grave que ocurre al menos 2 días en el horizonte
      // (un solo día malo puede ser ruido del modelo; los cortes reales se programan por días)
      const diasEnNivel = [0, 0, 0, 0]
      let hmax = 0
      for (let d = 0; d < H; d++) {
        const nv = niveles[d][n]
        for (let k = 0; k <= nv; k++) diasEnNivel[k]++
        if (nv >= 2) {
          diasRes++
          if (horas[d][n] > hmax) hmax = horas[d][n]
        }
      }
      let peor = 0
      for (let k = 1; k <= 3; k++) if (diasEnNivel[k] >= 2) peor = k
      cnt[peor]++
      if (hmax > 0) horasRuns.push(hmax)
      if (diaCritica[n] >= 0 && diaCritica[n] < H) cruces++
    }
    horasRuns.sort((a, b) => a - b)
    return {
      dias: H,
      pPeor: cnt.map((x) => x / N) as [number, number, number, number],
      diasResidencialesEsperados: diasRes / N,
      horasCorteMediana: horasRuns.length ? pct(horasRuns, 0.5) : 0,
      pCruceCritica: cruces / N,
    }
  })

  const cr = Array.from(diaCritica).filter((x) => x >= 0).sort((a, b) => a - b)
  const diaMedianoCritica = cr.length > N / 2 ? cr[Math.floor(N / 2)] + 1 : null

  return { porDia, horizontes, diaMedianoCritica, muestrasCota: muestras }
}

export const ESCENARIOS: { id: string; nombre: string; desc: string; cambios: Partial<Parametros> }[] = [
  { id: 'base', nombre: 'Base (tendencia actual)', desc: 'Caudales de estiaje como los de noviembre, importación intermitente.', cambios: {} },
  { id: 'seco', nombre: 'Estiaje severo (El Niño)', desc: 'Caudales 30% menores y Colombia casi sin exportar.', cambios: { hidrologia: 0.7, probImportacion: 0.2 } },
  { id: 'lluvia', nombre: 'Llegan las lluvias', desc: 'Caudales 50% mayores, como el repunte de inicios de noviembre.', cambios: { hidrologia: 1.5 } },
  { id: 'termica', nombre: 'Entra nueva térmica', desc: '+300 MW térmicos en 30 días y 92% de disponibilidad.', cambios: { nuevaTermica: 300, disponibilidadTermica: 0.92 } },
]
