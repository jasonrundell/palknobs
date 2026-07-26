import path from 'node:path'
import type { Server } from 'node:http'
import { fileURLToPath } from 'node:url'
import { createApp } from './app.js'
import { getPalServerRoot, getSettingsPath, initPaths } from './paths.js'

export interface StartServerOptions {
  port?: number
  staticDir?: string
}

export interface StartedServer {
  server: Server
  port: number
}

export async function startApiServer(
  options: StartServerOptions = {},
): Promise<StartedServer> {
  await initPaths()
  const port = options.port ?? Number(process.env.PORT ?? 8787)
  const app = createApp(options.staticDir)

  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      const address = server.address()
      const actualPort =
        typeof address === 'object' && address !== null ? address.port : port
      resolve({ server, port: actualPort })
    })
    server.on('error', reject)
  })
}

function isCliEntry(): boolean {
  const entry = process.argv[1]
  if (!entry) return false
  return path.resolve(entry) === fileURLToPath(import.meta.url)
}

if (isCliEntry()) {
  startApiServer()
    .then(({ port }) => {
      console.log(`palknobs API on http://localhost:${port}`)
      console.log(`PalServer root: ${getPalServerRoot()}`)
      console.log(`Settings file: ${getSettingsPath()}`)
    })
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
