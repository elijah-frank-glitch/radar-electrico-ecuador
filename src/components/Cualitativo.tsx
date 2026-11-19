import { useMemo, useState } from 'react'
import { auto, consensoPonderado, fuentesOpinion, regresionAcierto, type Tipo } from '../data/expertos'
import { AvisoAuto, EtiquetaAuto } from './Auto'

const pc = (x: number) => `${Math.round(x * 100)}%`
const TIPOS: Record<Tipo, string> = { experto: 'Experto', gobierno: 'Gobierno', institucion: 'Institución' }

function notaTxt(n: number | null) {
  if (n === null) return { t: 'Pendiente / no verificable', c: 'var(--muted)' }
  if (n === 1) return { t: 'Acertó', c: 'var(--ok-ink)' }
  if (n === 0.5) return { t: 'Parcial', c: '#b07a00' }
  return { t: 'Falló', c: 'var(--s3)' }
}

export default function Cualitativo({ pCuant30 }: { pCuant30: number }) {
  const [filtro, setFiltro] = useState<'todos' | Tipo>('todos')
  const cons = useMemo(() => consensoPonderado(fuentesOpinion), [])
  const reg = useMemo(() => regresionAcierto(fuentesOpinion), [])
  const filas = cons.filas
    .filter((x) => filtro === 'todos' || x.f.tipo === filtro)
    .sort((a, b) => b.s.peso - a.s.peso)
  const maxPeso = Math.max(...cons.filas.map((x) => x.s.peso))
  const totalPred = fuentesOpinion.reduce((a, f) => a + f.predicciones.length, 0)

  return (
    <section id="cualitativo">
      <div className="wrap">
        <h2>Pronóstico cualitativo</h2>
        <p className="lede">
          Recopilamos {totalPred} pronósticos públicos de {fuentesOpinion.length} expertos, autoridades e instituciones en 2026 y los
          contrastamos con lo que realmente pasó. Con ese historial calculamos cuánto pesa la opinión de cada uno en el consenso.
        </p>
        <AvisoAuto actualizado={auto.actualizado} />

        <div className="grid g4">
          <div className="card kpi">
            <div className="label">Consenso ponderado por historial</div>
            <div className="value">{pc(cons.ponderado)}</div>
            <div className="sub">Probabilidad de cortes residenciales programados en 30 días</div>
          </div>
          <div className="card kpi">
            <div className="label">Promedio simple (sin ponderar)</div>
            <div className="value">{pc(cons.simple)}</div>
            <div className="sub">Cada opinión pesa igual</div>
          </div>
          <div className="card kpi">
            <div className="label">Modelo cuantitativo (30 días)</div>
            <div className="value">{pc(pCuant30)}</div>
            <div className="sub">Cortes residenciales o peor, escenario actual</div>
          </div>
          <div className="card kpi">
            <div className="label">Diferencia cualitativo vs. datos</div>
            <div className="value">{(cons.ponderado - pCuant30 > 0 ? '+' : '') + Math.round((cons.ponderado - pCuant30) * 100)} pts</div>
            <div className="sub">{Math.abs(cons.ponderado - pCuant30) < 0.15 ? 'Ambos enfoques coinciden' : cons.ponderado < pCuant30 ? 'Los datos son más pesimistas que las opiniones' : 'Las opiniones son más pesimistas que los datos'}</div>
          </div>
        </div>

        <div className="card">
          <h3>Ranking de fuentes por historial predictivo</h3>
          <div className="filter-row">
            {(['todos', 'experto', 'institucion', 'gobierno'] as const).map((t) => (
              <button key={t} className="chip" aria-pressed={filtro === t} onClick={() => setFiltro(t)}>{t === 'todos' ? 'Todos' : TIPOS[t]}</button>
            ))}
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Fuente</th>
                  <th className="num">Verificables</th>
                  <th className="num">Precisión</th>
                  <th className="num">Brier</th>
                  <th className="num">Acierto bayesiano</th>
                  <th>Peso en el consenso</th>
                  <th className="num">Su pronóstico (30 d)</th>
                </tr>
              </thead>
              <tbody>
                {filas.map(({ f, s }) => (
                  <tr key={f.id}>
                    <td>
                      <b>{f.nombre}</b> <span className="tag">{TIPOS[f.tipo]}</span>{f.conflictoInteres && <> <span className="tag" title="Incentivo institucional o político: peso ×0,75">conflicto de interés</span></>}{f.nueva && <> <EtiquetaAuto texto="fuente nueva" /></>}
                      <div className="small">{f.rol}</div>
                      <details>
                        <summary>Ver {f.predicciones.length} pronóstico(s)</summary>
                        <p className="small" style={{ marginTop: 6 }}>Postura actual: {f.postura}{f.posturaAuto && <> <EtiquetaAuto fecha={f.posturaAuto.agregado} cita={f.posturaAuto.cita} /> <a href={f.posturaAuto.url} target="_blank" rel="noreferrer">fuente</a></>}</p>
                        {f.predicciones.map((p, i) => {
                          const n = notaTxt(p.nota)
                          return (
                            <div className="pred" key={i} style={{ borderLeftColor: n.c }}>
                              <div><span className="small">{p.fecha}</span> — {p.dice}</div>
                              <div className="res"><b style={{ color: n.c }}>{n.t}.</b> {p.ocurrio} <a className="src" href={p.url} target="_blank" rel="noreferrer">fuente</a>{p.auto && <> <EtiquetaAuto fecha={p.auto.agregado} cita={p.auto.cita} /></>}</div>
                            </div>
                          )
                        })}
                      </details>
                    </td>
                    <td className="num">{s.n}</td>
                    <td className="num">{s.precisionBruta === null ? '—' : pc(s.precisionBruta)}</td>
                    <td className="num">{s.brier === null ? '—' : s.brier.toFixed(2)}</td>
                    <td className="num">{pc(s.posterior)}</td>
                    <td><div className="meter" title={s.peso.toFixed(2)}><span style={{ width: `${(s.peso / maxPeso) * 100}%` }} /></div><span className="small">{s.peso.toFixed(2)}</span></td>
                    <td className="num">{pc(f.pResidencial30)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small" style={{ marginTop: 10 }}>
            Precisión = aciertos / pronósticos verificables (parcial = 0,5). Brier = error cuadrático medio (0 es perfecto, 1 es siempre fallar).
            Acierto bayesiano = (aciertos + 1) / (n + 2): evita premiar a quien acertó una sola vez. Peso = acierto bayesiano × especificidad
            (los pronósticos vagos, sin fecha ni cifra, valen menos) × 0,75 si hay conflicto de interés. “Su pronóstico” traduce la postura actual de cada fuente a una probabilidad; es una lectura nuestra, no una cifra que ellos dieron.
          </p>
        </div>

        <div className="grid g2">
          <div className="card">
            <h3>Regresión: ¿qué tipo de pronóstico acierta?</h3>
            <p className="small">Regresión logística regularizada sobre los {reg.n} pronósticos verificables. Variable dependiente: acierto (0 / 0,5 / 1).</p>
            <table>
              <thead><tr><th>Variable</th><th className="num">Coeficiente</th><th>Lectura</th></tr></thead>
              <tbody>
                <tr><td>Especificidad (1–3)</td><td className="num">{reg.coef.especificidad.toFixed(2)}</td><td className="small">{reg.coef.especificidad < 0 ? 'Poner fecha y cifra exactas sale caro: los pronósticos precisos fallaron más (sobre todo los de enero, que no anticiparon las lluvias).' : 'Los pronósticos precisos aciertan más.'}</td></tr>
                <tr><td>Conflicto de interés</td><td className="num">{reg.coef.conflicto.toFixed(2)}</td><td className="small">{reg.coef.conflicto < 0 ? 'Las fuentes con incentivo político o institucional aciertan menos.' : 'No se ve penalización clara por conflicto de interés.'}</td></tr>
                <tr><td>Es experto independiente</td><td className="num">{reg.coef.esExperto.toFixed(2)}</td><td className="small">{reg.coef.esExperto > 0 ? 'Los expertos independientes aciertan algo más que gobierno e instituciones.' : 'Los expertos independientes no aciertan más que el resto.'}</td></tr>
              </tbody>
            </table>
            <p className="small" style={{ marginTop: 8 }}>Con n = {reg.n}, ningún coeficiente es estadísticamente concluyente: úsalo como indicio, no como prueba.</p>
          </div>
          <div className="card">
            <h3>Qué aprendimos del historial</h3>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li><b>Los pronósticos de enero fallaron por el calendario, no por el diagnóstico.</b> Alvear, Polo y Buitrón anticiparon cortes para marzo–mayo; llovió y no ocurrieron. Pero el déficit estructural que describían apareció en septiembre.</li>
              <li><b>Quienes razonan con la cota de Mazar aciertan más.</b> Salinas (Mazar se agota a fines de octubre) y Acuña (≈0,8–0,9 m/día) dieron cifras que los datos confirmaron.</li>
              <li><b>“No habrá apagones” fue verdad a medias.</b> No hubo cortes residenciales programados, pero sí desconexiones obligatorias a ≈9.000 industrias y racionamientos de emergencia: el costo se trasladó a la industria y a la factura de importación.</li>
              <li><b>Las advertencias condicionales (“si no llueve…”) no son fallos</b> cuando la condición no se cumple; por eso valen la mitad.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
