// Registro de pronósticos públicos sobre apagones en Ecuador (2026) y su verificación.
// Calificación: 1 = acertó, 0.5 = parcial, 0 = falló, null = pendiente o no falsable.
// La calificación es una evaluación propia de este sitio con base en lo ocurrido hasta FECHA_CORTE;
// cada ítem enlaza a la fuente para que cualquiera pueda revisarla.

export type Tipo = 'experto' | 'gobierno' | 'institucion'

export type Prediccion = {
  fecha: string
  dice: string // paráfrasis del pronóstico
  ocurrio: string // qué pasó realmente
  nota: number | null
  especificidad: 1 | 2 | 3 // 1 = vago, 2 = con plazo o condición, 3 = cuantitativo con plazo
  url: string
}

export type Fuente = {
  id: string
  nombre: string
  rol: string
  tipo: Tipo
  conflictoInteres: boolean // tiene incentivo político/institucional para minimizar o exagerar
  postura: string // postura más reciente
  pResidencial30: number // probabilidad implícita (estimada por este sitio) de cortes residenciales programados en 30 días según su postura actual
  predicciones: Prediccion[]
}

const U = {
  infobaeAlvear: 'https://www.infobae.com/america/america-latina/2026/01/08/desde-marzo-podrian-empezar-los-apagones-en-ecuador-si-no-se-corrige-el-rumbo-advirtio-experto-energetico/',
  metroArias: 'https://www.metroecuador.com.ec/noticias/2026/01/12/ecuador-no-tendria-apagones-este-ano-experto-explica-el-escenario-energetico/',
  teleArias: 'https://www.teleamazonas.com/actualidad/noticias/economia/expertos-advierten-30-mw-recuperados-no-evitan-riesgo-apagones-ecuador-130191/',
  correo: 'https://diariocorreo.com.ec/126097/portada/volveran-los-racionamientos-de-energia-en-2026-expertos-advierten-un-escenario-critico-para-ecuador',
  primiciasEne: 'https://www.primicias.ec/economia/proyeccion-sistema-electrico-crisis-embalse-mazar-caida-112842/',
  prensaLatina2oct: 'https://www.prensa-latina.cu/2026/10/02/ecuador-expertos-sugieren-apagones-preventivos-por-crisis-energetica/',
  prensaLatina29sep: 'https://www.prensa-latina.cu/2026/09/29/ecuador-vuelve-a-estar-bajo-amenaza-de-apagones/',
  eldiario25sep: 'https://www.eldiario.ec/ecuador/vuelven-los-apagones-la-crisis-energetica-en-ecuador-no-se-soluciona-con-parches-dicen-expertos-25092026/',
  lupa: 'https://lupa.com.ec/verificaciones/gobierno-anuncia-cortes-energia/',
  chequea: 'https://ecuadorchequea.com/apagones-ecuador-2026-gobierno-verificacion-falso-electricidad/',
  primiciasCenaceAgo: 'https://www.primicias.ec/economia/cenace-deficit-energia-electrica-estiaje-fenomeno-elnino-ecuador-apagones-129541/',
  primicias18nov: 'https://www.primicias.ec/economia/ecuador-estiaje-sistema-electrico-fenomeno-nino-electricidad-colombia-137337/',
  primiciasOdiadores: 'https://www.primicias.ec/economia/daniel-noboa-presidente-cortes-luz-ecuador-generacion-electrica-empresas-134171/',
  larepublicaNoboa: 'https://www.larepublica.co/globoeconomia/presidente-noboa-garantiza-que-en-ecuador-no-habra-mas-apagones-en-2025-y-2026-4065813',
  extraCalvet: 'https://www.extra.ec/noticia/tecnologia/habra-nuevos-apagones-ecuador-2026-experto-explica-riesgos-posibles-soluciones-164638.html',
  gestion: 'https://www.primicias.ec/revistagestion/analisis/ecuador-evita-apagones-sigue-pagando-costo-crisis-electrica-que-resuelto-137185/',
}

export const fuentesOpinion: Fuente[] = [
  {
    id: 'salinas',
    nombre: 'Fernando Salinas',
    rol: 'Presidente del Foro Energético Ecuador',
    tipo: 'experto',
    conflictoInteres: false,
    postura: 'Mazar se agotaría a fines de octubre y habría restricciones en noviembre–diciembre; no hay solución de corto plazo.',
    pResidencial30: 0.6,
    predicciones: [
      { fecha: '2026-03-04', dice: 'Las bajas de caudal de febrero–marzo son normales para la época; no justifican cortes.', ocurrio: 'No hubo cortes por estiaje en marzo–mayo; Mazar estaba casi lleno.', nota: 1, especificidad: 2, url: U.lupa },
      { fecha: '2026-09-29', dice: 'Mazar se consumirá hasta finales de octubre; noviembre y diciembre tendrán restricciones.', ocurrio: 'Mazar tocó ≈2121 msnm a fines de octubre; en noviembre hubo cortes industriales y racionamientos de emergencia.', nota: 1, especificidad: 3, url: U.prensaLatina29sep },
    ],
  },
  {
    id: 'acuna',
    nombre: 'Marco Acuña',
    rol: 'Consejo Consultivo de Ingenierías y Economía (CCIE)',
    tipo: 'experto',
    conflictoInteres: false,
    postura: 'Mazar baja 0,8–0,9 m/día sin lluvias; llegar a la cota crítica no implica apagón automático.',
    pResidencial30: 0.55,
    predicciones: [
      { fecha: '2026-10-02', dice: 'Si sigue sin llover, Mazar baja 0,8–0,9 m/día y llega a 2115 en 17–18 días.', ocurrio: 'La tasa fue correcta hasta el 12-oct (−6 m en 10 días); las lluvias de fines de octubre evitaron la cota crítica. Condición no cumplida.', nota: 0.5, especificidad: 3, url: U.prensaLatina2oct },
      { fecha: '2026-08-11', dice: 'Los 30 MW de Esmeraldas III no deberían contarse en el plan de expansión.', ocurrio: 'El plan quedó en 155 de 1.092 MW contratados; la térmica comprometida no llegó a tiempo.', nota: 1, especificidad: 2, url: U.primiciasCenaceAgo },
    ],
  },
  {
    id: 'hidalgo',
    nombre: 'Jorge Luis Hidalgo',
    rol: 'Experto energético',
    tipo: 'experto',
    conflictoInteres: false,
    postura: 'No habrá apagones residenciales en 2026, pero solo gracias a parches caros (barcazas, Colombia a ~0,89 USD/kWh).',
    pResidencial30: 0.3,
    predicciones: [
      { fecha: '2026-09-25', dice: 'No habrá apagones (a hogares) en 2026, aunque a un costo muy alto.', ocurrio: 'Hasta el 19-nov no hubo cortes residenciales programados; sí cortes industriales y racionamientos de emergencia puntuales.', nota: 0.5, especificidad: 2, url: U.eldiario25sep },
    ],
  },
  {
    id: 'buitron',
    nombre: 'Ricardo Buitrón',
    rol: 'Ingeniero hidráulico, consultor eléctrico (CCIE)',
    tipo: 'experto',
    conflictoInteres: false,
    postura: 'Colombia no priorizará exportar; Mazar puede llegar a su mínimo en semanas.',
    pResidencial30: 0.6,
    predicciones: [
      { fecha: '2026-01-05', dice: 'El estiaje en Mazar ya empezó; déficit de 300–400 MW aun importando, si la sequía sigue hasta marzo.', ocurrio: 'Llovió: en febrero–marzo Mazar estaba casi lleno y no hubo déficit.', nota: 0, especificidad: 3, url: U.primiciasEne },
      { fecha: '2026-10-02', dice: 'Mazar podría llegar a su nivel mínimo operativo en pocas semanas.', ocurrio: 'Quedó a ≈6 m de la cota crítica a fines de octubre, luego se recuperó; hoy vuelve a estar a 5 m.', nota: 0.5, especificidad: 2, url: U.prensaLatina2oct },
    ],
  },
  {
    id: 'arias',
    nombre: 'Pablo Arias',
    rol: 'Ingeniero eléctrico y académico',
    tipo: 'experto',
    conflictoInteres: false,
    postura: 'Racionamiento posible si la hidrología sigue baja; propone cortes nocturnos 22:00–04:00.',
    pResidencial30: 0.6,
    predicciones: [
      { fecha: '2026-01-12', dice: 'Ecuador no tendría apagones este año, aunque el sistema sigue frágil.', ocurrio: 'Hubo desconexiones industriales desde el 29-sep y racionamientos de emergencia en noviembre.', nota: 0.5, especificidad: 2, url: U.metroArias },
      { fecha: '2026-10-12', dice: 'El racionamiento podría empezar la última semana de octubre.', ocurrio: 'Llovió a fines de octubre; no hubo racionamiento residencial programado en esa semana.', nota: 0, especificidad: 3, url: U.teleArias },
    ],
  },
  {
    id: 'alvear',
    nombre: 'José Alvear',
    rol: 'Analista energético',
    tipo: 'experto',
    conflictoInteres: false,
    postura: 'Sin cambios estructurales vuelven los apagones; la política actual solo “compra tiempo”.',
    pResidencial30: 0.65,
    predicciones: [
      { fecha: '2026-01-08', dice: 'Desde marzo de 2026 podrían empezar los apagones si no se corrige el rumbo.', ocurrio: 'No hubo apagones por estiaje en marzo–agosto. Los problemas llegaron en septiembre.', nota: 0, especificidad: 3, url: U.infobaeAlvear },
    ],
  },
  {
    id: 'polo',
    nombre: 'Rodrigo Polo',
    rol: 'Experto energético',
    tipo: 'experto',
    conflictoInteres: false,
    postura: 'Déficit estructural de 500–800 MW; depende de que Paute y Coca Codo operen normal.',
    pResidencial30: 0.6,
    predicciones: [
      { fecha: '2026-01-08', dice: 'El racionamiento podría empezar en 3–4 meses (abril–mayo) si no cambian las condiciones.', ocurrio: 'No hubo racionamiento en abril–mayo; solo cortes por mantenimiento en mayo–junio.', nota: 0, especificidad: 3, url: U.correo },
    ],
  },
  {
    id: 'fernandez',
    nombre: 'Byron Fernández',
    rol: 'Colegio de Ingenieros Eléctricos de El Oro',
    tipo: 'experto',
    conflictoInteres: false,
    postura: 'Los apagones están “muy cerca” si no llueve lo suficiente.',
    pResidencial30: 0.55,
    predicciones: [
      { fecha: '2026-01-08', dice: 'Los apagones están muy cerca de volver si las lluvias no alcanzan (sin fecha).', ocurrio: 'Sin plazo: no se puede verificar.', nota: null, especificidad: 1, url: U.correo },
    ],
  },
  {
    id: 'ccie',
    nombre: 'Consejo Consultivo (CCIE) — Gladys Pijal',
    rol: 'Gremio de ingenieros y economistas',
    tipo: 'institucion',
    conflictoInteres: false,
    postura: 'Recomienda cortes preventivos de 2 h en la madrugada; advierte que los cortes podrían llegar a hogares.',
    pResidencial30: 0.6,
    predicciones: [
      { fecha: '2026-10-12', dice: 'Si Mazar sigue bajando, los cortes podrían llegar a los hogares.', ocurrio: 'Condicional; Mazar subió y luego volvió a bajar. Pendiente.', nota: null, especificidad: 1, url: U.prensaLatina2oct },
    ],
  },
  {
    id: 'cenace',
    nombre: 'CENACE',
    rol: 'Operador Nacional de Electricidad',
    tipo: 'institucion',
    conflictoInteres: true,
    postura: 'Noviembre de 2026 es el mes más crítico del estiaje; déficit de hasta 330 GWh (≈450 MW) si no entra nueva generación.',
    pResidencial30: 0.5,
    predicciones: [
      { fecha: '2026-01-05', dice: 'Riesgo de déficit de 17% para oct-2026–mar-2027; faltan 866 MW firmes.', ocurrio: 'Probabilístico; el déficit se materializó en sep–nov. Consistente.', nota: 0.5, especificidad: 3, url: U.primiciasEne },
      { fecha: '2026-08-11', dice: 'Noviembre será el mes más fuerte del estiaje, con déficit de hasta 330,65 GWh.', ocurrio: 'Noviembre trae récord de demanda, déficit de potencia y racionamiento de emergencia.', nota: 1, especificidad: 3, url: U.primiciasCenaceAgo },
      { fecha: '2026-08-11', dice: 'Con el cronograma de nueva generación, el riesgo de déficit sería solo 2%.', ocurrio: 'El cronograma no se cumplió (14% contratado); el déficit apareció.', nota: 0, especificidad: 3, url: U.primiciasCenaceAgo },
    ],
  },
  {
    id: 'noboa',
    nombre: 'Daniel Noboa',
    rol: 'Presidente de la República',
    tipo: 'gobierno',
    conflictoInteres: true,
    postura: 'No habrá cortes para los hogares; la industria absorbió el ajuste y queda un margen >200 MW.',
    pResidencial30: 0.1,
    predicciones: [
      { fecha: '2025', dice: 'No habrá más apagones en 2025 ni en 2026.', ocurrio: 'En 2026 hubo desconexiones obligatorias para ≈9.000 industrias y racionamientos de emergencia.', nota: 0, especificidad: 2, url: U.larepublicaNoboa },
      { fecha: '2026-10-05', dice: 'Ninguna familia ecuatoriana tendrá cortes de luz.', ocurrio: 'No hubo cortes residenciales programados, pero sí racionamientos de emergencia puntuales (16-nov). Parcial.', nota: 0.5, especificidad: 2, url: U.chequea },
      { fecha: '2026-11-11', dice: 'Ecuador necesita la electricidad de Colombia solo 3–4 semanas más.', ocurrio: 'Pendiente (vence a mediados de diciembre).', nota: null, especificidad: 3, url: 'https://www.primicias.ec/economia/daniel-noboa-ecuador-electricidad-colombia-cortes-luz-136899/' },
    ],
  },
  {
    id: 'gobierno',
    nombre: 'Ministerio de Ambiente y Energía / Gobierno',
    rol: 'Ministros Natalie Morillo, Juan Carlos Blum y vocería oficial',
    tipo: 'gobierno',
    conflictoInteres: true,
    postura: 'Los cortes son solo para la industria; nadie puede garantizar que no haya cortes.',
    pResidencial30: 0.2,
    predicciones: [
      { fecha: '2026-01-08', dice: 'No habrá apagones en 2026 (ministra Morillo).', ocurrio: 'Hubo desconexiones industriales masivas desde el 29-sep y racionamientos de emergencia.', nota: 0, especificidad: 2, url: U.infobaeAlvear },
      { fecha: '2026-03-04', dice: 'No hay cortes por estiaje anunciados; el sistema es estable (marzo).', ocurrio: 'Correcto para ese momento: no hubo cortes por estiaje en marzo.', nota: 1, especificidad: 2, url: U.lupa },
      { fecha: '2026-09-25', dice: 'Nadie puede garantizar que no habrá cortes; se protegerá a hogares y comercio (Blum).', ocurrio: 'Coherente con lo ocurrido: cortes industriales, hogares protegidos salvo emergencias puntuales.', nota: 1, especificidad: 1, url: U.chequea },
    ],
  },
  {
    id: 'calvet',
    nombre: 'Roberto Gómez-Calvet',
    rol: 'Universidad Europea',
    tipo: 'experto',
    conflictoInteres: false,
    postura: 'Depender del agua no implica apagones; la escasez se ve venir con días o semanas de anticipación.',
    pResidencial30: 0.4,
    predicciones: [
      { fecha: '2026-10-13', dice: 'Las medidas podrían reducir el déficit, pero no eliminarlo si Colombia deja de vender.', ocurrio: 'General; no tiene plazo verificable.', nota: null, especificidad: 1, url: U.extraCalvet },
    ],
  },
]

// --- Puntuación ---
// Acierto bayesiano con prior Beta(1,1): (aciertos + 1) / (n + 2). Penaliza muestras chicas.
// Peso = acierto posterior × factor de especificidad × factor de conflicto de interés.
export function puntuar(f: Fuente) {
  const verificables = f.predicciones.filter((p) => p.nota !== null)
  const n = verificables.length
  const aciertos = verificables.reduce((s, p) => s + (p.nota as number), 0)
  const precisionBruta = n ? aciertos / n : null
  const posterior = (aciertos + 1) / (n + 2)
  const especMedia = f.predicciones.reduce((s, p) => s + p.especificidad, 0) / f.predicciones.length
  const fEspec = 0.6 + 0.2 * (especMedia - 1) // 0,6 (vago) … 1,0 (cuantitativo)
  const fConflicto = f.conflictoInteres ? 0.75 : 1
  const peso = posterior * fEspec * fConflicto
  // Brier: compara la nota con una predicción "segura" (1). Menor es mejor.
  const brier = n ? verificables.reduce((s, p) => s + (1 - (p.nota as number)) ** 2, 0) / n : null
  return { n, aciertos, precisionBruta, posterior, especMedia, fEspec, fConflicto, peso, brier }
}

export function consensoPonderado(fs: Fuente[]) {
  const filas = fs.map((f) => ({ f, s: puntuar(f) }))
  const W = filas.reduce((a, x) => a + x.s.peso, 0)
  const ponderado = filas.reduce((a, x) => a + x.s.peso * x.f.pResidencial30, 0) / W
  const simple = fs.reduce((a, f) => a + f.pResidencial30, 0) / fs.length
  return { ponderado, simple, filas }
}

// Regresión logística simple (1 variable) sobre todas las predicciones verificables:
// ¿la especificidad y el conflicto de interés explican el acierto?
export function regresionAcierto(fs: Fuente[]) {
  const X: number[][] = []
  const y: number[] = []
  for (const f of fs)
    for (const p of f.predicciones)
      if (p.nota !== null) {
        X.push([1, p.especificidad, f.conflictoInteres ? 1 : 0, f.tipo === 'experto' ? 1 : 0])
        y.push(p.nota)
      }
  // Descenso de gradiente con regularización L2 (muestra pequeña)
  let w = [0, 0, 0, 0]
  const lr = 0.1
  const lambda = 0.1
  for (let it = 0; it < 4000; it++) {
    const g = [0, 0, 0, 0]
    for (let i = 0; i < X.length; i++) {
      const z = X[i].reduce((s, x, j) => s + x * w[j], 0)
      const pr = 1 / (1 + Math.exp(-z))
      for (let j = 0; j < 4; j++) g[j] += (pr - y[i]) * X[i][j]
    }
    w = w.map((wj, j) => wj - lr * (g[j] / X.length + (j > 0 ? lambda * wj : 0)))
  }
  return { coef: { intercepto: w[0], especificidad: w[1], conflicto: w[2], esExperto: w[3] }, n: X.length }
}
