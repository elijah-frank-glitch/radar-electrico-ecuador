# Radar Eléctrico Ecuador

Web-app interactiva e independiente sobre el estado de las hidroeléctricas de Ecuador y la probabilidad de apagones.

- **Pronóstico cuantitativo:** simulación Monte Carlo (2.500 trayectorias, 60 días) del balance de potencia en hora pico: Mazar/Paute, Coca Codo Sinclair, otras hidro, térmica, importación de Colombia y demanda. Probabilidades a 3, 7, 14, 30 y 60 días en 4 niveles: sin apagones · solo industria · cortes residenciales · generalizado. Incluye regresión de la tendencia de la cota de Mazar con IC 95%.
- **Pronóstico cualitativo:** registro de pronósticos públicos de expertos, gobierno e instituciones, calificados contra lo ocurrido (precisión, Brier, acierto bayesiano), consenso ponderado por historial y regresión logística de qué tipo de pronóstico acierta.
- **Mitos y bulos:** afirmaciones que circulan, con veredicto y fuente (datos, estudios, verificadores).

No está afiliado a CNEL EP, CELEC EP, CENACE ni al Ministerio de Ambiente y Energía. Los datos son cifras oficiales publicadas por esas entidades y recogidas por la prensa; cada dato enlaza a su fuente.

## Actualizar los datos

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
