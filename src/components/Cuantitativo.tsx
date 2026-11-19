import { useMemo, useState } from 'react'
import {
  Area, AreaChart, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { ESCENARIOS, NIVELES, simular, type Parametros, type Resultado } from '../model/simulacion'
import { tendencia, sumarDias } from '../model/estadistica'
import { FECHA_CORTE, umbrales, cronologia, fuentes, type PuntoCota } from '../data/sistema'

const COLORS = ['var(--s0)', 'var(--s1)', 'var(--s2)', 'var(--s3)']
const pc = (x: number) => (x < 0.005 ? '<1%' : x > 0.995 ? '>99%' : `${Math.round(x * 100)}%`)

export function nivelDominante(p: number[]) {
  // Nivel con al menos 50% de probabilidad acumulada desde el más grave
  let acc = 0
  for (let i = 3; i >= 0; i--) {
    acc += p[i]
    if (acc >= 0.5) return i
  }
  return 0
}

export function Horizontes({ res, fechaRef = FECHA_CORTE }: { res: Resultado; fechaRef?: string }) {
  return (
    <div className="horizons">
      {res.horizontes.map((h) => {
        const dom = nivelDominante(h.pPeor)
        return (
          <div className="hz" key={h.dias}>
            <div className="d">Próximos {h.dias} días · hasta {sumarDias(fechaRef, h.dias)}</div>
            <div className="big status"><span className={`dot lv${dom}`} />{NIVELES[dom].corto}</div>
            <div className="bar" role="img" aria-label={NIVELES.map((n, i) => `${n.corto} ${pc(h.pPeor[i])}`).join(', ')}>
              {h.pPeor.map((p, i) => (p > 0.004 ? <span key={i} style={{ width: `${p * 100}%`, background: COLORS[i] }} title={`${NIVELES[i].corto}: ${pc(p)}`} /> : null))}
            </div>
            <ul>
              {NIVELES.map((n, i) => (
                <li key={i}><span className="status" style={{ fontWeight: 400 }}><span className={`dot lv${i}`} />{n.corto}</span><b>{pc(h.pPeor[i])}</b></li>
              ))}
            </ul>
            <ul>
              <li><span>Días con cortes a hogares (esperado)</span><b>{h.diasResidencialesEsperados.toFixed(1)}</b></li>
              <li><span>Horas/día si hay cortes (mediana)</span><b>{h.horasCorteMediana ? h.horasCorteMediana.toFixed(0) + ' h' : '—'}</b></li>
              <li><span>Mazar cruza 2115 msnm</span><b>{pc(h.pCruceCritica)}</b></li>
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function Slider({ label, value, min, max, step, fmt, onChange }: { label: string; value: number; min: number; max: number; step: number; fmt: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <div>
      <label>{label} <b>{fmt(value)}</b></label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
    </div>
  )
}

type TTProps = { active?: boolean; payload?: { payload: Record<string, number> }[]; label?: number }

function TTCota({ active, payload }: TTProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="tt">
      <strong>{d.fechaTxt as unknown as string}</strong>
      {d.obs !== undefined && <div><span>Observado</span><b>{d.obs.toFixed(2)} msnm</b></div>}
      {d.p50 !== undefined && (
        <>
          <div><span>Mediana simulada</span><b>{d.p50.toFixed(2)}</b></div>
          <div><span>Rango 50%</span><b>{d.p25.toFixed(1)} – {d.p75.toFixed(1)}</b></div>
          <div><span>Rango 90%</span><b>{d.p5.toFixed(1)} – {d.p95.toFixed(1)}</b></div>
        </>
      )}
    </div>
  )
}

function TTProb({ active, payload }: TTProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="tt">
      <strong>Día {d.dia} · {d.fechaTxt as unknown as string}</strong>
      {[3, 2, 1, 0].map((i) => (
        <div key={i}><span className="status" style={{ fontWeight: 400 }}><span className={`dot lv${i}`} />{NIVELES[i].corto}</span><b>{pc(d[`n${i}`])}</b></div>
      ))}
      <div><span>Margen pico (mediana)</span><b>{Math.round(d.margen)} MW</b></div>
    </div>
  )
}

export default function Cuantitativo({ res, params, setParams, base, serieMazar, fechaRef }: { res: Resultado; params: Parametros; setParams: (p: Parametros) => void; base: Parametros; serieMazar: PuntoCota[]; fechaRef: string }) {
  const [esc, setEsc] = useState('base')
  const [vista, setVista] = useState<'grafico' | 'tabla'>('grafico')

  const cotaData = useMemo(() => {
    const t0 = Date.parse(fechaRef + 'T00:00:00Z')
    const obs = serieMazar.filter((p) => p.fecha >= '2026-09-25').map((p) => {
      const d = Math.round((Date.parse(p.fecha + 'T00:00:00Z') - t0) / 86400000)
      return { d, fechaTxt: sumarDias(fechaRef, d), obs: p.cota }
    })
    const sim = res.porDia.map((x) => ({
      d: x.dia, fechaTxt: sumarDias(fechaRef, x.dia),
      p5: x.cota[0], p25: x.cota[1], p50: x.cota[2], p75: x.cota[3], p95: x.cota[4],
      b90: [x.cota[0], x.cota[4]], b50: [x.cota[1], x.cota[3]],
    }))
    const hoy = obs[obs.length - 1]
    return [...obs.slice(0, -1), { ...hoy, p5: hoy.obs, p25: hoy.obs, p50: hoy.obs, p75: hoy.obs, p95: hoy.obs, b90: [hoy.obs, hoy.obs], b50: [hoy.obs, hoy.obs] }, ...sim]
  }, [res, serieMazar, fechaRef])

  const probData = useMemo(() => res.porDia.map((x) => ({
    dia: x.dia, fechaTxt: sumarDias(fechaRef, x.dia), n0: x.pNivel[0], n1: x.pNivel[1], n2: x.pNivel[2], n3: x.pNivel[3], margen: x.margen[2],
  })), [res, fechaRef])

  const ultimaFecha = serieMazar[serieMazar.length - 1].fecha
  const desde = new Date(Date.parse(ultimaFecha + 'T00:00:00Z') - 11 * 86400000).toISOString().slice(0, 10)
  const recientes = serieMazar.filter((p) => p.fecha >= desde)
  const tend = tendencia(recientes, umbrales.critica)
  const tendOct = tendencia(serieMazar.filter((p) => p.fecha >= '2026-09-29' && p.fecha <= '2026-10-12'), umbrales.critica)

  const set = (k: keyof Parametros) => (v: number) => { setEsc(''); setParams({ ...params, [k]: v }) }

  return (
    <section id="cuantitativo">
      <div className="wrap">
        <h2>Pronóstico cuantitativo</h2>
        <p className="lede">
          Simulación Monte Carlo de {params.runs.toLocaleString('es-EC')} trayectorias diarias del balance de potencia en hora pico
          (Paute, Coca Codo Sinclair, otras hidroeléctricas, térmica, importación de Colombia y demanda). Cada horizonte muestra la probabilidad
          del <b>nivel más grave que se sostiene al menos 2 días</b> dentro del periodo. Mueve los supuestos y el resultado se recalcula al instante.
        </p>

        <div className="card">
          <div className="chips" role="group" aria-label="Escenarios">
            {ESCENARIOS.map((e) => (
              <button key={e.id} className="chip" aria-pressed={esc === e.id} title={e.desc}
                onClick={() => { setEsc(e.id); setParams({ ...base, ...e.cambios }) }}>{e.nombre}</button>
            ))}
          </div>
          <div className="controls">
            <Slider label="Hidrología (caudales vs. estiaje actual)" value={params.hidrologia} min={0.5} max={2} step={0.05} fmt={(v) => `×${v.toFixed(2)}`} onChange={set('hidrologia')} />
            <Slider label="Probabilidad diaria de importar de Colombia" value={params.probImportacion} min={0} max={1} step={0.05} fmt={(v) => `${Math.round(v * 100)}%`} onChange={set('probImportacion')} />
            <Slider label="Disponibilidad térmica" value={params.disponibilidadTermica} min={0.6} max={0.97} step={0.01} fmt={(v) => `${Math.round(v * 100)}%`} onChange={set('disponibilidadTermica')} />
            <Slider label="Nueva generación térmica (30 días)" value={params.nuevaTermica} min={0} max={800} step={25} fmt={(v) => `${v} MW`} onChange={set('nuevaTermica')} />
            <Slider label="Demanda en hora pico" value={params.demandaPico} min={4800} max={5600} step={25} fmt={(v) => `${v.toLocaleString('es-EC')} MW`} onChange={set('demandaPico')} />
            <Slider label="Alivio por desconectar industria" value={params.aliviaIndustria} min={0} max={700} step={10} fmt={(v) => `${v} MW`} onChange={set('aliviaIndustria')} />
          </div>
        </div>

        <Horizontes res={res} fechaRef={fechaRef} />

        <div className="grid g2" style={{ marginTop: 16 }}>
          <div className="card">
            <h3>Trayectoria de la cota de Mazar</h3>
            <p className="small">Observado (sep–nov) y bandas simuladas del 50% y 90%. La línea roja es la cota crítica de 2115 msnm.</p>
            <div className="legend">
              <span><span className="dot" style={{ background: 'var(--ink)' }} />Observado</span>
              <span><span className="dot" style={{ background: 'var(--line)' }} />Mediana simulada</span>
              <span><span className="dot" style={{ background: 'var(--band)' }} />Bandas 50% / 90%</span>
            </div>
            <div className="chart">
              <ResponsiveContainer>
                <ComposedChart data={cotaData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke="var(--grid)" vertical={false} />
                  <XAxis dataKey="d" type="number" domain={['dataMin', 'dataMax']} tickFormatter={(d) => sumarDias(fechaRef, d)} stroke="var(--axis)" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                  <YAxis domain={[2110, 2140]} stroke="var(--axis)" tick={{ fill: 'var(--muted)', fontSize: 12 }} allowDataOverflow />
                  <Tooltip content={<TTCota />} />
                  <Area dataKey="b90" stroke="none" fill="var(--band)" fillOpacity={0.45} isAnimationActive={false} />
                  <Area dataKey="b50" stroke="none" fill="var(--band-2)" fillOpacity={0.45} isAnimationActive={false} />
                  <Line dataKey="p50" stroke="var(--line)" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line dataKey="obs" stroke="var(--ink)" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface)' }} connectNulls isAnimationActive={false} />
                  <ReferenceLine y={umbrales.critica} stroke="var(--s3)" strokeDasharray="4 3" label={{ value: 'Crítica 2115', fill: 'var(--s3)', fontSize: 11, position: 'insideBottomLeft' }} />
                  <ReferenceLine x={0} stroke="var(--axis)" label={{ value: 'hoy', fill: 'var(--muted)', fontSize: 11, position: 'insideTopRight' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3>Probabilidad diaria por nivel</h3>
            <p className="small">Probabilidad de cada nivel en cada día (no acumulada).</p>
            <div className="legend">
              {NIVELES.map((n, i) => <span key={i}><span className={`dot lv${i}`} />{n.corto}</span>)}
            </div>
            <div className="filter-row">
              <button className="chip" aria-pressed={vista === 'grafico'} onClick={() => setVista('grafico')}>Gráfico</button>
              <button className="chip" aria-pressed={vista === 'tabla'} onClick={() => setVista('tabla')}>Tabla</button>
            </div>
            {vista === 'grafico' ? (
              <div className="chart" style={{ height: 250 }}>
                <ResponsiveContainer>
                  <AreaChart data={probData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke="var(--grid)" vertical={false} />
                    <XAxis dataKey="dia" stroke="var(--axis)" tick={{ fill: 'var(--muted)', fontSize: 12 }} tickFormatter={(d) => sumarDias(fechaRef, d)} />
                    <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} domain={[0, 1]} stroke="var(--axis)" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                    <Tooltip content={<TTProb />} />
                    {[0, 1, 2, 3].map((i) => (
                      <Area key={i} dataKey={`n${i}`} stackId="1" stroke="var(--surface)" strokeWidth={1} fill={COLORS[i]} fillOpacity={0.9} isAnimationActive={false} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="table-scroll" style={{ maxHeight: 290 }}>
                <table>
                  <thead><tr><th>Fecha</th>{NIVELES.map((n) => <th className="num" key={n.id}>{n.corto}</th>)}<th className="num">Margen</th></tr></thead>
                  <tbody>
                    {probData.filter((x) => [1, 3, 7, 14, 21, 30, 45, 60].includes(x.dia)).map((x) => (
                      <tr key={x.dia}><td>{x.fechaTxt}</td>{[0, 1, 2, 3].map((i) => <td className="num" key={i}>{pc((x as unknown as Record<string, number>)[`n${i}`])}</td>)}<td className="num">{Math.round(x.margen)} MW</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="grid g2">
          <div className="card">
            <h3>Análisis inferencial: ¿a qué ritmo cae Mazar?</h3>
            <p className="small">Regresión lineal (MCO) de la cota en el tiempo, con intervalo de confianza del 95% (t de Student). Muestra pequeña: los intervalos son anchos a propósito.</p>
            <table>
              <thead><tr><th>Periodo</th><th className="num">Pendiente</th><th className="num">IC 95%</th><th className="num">R²</th></tr></thead>
              <tbody>
                <tr><td>Últimos 12 días (n={tend.n})</td><td className="num">{tend.pendiente.toFixed(2)} m/día</td><td className="num">{tend.ic[0].toFixed(2)} a {tend.ic[1].toFixed(2)}</td><td className="num">{tend.r2.toFixed(2)}</td></tr>
                <tr><td>29 sep–12 oct (n={tendOct.n})</td><td className="num">{tendOct.pendiente.toFixed(2)} m/día</td><td className="num">{tendOct.ic[0].toFixed(2)} a {tendOct.ic[1].toFixed(2)}</td><td className="num">{tendOct.r2.toFixed(2)}</td></tr>
              </tbody>
            </table>
            <div className="callout">
              Al ritmo de las últimas observaciones, Mazar llegaría a 2115 msnm en <b>≈{tend.diasACritica?.toFixed(0)} días</b> ({tend.diasACritica ? sumarDias(fechaRef, tend.diasACritica) : '—'});
              con el intervalo de confianza, entre {tend.diasACriticaIC[0]?.toFixed(0)} y {tend.diasACriticaIC[1] ? tend.diasACriticaIC[1].toFixed(0) : 'más de 60'} días.
              La simulación, que añade lluvias aleatorias y la operación de las centrales, da una mediana de{' '}
              <b>{res.diaMedianoCritica ? `${res.diaMedianoCritica} días (${sumarDias(fechaRef, res.diaMedianoCritica)})` : 'no cruzarla en 60 días'}</b>.
            </div>
            <p className="small">Lectura: la hipótesis “Mazar no está bajando” se rechaza (el intervalo no incluye 0). Que la tendencia siga depende casi solo de las lluvias en la cuenca del Paute.</p>
          </div>

          <div className="card">
            <h3>Cronología 2026</h3>
            <ul className="timeline">
              {[...cronologia].sort((a, b) => a.fecha.localeCompare(b.fecha)).map((e) => (
                <li key={e.fecha + e.titulo}>
                  <span className="f">{new Date(e.fecha + 'T12:00:00Z').toLocaleDateString('es-EC', { day: 'numeric', month: 'short', timeZone: 'UTC' })}</span>
                  <span>
                    <b>{e.titulo}</b> <span className="tag">{e.tipo}</span><br />
                    <span style={{ color: 'var(--ink-2)' }}>{e.detalle}</span>{' '}
                    <a className="src" href={fuentes[e.fuente]?.url} target="_blank" rel="noreferrer">fuente</a>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export function useSimulacion(params: Parametros) {
  return useMemo(() => simular(params), [params])
}
