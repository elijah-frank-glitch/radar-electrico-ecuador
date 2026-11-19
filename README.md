# Radar Eléctrico Ecuador

Web-app interactiva e independiente sobre el estado de las hidroeléctricas de Ecuador y la probabilidad de apagones.

- **Pronóstico cuantitativo:** simulación Monte Carlo (2.500 trayectorias, 60 días) del balance de potencia en hora pico: Mazar/Paute, Coca Codo Sinclair, otras hidro, térmica, importación de Colombia y demanda. Probabilidades a 3, 7, 14, 30 y 60 días en 4 niveles: sin apagones · solo industria · cortes residenciales · generalizado. Incluye regresión de la tendencia de la cota de Mazar con IC 95%.
- **Pronóstico cualitativo:** registro de pronósticos públicos de expertos, gobierno e instituciones, calificados contra lo ocurrido (precisión, Brier, acierto bayesiano), consenso ponderado por historial y regresión logística de qué tipo de pronóstico acierta.
- **Mitos y bulos:** afirmaciones que circulan, con veredicto y fuente (datos, estudios, verificadores).

No está afiliado a CNEL EP, CELEC EP, CENACE ni al Ministerio de Ambiente y Energía. Los datos son cifras oficiales publicadas por esas entidades y recogidas por la prensa; cada dato enlaza a su fuente.

## Datos en vivo (botón "Actualizar datos")

La app llama a `/api/datos` (función serverless en `api/datos.ts`) al abrirse y cada vez que alguien pulsa **↻ Actualizar datos**:

- **CENACE – Información Operativa** (oficial, cada 30 min): producción promedio por central, demanda máxima, importación de Colombia y pico térmico.
- **Última cota de Mazar**: del reporte más reciente de El Comercio (CELEC no la publica en formato abierto).

Con esos datos se ajustan los supuestos del modelo (cota inicial, caudal efectivo de Coca Codo, demanda pico, probabilidad de importación, capacidad térmica) y se vuelve a simular. La respuesta se guarda 30 min en la CDN de Vercel, así que muchos clics no saturan a las fuentes. Si una fuente falla, se usan los datos guardados.

## Expertos y mitos automáticos

El workflow [`.github/workflows/actualizar-opiniones.yml`](.github/workflows/actualizar-opiniones.yml) corre cada día a las 08:00 (Ecuador) y ejecuta `scripts/actualizar-opiniones.ts`:

1. Junta las notas de los últimos 10 días sobre electricidad/apagones de El Comercio, Primicias, Lupa Media y Ecuador Chequea.
2. Claude (`claude-opus-5-5`, salida JSON estructurada) propone pronósticos nuevos, posturas actuales, recalificaciones de pronósticos pendientes y mitos verificados.
3. Controles en código: la URL debe ser una nota leída, la **cita textual debe aparecer literalmente** en ella, solo se recalifican pronósticos pendientes, máximos por día, sin duplicados.
4. Guarda el resultado en `src/data/auto/opiniones.json`, hace commit y Vercel redespliega. En la web, todo lo agregado así lleva la etiqueta **⚙ automático** con la cita.

**Para activarlo** hay que agregar el secreto `ANTHROPIC_API_KEY` al repositorio (Settings → Secrets and variables → Actions). Sin el secreto, el workflow termina sin cambios. Costo estimado: unos centavos de dólar por día (≈10 notas por corrida).

Pruebas locales: `npm run actualizar:opiniones -- --prueba` (solo junta notas) o `SALIDA_SIMULADA=archivo.json npm run actualizar:opiniones` (prueba los controles sin llamar a la API).

## Actualizar los datos guardados

1. `src/data/sistema.ts`: fecha de corte, serie de cota de Mazar, estado actual (caudales, MW, demanda) y cronología.
2. `src/data/expertos.ts`: nuevos pronósticos y su calificación (1 / 0.5 / 0 / null).
3. `src/data/mitos.ts`: nuevas afirmaciones y su veredicto.
4. `src/model/simulacion.ts`: `PARAMS_BASE.cotaInicial` y supuestos del modelo.

```bash
npm install
npm run dev     # desarrollo
npm run build   # producción (dist/)
```

Desplegado en Vercel (Vite, sin configuración adicional).
