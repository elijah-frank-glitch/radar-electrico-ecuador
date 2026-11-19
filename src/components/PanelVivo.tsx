import type { Cambio, DatosVivo } from '../model/enVivo'

type Props = {
  vivo: DatosVivo | null
  cambios: Cambio[]
  cargando: boolean
  error: string | null
  onActualizar: () => void
  fechaGuardada: string
}

const hora = (iso: string) =>
  new Date(iso).toLocaleString('es-EC', { timeZone: 'America/Guayaquil', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function PanelVivo({ vivo, cambios, cargando, error, onActualizar, fechaGuardada }: Props) {
  const plantas = vivo?.cenace?.plantasPromAyerMW ?? {}
  return (
    <div className="card live" style={{ marginTop: 16 }}>
      <div className="live-head">
        <div>
          <div className="status" style={{ fontSize: 14 }}>
            <span className={`dot ${vivo ? 'lv0' : error ? 'lv3' : 'lv1'}`} />
            {cargando ? 'Consultando CENACE y la última cota de Mazar…' : vivo ? `Datos en vivo · consultados ${hora(vivo.consultado)}` : error ? 'No se pudo actualizar: se muestran los datos guardados' : 'Datos guardados'}
          </div>
          <div className="small">
            {vivo
              ? 'El modelo se recalculó con estos datos. CENACE publica cada 30 minutos; la respuesta se guarda en caché hasta 30 min.'
              : `Datos guardados al ${fechaGuardada}. Pulsa el botón para traer los últimos datos oficiales.`}
          </div>
        </div>
        <button className="btn-primary" onClick={onActualizar} disabled={cargando}>
          {cargando ? 'Actualizando…' : '↻ Actualizar datos'}
        </button>
      </div>

      {error && <p className="small" style={{ color: 'var(--s3)', marginTop: 8 }}>{error}</p>}
      {vivo && vivo.errores.length > 0 && <p className="small" style={{ marginTop: 8 }}>Parcial: {vivo.errores.join(' · ')}</p>}

      {vivo && (
        <details style={{ marginTop: 10 }}>
          <summary>Ver qué cambió ({cambios.length}) y los datos de origen</summary>
          {cambios.length > 0 && (
            <div className="table-scroll" style={{ marginTop: 8 }}>
              <table>
                <thead><tr><th>Supuesto del modelo</th><th>Guardado</th><th>En vivo</th><th>Origen</th></tr></thead>
                <tbody>
                  {cambios.map((c) => (
                    <tr key={c.campo}><td>{c.campo}</td><td>{c.antes}</td><td><b>{c.ahora}</b></td><td className="small">{c.nota}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="grid g2" style={{ marginTop: 10, gap: 12 }}>
            {vivo.cenace && (
              <div className="small">
                <b style={{ color: 'var(--ink)' }}>CENACE</b> ({vivo.cenace.fechaDiaria}) — promedio por central ayer:{' '}
                {Object.entries(plantas).map(([k, v]) => `${k} ${v} MW`).join(' · ')}. Hidráulica {vivo.cenace.hidroPromAyerMW} MW promedio; térmica pico {vivo.cenace.termicaMaxAyerMW} MW.{' '}
                <a href={vivo.cenace.url} target="_blank" rel="noreferrer">Fuente oficial</a>
              </div>
            )}
            {vivo.mazar && (
              <div className="small">
                <b style={{ color: 'var(--ink)' }}>Cota de Mazar</b>: {vivo.mazar.cota.toFixed(2)} msnm, publicada {hora(vivo.mazar.fechaPublicacion)} — “{vivo.mazar.titulo}”.{' '}
                <a href={vivo.mazar.url} target="_blank" rel="noreferrer">{vivo.mazar.fuente}</a>. CELEC no publica la cota en un formato abierto, por eso se toma del último reporte de prensa.
              </div>
            )}
          </div>
          <p className="small" style={{ marginTop: 8 }}>
            Se actualizan solos los datos del sistema (cota, centrales, demanda, importación). Las calificaciones de expertos y los mitos requieren revisión humana y se actualizan en el repositorio.
          </p>
        </details>
      )}
    </div>
  )
}
