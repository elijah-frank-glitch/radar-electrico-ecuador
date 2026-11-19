// Datos del sistema eléctrico ecuatoriano.
// Fuente primaria: CELEC EP / CENACE / MAE, tal como los publican la prensa y los
// monitores de cota. CNEL EP es la distribuidora: ejecuta los cortes, pero no
// publica la hidrología. Para actualizar, edita este archivo y vuelve a desplegar.

export const FECHA_CORTE = '2026-11-19'

export type Fuente = { medio: string; url: string; fecha: string }

export const fuentes: Record<string, Fuente> = {
  elcomercio19nov: {
    medio: 'El Comercio (monitor Hidro Info / CELEC)',
    url: 'https://www.elcomercio.com/actualidad/negocios/mazar-registra-nuevo-nivel-modifica-produccion-electrica-noviembre/',
    fecha: '2026-11-19',
  },
  primicias18nov: {
    medio: 'Primicias (datos Cenace)',
    url: 'https://www.primicias.ec/economia/ecuador-estiaje-sistema-electrico-fenomeno-nino-electricidad-colombia-137337/',
    fecha: '2026-11-18',
  },
  primiciasNoboa11nov: {
    medio: 'Primicias — entrevista a Daniel Noboa',
    url: 'https://www.primicias.ec/economia/daniel-noboa-ecuador-electricidad-colombia-cortes-luz-136899/',
    fecha: '2026-11-11',
  },
  primiciasCenaceAgo: {
    medio: 'Primicias — Plan de Operación Cenace',
    url: 'https://www.primicias.ec/economia/cenace-deficit-energia-electrica-estiaje-fenomeno-elnino-ecuador-apagones-129541/',
    fecha: '2026-08-11',
  },
  primiciasCenaceEne: {
    medio: 'Primicias — informe Cenace 2026-2030',
    url: 'https://www.primicias.ec/economia/proyeccion-sistema-electrico-crisis-embalse-mazar-caida-112842/',
    fecha: '2026-01-05',
  },
  primicias30sep: {
    medio: 'Primicias — Mazar y Coca Codo',
    url: 'https://www.primicias.ec/economia/ecuador-nueva-generacion-electrica-coca-codo-sinclair-estiaje-cortes-luz-mazar-celec-133740/',
    fecha: '2026-09-30',
  },
  expreso12oct: {
    medio: 'Expreso — Mazar en su cota más baja de 2026',
    url: 'https://www.expreso.ec/economia-y-negocios/mazar-registra-cota-baja-2026-10-metros-minimo-seguro-299007.html',
    fecha: '2026-10-12',
  },
  teleamazonas12oct: {
    medio: 'Teleamazonas — Mazar a menos de 10 m del nivel crítico',
    url: 'https://www.teleamazonas.com/actualidad/noticias/ecuador/embalse-mazar-caida-10-metros-nivel-critico-130132/',
    fecha: '2026-10-12',
  },
  eldiario4nov: {
    medio: 'El Diario — Mazar recupera casi 4 m en el feriado',
    url: 'https://www.eldiario.ec/ecuador/habra-menos-apagones-embalse-de-mazar-recupera-casi-cuatro-metros-durante-el-feriado-de-noviembre-04112026/',
    fecha: '2026-11-04',
  },
  elcomercio17nov: {
    medio: 'El Comercio — Mazar vuelve a perder agua',
    url: 'https://www.elcomercio.com/actualidad/negocios/embalse-mazar-vuelve-perder-agua-acerca-nivel-critico-17-noviembre/',
    fecha: '2026-11-17',
  },
  lupa: {
    medio: 'Lupa Media (verificación)',
    url: 'https://lupa.com.ec/verificaciones/gobierno-anuncia-cortes-energia/',
    fecha: '2026-03-04',
  },
  ecuadorChequea: {
    medio: 'Ecuador Chequea (verificación)',
    url: 'https://ecuadorchequea.com/apagones-ecuador-2026-gobierno-verificacion-falso-electricidad/',
    fecha: '2026-10-06',
  },
  prensaLatina2oct: {
    medio: 'Prensa Latina — Consejo Consultivo',
    url: 'https://www.prensa-latina.cu/2026/10/02/ecuador-expertos-sugieren-apagones-preventivos-por-crisis-energetica/',
    fecha: '2026-10-02',
  },
  prensaLatina29sep: {
    medio: 'Prensa Latina — Ecuador bajo amenaza de apagones',
    url: 'https://www.prensa-latina.cu/2026/09/29/ecuador-vuelve-a-estar-bajo-amenaza-de-apagones/',
    fecha: '2026-09-29',
  },
  gestion: {
    medio: 'Revista Gestión (Primicias) — Ecuador evita los apagones, pero paga el costo',
    url: 'https://www.primicias.ec/revistagestion/analisis/ecuador-evita-apagones-sigue-pagando-costo-crisis-electrica-que-resuelto-137185/',
    fecha: '2026-11',
  },
  vistazo18nov: {
    medio: 'Vistazo — CNEL restablece servicio en Guayas',
    url: 'https://www.vistazo.com/actualidad/2026-11-18-cnel-restablece-servicio-electrico-cuatro-cantones-guayas-falla-lineas-suministro-GB11327735',
    fecha: '2026-11-18',
  },
  eldiario12oct: {
    medio: 'El Diario — reclamos por cortes en Quito y Guayaquil',
    url: 'https://www.eldiario.ec/ecuador/cortes-de-luz-ecuador-apagones-quito-guayaquil-12102026/',
    fecha: '2026-10-12',
  },
  eluniversoMayo: {
    medio: 'El Universo — cortes por mantenimiento',
    url: 'https://www.eluniverso.com/noticias/economia/energia-ecuador-cortes-de-luz-mantenimiento-preventivo-fenomeno-el-nino-2026-nota/',
    fecha: '2026-05-28',
  },
  radioPichincha16nov: {
    medio: 'Radio Pichincha — déficit de potencia 16 nov',
    url: 'https://www.radiopichincha.com/deficit-de-potencia-fuerza-nuevos-apagones-en-ecuador-este-16-de-noviembre/',
    fecha: '2026-11-16',
  },
}

// Serie de cota del embalse de Mazar (msnm). "reportado" = cifra publicada;
// "estimado" = reconstruido a partir de variaciones publicadas (ver nota).
export type PuntoCota = { fecha: string; cota: number; tipo: 'reportado' | 'estimado'; nota?: string; fuente?: string }

export const serieMazar: PuntoCota[] = [
  { fecha: '2026-03-01', cota: 2152.4, tipo: 'reportado', nota: 'Embalse casi lleno (feb–mar)', fuente: 'lupa' },
  { fecha: '2026-09-01', cota: 2146.0, tipo: 'estimado', nota: 'Cayó >21 m en ~6 semanas hasta el 12-oct', fuente: 'teleamazonas12oct' },
  { fecha: '2026-09-29', cota: 2132.94, tipo: 'reportado', fuente: 'primicias30sep' },
  { fecha: '2026-10-02', cota: 2131.0, tipo: 'reportado', fuente: 'ecuadorChequea' },
  { fecha: '2026-10-12', cota: 2124.99, tipo: 'reportado', nota: 'Mínimo de 2026 hasta esa fecha', fuente: 'expreso12oct' },
  { fecha: '2026-10-27', cota: 2120.9, tipo: 'estimado', nota: 'Mínimo de octubre (≈7 m bajo la cota del 4-nov)', fuente: 'eldiario4nov' },
  { fecha: '2026-11-04', cota: 2127.9, tipo: 'reportado', nota: 'Recuperación por lluvias del feriado', fuente: 'eldiario4nov' },
  { fecha: '2026-11-08', cota: 2126.7, tipo: 'estimado', nota: 'Inicio de la caída de 5,32 m (8–17 nov)', fuente: 'elcomercio17nov' },
  { fecha: '2026-11-17', cota: 2121.4, tipo: 'estimado', fuente: 'elcomercio17nov' },
  { fecha: '2026-11-18', cota: 2120.79, tipo: 'reportado', fuente: 'elcomercio19nov' },
  { fecha: '2026-11-19', cota: 2120.01, tipo: 'reportado', nota: '−78 cm en 24 h; Mazar con una sola turbina', fuente: 'elcomercio19nov' },
]

export const umbrales = {
  maxima: 2153,
  critica: 2115, // sobre esta cota se evita turbinar del embalse para no arrastrar sedimentos
  minima: 2098, // apagado de la central
}

// Foto del sistema a la fecha de corte (valores usados para calibrar el modelo).
export const estadoActual = {
  cotaMazar: 2120.01,
  caudalMazar: 38.39, // m3/s afluente 19-nov 07:00
  generacionMazar: 58.47, // MW, una turbina
  amaluza: 1970.99, // msnm, bajo su mínimo operativo de 1975
  caudalCoca: 148, // m3/s, 18-nov 17:00 (necesita ~222 para operar normal)
  generacionCCS: 789, // MW promedio 18-nov
  demandaPromedioNov: 4166, // MW, 1–16 nov (Cenace)
  demandaPromedioNov2025: 3947,
  demandaPicoRecord: 5400, // MW, 10-nov 20:15
  generacionTotal: 4800, // MW aprox. (Ing. A. Jaya)
  generacionTermica: 1300,
  importacionMax: 380, // MW, límite actual de la interconexión (diseño 450)
  importacionPromedio: 210, // MW, 6–10 nov
  precioImportacion: 0.84, // USD/kWh 10-nov (1,02 el 6-nov) vs tarifa residencial 0,10
  aliviaIndustria: 380, // MW que se liberan desconectando industria (350–397 según fuente)
  deficitCenaceNov: 330.65, // GWh proyectados para noviembre (~450 MW)
  nuevaGeneracionPlan: 1092, // MW del plan
  nuevaGeneracionContratada: 155, // MW (14%)
}

export type Evento = { fecha: string; titulo: string; tipo: 'industrial' | 'residencial' | 'mantenimiento' | 'falla' | 'info'; detalle: string; fuente: string }

export const cronologia: Evento[] = [
  { fecha: '2026-01-22', titulo: 'Colombia suspende la venta de electricidad', tipo: 'info', detalle: 'Se pierden hasta 450 MW de respaldo. Se reanuda en agosto, se vuelve a restringir el 7-sep y se reactiva parcialmente el 16-oct.', fuente: 'primiciasNoboa11nov' },
  { fecha: '2026-03-04', titulo: 'Bulo: “cortes por estiaje” — falso', tipo: 'info', detalle: 'Mazar estaba casi lleno (≈2152 msnm). El MAE no había anunciado cortes.', fuente: 'lupa' },
  { fecha: '2026-05-30', titulo: 'Cortes por mantenimiento preventivo', tipo: 'mantenimiento', detalle: 'Fines de semana 30–31 may y 6–7 jun, ≤3–4 h por zona, una vez. No fueron por falta de agua.', fuente: 'eluniversoMayo' },
  { fecha: '2026-09-29', titulo: 'Desconexión obligatoria de industrias', tipo: 'industrial', detalle: '≈9.089 empresas de media y alta tensión: 48 h consecutivas por semana (meta ≈397 MW). Hogares y comercio exentos.', fuente: 'prensaLatina29sep' },
  { fecha: '2026-10-12', titulo: 'Se endurecen los cortes a la industria', tipo: 'industrial', detalle: 'De 48 a 72 h semanales. Mazar en 2124,99 msnm, mínimo del año hasta entonces.', fuente: 'expreso12oct' },
  { fecha: '2026-10-11', titulo: 'Apagones en Quito, Guayaquil, Chone', tipo: 'falla', detalle: 'EEQ los atribuyó a un cortocircuito; no se demostró que fueran racionamiento.', fuente: 'eldiario12oct' },
  { fecha: '2026-11-04', titulo: 'Lluvias: Mazar recupera ≈7 m', tipo: 'info', detalle: 'La cota sube a ≈2127,9 msnm. Las desconexiones industriales terminan antes de la 2.ª semana de noviembre.', fuente: 'eldiario4nov' },
  { fecha: '2026-11-10', titulo: 'Récord de demanda: 5.400 MW', tipo: 'info', detalle: 'Pico a las 20:15. La demanda de noviembre crece ≈5,5% interanual.', fuente: 'primiciasNoboa11nov' },
  { fecha: '2026-11-16', titulo: 'Racionamiento de emergencia por déficit de potencia', tipo: 'residencial', detalle: 'Cenace ordena cortes puntuales de emergencia desde las 15:30 (reportado por Radio Pichincha; alcance no confirmado por otras fuentes).', fuente: 'radioPichincha16nov' },
  { fecha: '2026-11-19', titulo: 'Mazar en 2120,01 msnm (−78 cm/día)', tipo: 'info', detalle: 'A 5 m de la cota crítica; Amaluza bajo su mínimo; Coca Codo al 53%.', fuente: 'elcomercio19nov' },
]
