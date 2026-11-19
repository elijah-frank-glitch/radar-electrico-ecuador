import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo, sirve /api/datos con la misma función que usa Vercel en producción.
function apiLocal(): Plugin {
  return {
    name: 'api-local',
    configureServer(server) {
      server.middlewares.use('/api/datos', async (_req, res) => {
        try {
          const mod = await server.ssrLoadModule('/api/datos.ts')
          const r: Response = await mod.GET()
          res.statusCode = r.status
          r.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(await r.text())
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ errores: [String(e)] }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), apiLocal()],
})
