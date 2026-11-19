// Formato de src/data/auto/opiniones.json, que escribe a diario scripts/actualizar-opiniones.ts.
// Todo lo que entra aquí lo propuso un modelo de IA a partir de una noticia y pasó controles
// automáticos (la cita textual existe en el artículo, la URL es una de las leídas, límites por día).

export type TipoFuente = 'experto' | 'gobierno' | 'institucion'

export type AutoFuenteNueva = { id: string; nombre: string; rol: string; tipo: TipoFuente; conflictoInteres: boolean }

export type AutoPrediccion = {
  fuenteId: string
  fecha: string
  dice: string
  cita: string
  url: string
  especificidad: 1 | 2 | 3
  agregado: string
}

export type AutoReevaluacion = {
  fuenteId: string
  dice: string // texto exacto de la predicción pendiente
  nota: 0 | 0.5 | 1
  ocurrio: string
  url: string
  agregado: string
}

export type AutoPostura = { fuenteId: string; postura: string; pResidencial30: number; cita: string; url: string; agregado: string }

export type AutoMito = {
  afirmacion: string
  veredicto: 'bulo' | 'enganoso' | 'malentendido' | 'demostrado' | 'no-demostrado'
  base: 'datos' | 'estudios' | 'opiniones' | 'verificadores'
  explicacion: string
  medio: string
  url: string
  cita: string
  agregado: string
}

export type AutoOpiniones = {
  actualizado: string | null
  modelo: string | null
  revisados: string[]
  fuentesNuevas: AutoFuenteNueva[]
  predicciones: AutoPrediccion[]
  reevaluaciones: AutoReevaluacion[]
  posturas: AutoPostura[]
  mitos: AutoMito[]
}
