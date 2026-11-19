// Convierte los datos en vivo (/api/datos) en supuestos del modelo.
import type { Parametros } from './simulacion'
import { FECHA_CORTE } from '../data/sistema'

export type DatosVivo = {
  consultado: string
  cenace: null | {
    url: string
    fechaTiempoReal: string | null
    fechaDiaria: string | null
    demandaActualMW: number
    demandaMaxHoyMW: number
    demandaMaxAyerMW: number
    importacionActualMW: number
    importacionPromAyerMW: number
    termicaMaxAyerMW: number
    hidroPromAyerMW: number
    plantasPromAyerMW: Record<string, number>
  }
  mazar: null | { cota: number; fechaPublicacion: string; titulo: string; url: string; fuente: string }
  errores: string[]
}

export type Cambio = { campo: string; antes: string; ahora: string; nota: string }

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x))
const ok = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)

export function aplicarDatos(base: Parametros, d: DatosVivo) {
  const p: Parametros = { ...base }
  const cambios: Cambio[] = []
  const c = d.cenace

  if (d.mazar && d.mazar.fechaPublicacion.slice(0, 10) >= FECHA_CORTE) {
    p.cotaInicial = d.mazar.cota
    cambios.push({ campo: 'Cota de Mazar', antes: `${base.cotaInicial.toFixed(2)} msnm`, ahora: `${d.mazar.cota.toFixed(2)} msnm`, nota: `Publicada ${new Date(d.mazar.fechaPublicacion).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}` })
  }
  if (c) {
    const ccs = c.plantasPromAyerMW['Coca Codo']
    if (ok(ccs) && ccs > 0) {
      p.caudalCocaBase = Math.round(clamp((ccs / 5.33) * 1.05, 60, 300))
      cambios.push({ campo: 'Coca Codo Sinclair', antes: `≈${base.caudalCocaBase} m³/s`, ahora: `≈${p.caudalCocaBase} m³/s`, nota: `${ccs} MW promedio ayer` })
    }
    const dem = Math.max(c.demandaMaxAyerMW || 0, c.demandaMaxHoyMW || 0)
    if (dem > 3000) {
      p.demandaPico = Math.round(clamp(dem, 4600, 5800) / 25) * 25
      cambios.push({ campo: 'Demanda pico', antes: `${base.demandaPico} MW`, ahora: `${p.demandaPico} MW`, nota: 'Máximo de ayer/hoy (CENACE)' })
    }
    if (ok(c.importacionPromAyerMW)) {
      const imp = c.importacionPromAyerMW
      p.probImportacion = Math.round((imp < 30 ? 0.25 : clamp(0.3 + imp / 400, 0.3, 0.9)) * 20) / 20
      cambios.push({ campo: 'Importación de Colombia', antes: `${Math.round(base.probImportacion * 100)}% de días`, ahora: `${Math.round(p.probImportacion * 100)}% de días`, nota: `${imp} MW promedio ayer` })
    }
    if (ok(c.termicaMaxAyerMW) && c.termicaMaxAyerMW > 300) {
      p.capacidadTermica = Math.round(clamp(c.termicaMaxAyerMW / base.disponibilidadTermica, 900, 2200) / 10) * 10
      cambios.push({ campo: 'Capacidad térmica', antes: `${base.capacidadTermica} MW`, ahora: `${p.capacidadTermica} MW`, nota: `Pico térmico ayer ${c.termicaMaxAyerMW} MW` })
    }
  }
  return { params: p, cambios }
}

export async function pedirDatos(): Promise<DatosVivo> {
  const r = await fetch('/api/datos', { headers: { accept: 'application/json' } })
  const j = (await r.json().catch(() => null)) as DatosVivo | null
  if (!j) throw new Error(`El servidor respondió ${r.status}`)
  if (!j.cenace && !j.mazar) throw new Error(j.errores.join(' · ') || 'Sin datos')
  return j
}
