import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import Cuantitativo, { Horizontes, nivelDominante, useSimulacion } from './components/Cuantitativo'
import Cualitativo from './components/Cualitativo'
import { NIVELES, PARAMS_BASE, type Parametros } from './model/simulacion'
import { FECHA_CORTE, estadoActual as E, umbrales, fuentes, serieMazar } from './data/sistema'
import { aplicarDatos, pedirDatos, type Cambio, type DatosVivo } from './model/enVivo'
import PanelVivo from './components/PanelVivo'
import { mitos, VEREDICTOS, type Veredicto } from './data/mitos'
import { auto } from './data/expertos'
import { AvisoAuto, EtiquetaAuto } from './components/Auto'

function useTheme() {
  const [theme, setTheme] = useState<string | null>(() => {
    try { return localStorage.getItem('theme') } catch { return null }
  })
  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme
    else delete document.documentElement.dataset.theme
    try { if (theme) localStorage.setItem('theme', theme) } catch { /* sin almacenamiento */ }
  }, [theme])
  const dark = theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  return { dark, toggle: () => setTheme(dark ? 'light' : 'dark') }
}

const fechaLargaDe = (f: string) => new Date(f + 'T12:00:00Z').toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export default function App() {
  const { dark, toggle } = useTheme()
  const [paramsBase, setParamsBase] = useState<Parametros>(PARAMS_BASE)
  const [params, setParams] = useState<Parametros>(PARAMS_BASE)
  const [vivo, setVivo] = useState<DatosVivo | null>(null)
  const [cambios, setCambios] = useState<Cambio[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const actualizar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const d = await pedirDatos()
      const { params: p, cambios: c } = aplicarDatos(PARAMS_BASE, d)
      setVivo(d)
      setCambios(c)
      setParamsBase(p)
      setParams(p)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setCargando(false)
    }
  }, [])
  useEffect(() => { actualizar() }, [actualizar])

  // Fecha de referencia: hoy en Ecuador si hay datos en vivo; si no, la fecha de corte guardada
  const fechaRef = vivo ? new Date(vivo.consultado).toLocaleDateString('en-CA', { timeZone: 'America/Guayaquil' }) : FECHA_CORTE
  const serie = useMemo(() => {
    const m = vivo?.mazar
    if (!m) return serieMazar
    const f = new Date(m.fechaPublicacion).toLocaleDateString('en-CA', { timeZone: 'America/Guayaquil' })
    const ult = serieMazar[serieMazar.length - 1]
    if (f < ult.fecha || (f === ult.fecha && Math.abs(m.cota - ult.cota) < 0.005)) return serieMazar
    return [...serieMazar.filter((p) => p.fecha !== f), { fecha: f, cota: m.cota, tipo: 'reportado' as const, nota: 'Dato en vivo', fuente: '' }]
  }, [vivo])
  const cotaHoy = serie[serie.length - 1].cota
  const ccsHoy = vivo?.cenace?.plantasPromAyerMW['Coca Codo'] ?? E.generacionCCS
  const demMax = vivo?.cenace ? Math.max(vivo.cenace.demandaMaxAyerMW, vivo.cenace.demandaMaxHoyMW) : E.demandaPicoRecord
  const impHoy = vivo?.cenace ? vivo.cenace.importacionPromAyerMW : E.importacionPromedio

  const deferred = useDeferredValue(params)
  const res = useSimulacion(deferred)
  const base = useSimulacion(paramsBase)
  const h30 = base.horizontes.find((h) => h.dias === 30)!
  const pRes30 = h30.pPeor[2] + h30.pPeor[3]
  const [filtroMito, setFiltroMito] = useState<'todos' | Veredicto>('todos')
  const h7 = base.horizontes.find((h) => h.dias === 7)!
  const dom7 = nivelDominante(h7.pPeor)
  const fechaLarga = fechaLargaDe(fechaRef)

  return (
    <>
      <header className="top">
        <div className="wrap">
          <span className="brand">⚡ Radar Eléctrico EC</span>
          <nav className="tabs" aria-label="Secciones">
            <a href="#resumen">Resumen</a>
            <a href="#cuantitativo">Cuantitativo</a>
            <a href="#cualitativo">Cualitativo</a>
            <a href="#mitos">Mitos y bulos</a>
            <a href="#metodo">Metodología</a>
          </nav>
          <button className="theme-btn" onClick={actualizar} disabled={cargando} aria-label="Actualizar datos en vivo" title="Actualizar con datos en vivo de CENACE y la última cota de Mazar">{cargando ? '…' : '↻'}</button>
          <button className="theme-btn" onClick={toggle} aria-label="Cambiar tema">{dark ? '☀︎' : '☾'}</button>
        </div>
      </header>

      <main>
        <section id="resumen">
          <div className="wrap">
            <h1>¿Habrá apagones en Ecuador?</h1>
            <p className="lede">
              Estado de las hidroeléctricas, probabilidad de cortes a 3, 7, 14, 30 y 60 días, qué expertos han acertado y qué afirmaciones
              son bulos. Datos al <b>{fechaLarga}</b>.
            </p>

            <PanelVivo vivo={vivo} cambios={cambios} cargando={cargando} error={error} onActualizar={actualizar} fechaGuardada={FECHA_CORTE} />

            <div className="card" style={{ marginTop: 16 }}>
              <div className="status" style={{ fontSize: 15 }}>
                <span className={`dot lv${dom7}`} style={{ width: 14, height: 14 }} />
                Próximos 7 días: {NIVELES[dom7].largo.toLowerCase()}
              </div>
              <p style={{ marginTop: 8, marginBottom: 0 }}>
                Mazar está en <b>{cotaHoy.toFixed(2)} msnm</b>, a <b>{(cotaHoy - umbrales.critica).toFixed(1)} m</b> de su cota crítica. Coca Codo Sinclair opera al {Math.round((ccsHoy / 1500) * 100)}% de su capacidad por bajo caudal. En el escenario base, la probabilidad de
                cortes residenciales programados (o algo peor) en los próximos 30 días es <b>{Math.round(pRes30 * 100)}%</b>.
                Lo que más la mueve: <b>si llueve en la cuenca del Paute</b> en las próximas dos semanas.
              </p>
            </div>

            <div className="grid g4">
              <div className="card kpi"><div className="label">Cota de Mazar</div><div className="value">{cotaHoy.toFixed(1)}</div><div className="sub">msnm · crítica {umbrales.critica} · mínima {umbrales.minima}</div></div>
              <div className="card kpi"><div className="label">Coca Codo Sinclair</div><div className="value">{ccsHoy} MW</div><div className="sub">{vivo?.cenace ? 'promedio de ayer (CENACE)' : `${E.caudalCoca} m³/s de ≈222 necesarios`} · capacidad 1.500</div></div>
              <div className="card kpi"><div className="label">{vivo?.cenace ? 'Demanda máxima (ayer/hoy)' : 'Demanda récord'}</div><div className="value">{demMax.toLocaleString('es-EC')} MW</div><div className="sub">{vivo?.cenace ? `ahora ${Math.round(vivo.cenace.demandaActualMW).toLocaleString('es-EC')} MW · récord 5.400` : `10-nov · prom. nov +${(((E.demandaPromedioNov / E.demandaPromedioNov2025) - 1) * 100).toFixed(1)}% interanual`}</div></div>
              <div className="card kpi"><div className="label">Importación de Colombia</div><div className="value">≈{Math.round(impHoy)} MW</div><div className="sub">{vivo?.cenace ? 'promedio de ayer (CENACE)' : 'promedio 6–10 nov'} · máx. {E.importacionMax} MW</div></div>
            </div>

            <h3 style={{ marginTop: 8 }}>Pronóstico por horizonte (escenario base)</h3>
            <div className="legend">
              {NIVELES.map((n, i) => <span key={i} title={n.desc}><span className={`dot lv${i}`} />{n.largo}</span>)}
            </div>
            <Horizontes res={base} fechaRef={fechaRef} />

            <p className="disclaimer">
              Sitio independiente con fines informativos; no está afiliado a CNEL EP, CELEC EP, CENACE ni al Ministerio de Ambiente y Energía.
              Los datos provienen de cifras oficiales publicadas por esas entidades y recogidas por la prensa (cada dato enlaza a su fuente).
              Para horarios de cortes en tu zona, consulta los canales oficiales de CNEL EP o de tu empresa eléctrica.
            </p>
          </div>
        </section>

        <Cuantitativo res={res} params={params} setParams={setParams} base={paramsBase} serieMazar={serie} fechaRef={fechaRef} />
        <Cualitativo pCuant30={pRes30} />

        <section id="mitos">
          <div className="wrap">
            <h2>Mitos, bulos y lo que sí está demostrado</h2>
            <p className="lede">Lo que circula en redes, contrastado con datos, estudios y verificadores.</p>
            <AvisoAuto actualizado={auto.actualizado} />
            <div className="filter-row">
              <button className="chip" aria-pressed={filtroMito === 'todos'} onClick={() => setFiltroMito('todos')}>Todos ({mitos.length})</button>
              {(Object.keys(VEREDICTOS) as Veredicto[]).map((v) => (
                <button key={v} className="chip" aria-pressed={filtroMito === v} onClick={() => setFiltroMito(v)} title={VEREDICTOS[v].desc}>
                  {VEREDICTOS[v].etiqueta} ({mitos.filter((m) => m.veredicto === v).length})
                </button>
              ))}
            </div>
            <div className="mitos">
              {mitos.filter((m) => filtroMito === 'todos' || m.veredicto === filtroMito).map((m) => (
                <article className="card mito" key={m.afirmacion}>
                  <div className={`verd v-${m.veredicto}`}>
                    {m.veredicto === 'demostrado' ? '✓' : m.veredicto === 'bulo' ? '✕' : m.veredicto === 'no-demostrado' ? '?' : '!'} {VEREDICTOS[m.veredicto].etiqueta}
                    <span className="tag" style={{ textTransform: 'none', fontWeight: 400 }}>según {m.base}</span>
                  </div>
                  <h3>{m.afirmacion}</h3>
                  <p style={{ color: 'var(--ink-2)', fontSize: 14 }}>{m.explicacion}</p>
                  <div className="src">{m.fuentes.map((f, i) => <span key={f.url}>{i > 0 && ' · '}<a href={f.url} target="_blank" rel="noreferrer">{f.medio}</a></span>)}{m.auto && <> <EtiquetaAuto fecha={m.auto.agregado} cita={m.auto.cita} /></>}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="metodo">
          <div className="wrap">
            <h2>Metodología y limitaciones</h2>
            <div className="grid g2">
              <div className="card">
                <h3>Modelo cuantitativo</h3>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 14 }}>
                  <li>Simulación diaria a 60 días. Caudales del Paute y del Coca como procesos lognormales autocorrelacionados, con frentes de lluvia aleatorios de 3–10 días.</li>
                  <li>Mazar: ≈7 hm³ por metro de cota cerca de 2120 msnm (calibrado con la caída observada de −0,78 m/día con 38 m³/s de ingreso y una turbina). Sobre 2115 msnm se turbina el embalse para cubrir el déficit; bajo esa cota el complejo Paute opera casi a filo de agua.</li>
                  <li>Coca Codo: ≈5,3 MW por m³/s (789 MW con 148 m³/s), con paros aleatorios por sedimentos (33 en 2025).</li>
                  <li>Térmica de ≈1.450 MW con disponibilidad variable; importación de Colombia como cadena de Markov (150–380 MW) que se vuelve menos confiable desde diciembre por El Niño.</li>
                  <li>Niveles: margen ≥ 0 → sin apagones; déficit ≤ alivio industrial → solo industria; déficit residencial ≤ 800 MW → cortes a hogares; más que eso, cota &lt; 2104 msnm o falla sistémica → generalizado.</li>
                  <li>Es un modelo simplificado y público, no el modelo oficial de Cenace. Su valor está en mostrar qué supuestos mueven el riesgo, no en dar una cifra exacta.</li>
                </ul>
              </div>
              <div className="card">
                <h3>Modelo cualitativo y fuentes</h3>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 14 }}>
                  <li>Cada pronóstico se califica contra lo ocurrido hasta la fecha de corte: acertó (1), parcial o condición no cumplida (0,5), falló (0). Los vagos o futuros quedan pendientes.</li>
                  <li>El peso de cada fuente combina acierto bayesiano, especificidad y conflicto de interés. Las calificaciones son nuestras y cada una enlaza a la nota original para que puedas revisarla.</li>
                  <li>CNEL EP distribuye la energía y ejecuta los cortes; la hidrología y la generación las publican CELEC EP y CENACE. Este sitio usa esas cifras oficiales tal como las reportan los medios citados.</li>
                  <li>Limitación: algunas cotas intermedias se reconstruyeron a partir de variaciones publicadas (marcadas como “estimado” en el código fuente).</li>
                </ul>
                <p className="small" style={{ marginTop: 10 }}>Fuentes principales: {Object.values(fuentes).slice(0, 8).map((f, i) => <span key={f.url}>{i > 0 && ' · '}<a href={f.url} target="_blank" rel="noreferrer">{f.medio}</a></span>)}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">Radar Eléctrico EC · análisis independiente · datos al {fechaLarga}. No sustituye la información oficial de CNEL EP, CELEC EP ni CENACE.</div>
      </footer>
    </>
  )
}
