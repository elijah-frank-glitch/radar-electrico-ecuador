import autoJson from './auto/opiniones.json'
import type { AutoOpiniones } from './auto/tipos'

export type Veredicto = 'bulo' | 'enganoso' | 'malentendido' | 'demostrado' | 'no-demostrado'

export const VEREDICTOS: Record<Veredicto, { etiqueta: string; desc: string }> = {
  bulo: { etiqueta: 'Bulo', desc: 'Falso: contradicho por datos o por la fuente original.' },
  enganoso: { etiqueta: 'Engañoso', desc: 'Tiene una parte cierta, pero la conclusión no se sigue.' },
  malentendido: { etiqueta: 'Se entiende mal', desc: 'El dato es real, pero se interpreta de forma equivocada.' },
  demostrado: { etiqueta: 'Demostrado', desc: 'Respaldado por datos oficiales o estudios.' },
  'no-demostrado': { etiqueta: 'No demostrado', desc: 'Puede ser cierto, pero no hay evidencia suficiente.' },
}

export type Mito = {
  afirmacion: string
  veredicto: Veredicto
  base: 'datos' | 'estudios' | 'opiniones' | 'verificadores'
  explicacion: string
  fuentes: { medio: string; url: string }[]
  auto?: { agregado: string; cita: string }
}

export const mitosBase: Mito[] = [
  {
    afirmacion: '“El Gobierno anunció apagones de 2 horas en todo el país.”',
    veredicto: 'enganoso',
    base: 'verificadores',
    explicacion: 'Ecuador Chequea lo calificó como engañoso. Un video de TikTok tomó una propuesta del Consejo Consultivo de Ingenierías (cortes preventivos de madrugada) y la presentó como anuncio oficial, con la foto del presidente. El Gobierno no lo anunció.',
    fuentes: [{ medio: 'Ecuador Chequea, 6-oct-2026', url: 'https://ecuadorchequea.com/apagones-ecuador-2026-gobierno-verificacion-falso-electricidad/' }],
  },
  {
    afirmacion: '“En marzo vuelven los cortes por estiaje.”',
    veredicto: 'bulo',
    base: 'verificadores',
    explicacion: 'En marzo de 2026 Mazar estaba casi lleno (≈2152 msnm) y el MAE no había anunciado cortes. Lupa lo calificó como completamente falso.',
    fuentes: [{ medio: 'Lupa Media, 4-mar-2026', url: 'https://lupa.com.ec/verificaciones/gobierno-anuncia-cortes-energia/' }],
  },
  {
    afirmacion: '“Hay superávit eléctrico; no existe riesgo de apagones.”',
    veredicto: 'enganoso',
    base: 'datos',
    explicacion: 'El margen de “más de 200 MW” que menciona el Gobierno se consiguió desconectando a cientos de industrias y vaciando Mazar. Cenace proyectó un déficit de hasta 330 GWh para noviembre, y el 16-nov hubo racionamiento de emergencia. Que no haya cortes a hogares no significa que no haya déficit.',
    fuentes: [
      { medio: 'Revista Gestión', url: 'https://www.primicias.ec/revistagestion/analisis/ecuador-evita-apagones-sigue-pagando-costo-crisis-electrica-que-resuelto-137185/' },
      { medio: 'Primicias (Cenace)', url: 'https://www.primicias.ec/economia/cenace-deficit-energia-electrica-estiaje-fenomeno-elnino-ecuador-apagones-129541/' },
    ],
  },
  {
    afirmacion: '“Las lluvias de noviembre ya solucionaron la crisis.”',
    veredicto: 'bulo',
    base: 'datos',
    explicacion: 'Mazar recuperó ≈7 m hasta el 4-nov, pero entre el 8 y el 17-nov perdió 5,32 m y el 19-nov bajó 78 cm en un solo día. Está a 5 m de la cota crítica (2115 msnm).',
    fuentes: [
      { medio: 'El Comercio, 19-nov', url: 'https://www.elcomercio.com/actualidad/negocios/mazar-registra-nuevo-nivel-modifica-produccion-electrica-noviembre/' },
      { medio: 'El Comercio, 17-nov', url: 'https://www.elcomercio.com/actualidad/negocios/embalse-mazar-vuelve-perder-agua-acerca-nivel-critico-17-noviembre/' },
    ],
  },
  {
    afirmacion: '“Si Colombia nos corta, nos quedamos a oscuras.”',
    veredicto: 'malentendido',
    base: 'datos',
    explicacion: 'La interconexión hoy da como máximo 380 MW (<8% del pico de 5.400 MW) y en noviembre promedió ≈210 MW, a precios de 0,84–1,02 USD/kWh. Pesa en el margen y en el costo, pero por sí sola no apaga al país. Lo decisivo es Mazar y Coca Codo.',
    fuentes: [{ medio: 'Primicias, 11-nov', url: 'https://www.primicias.ec/economia/daniel-noboa-ecuador-electricidad-colombia-cortes-luz-136899/' }],
  },
  {
    afirmacion: '“Coca Codo Sinclair produce 1.500 MW y nos salva.”',
    veredicto: 'malentendido',
    base: 'datos',
    explicacion: '1.500 MW es la capacidad instalada. Es una central de pasada: con 148 m³/s (necesita ≈222) generó en promedio 789 MW el 18-nov, el 53%. Además se detiene por sedimentos (33 paros en 2025).',
    fuentes: [{ medio: 'Primicias, 18-nov', url: 'https://www.primicias.ec/economia/ecuador-estiaje-sistema-electrico-fenomeno-nino-electricidad-colombia-137337/' }],
  },
  {
    afirmacion: '“Desconectar a la industria evita cualquier apagón a los hogares.”',
    veredicto: 'enganoso',
    base: 'datos',
    explicacion: 'Desconectar industria libera ≈350–400 MW. Si Mazar llega a 2115 msnm y Paute pasa a operar a filo de agua, el sistema pierde del orden de 600–900 MW en hora pico: la industria sola no alcanza.',
    fuentes: [{ medio: 'Primicias (Ing. A. Jaya)', url: 'https://www.primicias.ec/economia/ecuador-estiaje-sistema-electrico-fenomeno-nino-electricidad-colombia-137337/' }],
  },
  {
    afirmacion: '“Cuando Mazar llega a la cota crítica, empiezan los cortes a hogares.”',
    veredicto: 'demostrado',
    base: 'datos',
    explicacion: 'Es el precedente de 2024: al llegar a 2115 msnm se impusieron cortes programados. Técnicamente, bajo esa cota se deja de turbinar el embalse para no arrastrar sedimentos. No es automático, pero es el principal detonante.',
    fuentes: [{ medio: 'Primicias, 18-nov', url: 'https://www.primicias.ec/economia/ecuador-estiaje-sistema-electrico-fenomeno-nino-electricidad-colombia-137337/' }],
  },
  {
    afirmacion: '“El Niño trae lluvias, así que habrá más agua para las hidroeléctricas.”',
    veredicto: 'malentendido',
    base: 'estudios',
    explicacion: 'El Niño aumenta las lluvias en la Costa, pero las grandes centrales (Paute, Coca Codo) están en cuencas de la vertiente amazónica, donde tiende a reducir caudales. Además, El Niño seca a Colombia, que deja de exportar. NOAA estimaba 63% de probabilidad de un Niño muy fuerte entre nov-2026 y ene-2027.',
    fuentes: [{ medio: 'Primicias — Colombia y El Niño', url: 'https://www.primicias.ec/economia/fenomeno-nino-incierta-venta-electricidad-colombia-noviembre-estiaje-cortes-luz-apagones-126202/' }],
  },
  {
    afirmacion: '“Los apagones del 11–12 de octubre en Quito fueron racionamiento encubierto.”',
    veredicto: 'no-demostrado',
    base: 'datos',
    explicacion: 'La Empresa Eléctrica Quito los atribuyó a un cortocircuito durante obras (el Metro lo negó). No hay evidencia publicada de que fueran cortes por déficit.',
    fuentes: [{ medio: 'El Diario, 12-oct', url: 'https://www.eldiario.ec/ecuador/cortes-de-luz-ecuador-apagones-quito-guayaquil-12102026/' }],
  },
  {
    afirmacion: '“Los cortes de mayo–junio fueron por falta de agua.”',
    veredicto: 'bulo',
    base: 'datos',
    explicacion: 'Fueron mantenimientos preventivos programados (≤3–4 h, una vez por zona) antes de El Niño. Los embalses estaban altos.',
    fuentes: [{ medio: 'El Universo, 28-may', url: 'https://www.eluniverso.com/noticias/economia/energia-ecuador-cortes-de-luz-mantenimiento-preventivo-fenomeno-el-nino-2026-nota/' }],
  },
  {
    afirmacion: '“El problema es solo la sequía; no es de planificación.”',
    veredicto: 'enganoso',
    base: 'estudios',
    explicacion: 'Cenace pedía 866–1.092 MW de generación firme nueva; a noviembre solo se había contratado ≈155 MW (14%). La demanda crece ≈5–14% anual y desde 2017 no entra potencia firme relevante. La sequía detona la crisis, pero la falta de reserva es estructural.',
    fuentes: [
      { medio: 'Revista Gestión', url: 'https://www.primicias.ec/revistagestion/analisis/ecuador-evita-apagones-sigue-pagando-costo-crisis-electrica-que-resuelto-137185/' },
      { medio: 'Primicias (Cenace, ene-2026)', url: 'https://www.primicias.ec/economia/proyeccion-sistema-electrico-crisis-embalse-mazar-caida-112842/' },
    ],
  },
]

const auto = autoJson as AutoOpiniones
export const mitos: Mito[] = [
  ...mitosBase,
  ...auto.mitos
    .filter((a) => !mitosBase.some((b) => b.fuentes.some((f) => f.url === a.url)))
    .map((a) => ({
      afirmacion: a.afirmacion,
      veredicto: a.veredicto,
      base: a.base,
      explicacion: a.explicacion,
      fuentes: [{ medio: a.medio, url: a.url }],
      auto: { agregado: a.agregado, cita: a.cita },
    })),
]
