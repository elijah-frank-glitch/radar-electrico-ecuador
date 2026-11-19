// Marcas para lo que agregó la actualización automática diaria (IA + controles en código).

const fechaCorta = (f: string) => new Date(f.length === 10 ? f + 'T12:00:00Z' : f).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', timeZone: 'America/Guayaquil' })

export function EtiquetaAuto({ fecha, cita, texto = 'automático' }: { fecha?: string; cita?: string; texto?: string }) {
  const titulo = [
    'Agregado por la actualización automática diaria: un modelo de IA lo extrajo de la nota enlazada y el código comprobó que la cita aparece literalmente en ella.',
    fecha ? `Fecha: ${fechaCorta(fecha)}.` : '',
    cita ? `Cita: «${cita}»` : '',
  ].filter(Boolean).join(' ')
  return <span className="tag tag-auto" title={titulo}>⚙ {texto}{fecha ? ` · ${fechaCorta(fecha)}` : ''}</span>
}

export function AvisoAuto({ actualizado }: { actualizado: string | null }) {
  return (
    <p className="small" style={{ marginTop: -4 }}>
      <span className="tag tag-auto">⚙ automático</span>{' '}
      {actualizado
        ? `Se revisan las noticias y verificaciones cada día; última revisión: ${new Date(actualizado).toLocaleString('es-EC', { timeZone: 'America/Guayaquil', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
        : 'Se revisan las noticias y verificaciones cada día (aún sin revisiones automáticas).'}{' '}
      Lo marcado así lo agregó una IA con cita textual comprobada; lo demás fue revisado a mano.
    </p>
  )
}
