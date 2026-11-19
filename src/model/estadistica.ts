// Inferencia sobre la tendencia de la cota de Mazar (MCO con intervalos t de Student).

const T95: Record<number, number> = { 1: 12.71, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 6: 2.447, 8: 2.306, 10: 2.228 }
const tcrit = (df: number) => T95[df] ?? 2.0

export type Tendencia = {
  n: number
  pendiente: number // m/día
  ic: [number, number]
  r2: number
  diasACritica: number | null
  diasACriticaIC: [number | null, number | null]
}

const dia = (f: string) => Date.parse(f + 'T00:00:00Z') / 86400000

export function tendencia(puntos: { fecha: string; cota: number }[], cotaObjetivo: number): Tendencia {
  const x = puntos.map((p) => dia(p.fecha))
  const y = puntos.map((p) => p.cota)
  const n = x.length
  const mx = x.reduce((a, b) => a + b, 0) / n
  const my = y.reduce((a, b) => a + b, 0) / n
  let sxx = 0
  let sxy = 0
  for (let i = 0; i < n; i++) {
    sxx += (x[i] - mx) ** 2
    sxy += (x[i] - mx) * (y[i] - my)
  }
  const b = sxy / sxx
  const a = my - b * mx
  let sse = 0
  let sst = 0
  for (let i = 0; i < n; i++) {
    sse += (y[i] - (a + b * x[i])) ** 2
    sst += (y[i] - my) ** 2
  }
  const se = Math.sqrt(sse / Math.max(1, n - 2) / sxx)
  const t = tcrit(n - 2)
  const ic: [number, number] = [b - t * se, b + t * se]
  const ultimo = y[n - 1]
  const dist = ultimo - cotaObjetivo
  const dias = (s: number) => (s < 0 ? dist / -s : null)
  return {
    n,
    pendiente: b,
    ic,
    r2: 1 - sse / sst,
    diasACritica: dias(b),
    diasACriticaIC: [dias(ic[0]), dias(ic[1])],
  }
}

export function sumarDias(fecha: string, d: number) {
  const t = new Date(Date.parse(fecha + 'T12:00:00Z') + d * 86400000)
  return t.toLocaleDateString('es-EC', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}
