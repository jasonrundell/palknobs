import { afterEach, describe, expect, it } from 'vitest'
import { startApiServer } from './start.js'

describe('startApiServer', () => {
  let started: Awaited<ReturnType<typeof startApiServer>> | null = null

  afterEach(async () => {
    if (started) {
      await new Promise<void>((resolve, reject) => {
        started!.server.close((error) => {
          if (error) reject(error)
          else resolve()
        })
      })
      started = null
    }
  })

  it('returns the OS-assigned port when port 0 is requested', async () => {
    started = await startApiServer({ port: 0 })
    expect(started.port).toBeGreaterThan(0)
  })
})
