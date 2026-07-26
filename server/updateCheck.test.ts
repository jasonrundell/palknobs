import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from './app'
import { clearConfigCache, setSkippedVersion } from './configStore'
import {
  compareVersions,
  getUpdateStatus,
  resetUpdateCache,
} from './updateCheck'

function jsonResponse(status: number, body: unknown) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  } as unknown as Response
}

function mockFetch(impl: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

const RELEASE = (tag: string) => ({
  tag_name: tag,
  html_url: `https://github.com/jasonrundell/palknobs/releases/tag/${tag}`,
})

describe('compareVersions', () => {
  it('orders semver numerically, not lexically', () => {
    expect(compareVersions('1.0.1', '1.0.0')).toBe(1)
    expect(compareVersions('1.0.0', '1.0.1')).toBe(-1)
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0)
    expect(compareVersions('v2.0.0', '1.9.9')).toBe(1)
    expect(compareVersions('1.2.0', '1.10.0')).toBe(-1)
  })
})

describe('update check', () => {
  let configDir = ''
  let previousConfigDir: string | undefined
  let previousVersion: string | undefined

  beforeEach(async () => {
    configDir = await fs.mkdtemp(path.join(os.tmpdir(), 'palknobs-update-'))
    previousConfigDir = process.env.PALSERVER_MANAGER_CONFIG_DIR
    previousVersion = process.env.PALKNOBS_VERSION
    process.env.PALSERVER_MANAGER_CONFIG_DIR = configDir
    process.env.PALKNOBS_VERSION = '1.0.0'
    clearConfigCache()
    resetUpdateCache()
  })

  afterEach(async () => {
    if (previousConfigDir === undefined) {
      delete process.env.PALSERVER_MANAGER_CONFIG_DIR
    } else {
      process.env.PALSERVER_MANAGER_CONFIG_DIR = previousConfigDir
    }
    if (previousVersion === undefined) delete process.env.PALKNOBS_VERSION
    else process.env.PALKNOBS_VERSION = previousVersion
    vi.unstubAllGlobals()
    clearConfigCache()
    resetUpdateCache()
    await fs.rm(configDir, { recursive: true, force: true })
  })

  it('flags an update when the latest release is newer', async () => {
    mockFetch(async () => jsonResponse(200, RELEASE('v1.0.1')))
    const status = await getUpdateStatus(true)
    expect(status.currentVersion).toBe('1.0.0')
    expect(status.latestVersion).toBe('1.0.1')
    expect(status.updateAvailable).toBe(true)
    expect(status.releaseUrl).toContain('v1.0.1')
  })

  it('does not flag when latest equals current', async () => {
    mockFetch(async () => jsonResponse(200, RELEASE('v1.0.0')))
    const status = await getUpdateStatus(true)
    expect(status.updateAvailable).toBe(false)
  })

  it('does not flag when latest is older', async () => {
    mockFetch(async () => jsonResponse(200, RELEASE('v0.9.0')))
    const status = await getUpdateStatus(true)
    expect(status.updateAvailable).toBe(false)
  })

  it('suppresses a version that was skipped, until something newer ships', async () => {
    await setSkippedVersion('1.0.1')

    mockFetch(async () => jsonResponse(200, RELEASE('v1.0.1')))
    let status = await getUpdateStatus(true)
    expect(status.updateAvailable).toBe(false) // skipped == latest

    mockFetch(async () => jsonResponse(200, RELEASE('v1.0.2')))
    status = await getUpdateStatus(true)
    expect(status.updateAvailable).toBe(true) // newer than the skipped one
  })

  it('handles a repo with no releases yet (404)', async () => {
    mockFetch(async () => jsonResponse(404, { message: 'Not Found' }))
    const status = await getUpdateStatus(true)
    expect(status.latestVersion).toBeNull()
    expect(status.updateAvailable).toBe(false)
    expect(status.error).toBeUndefined()
  })

  it('reports an error gracefully on network failure', async () => {
    mockFetch(async () => {
      throw new Error('network down')
    })
    const status = await getUpdateStatus(true)
    expect(status.updateAvailable).toBe(false)
    expect(status.error).toBe('network down')
  })

  it('serves GET /api/update and POST /api/update/skip', async () => {
    mockFetch(async () => jsonResponse(200, RELEASE('v1.0.1')))
    const app = createApp()

    const get = await request(app).get('/api/update')
    expect(get.status).toBe(200)
    expect(get.body.updateAvailable).toBe(true)
    expect(get.body.latestVersion).toBe('1.0.1')

    const skip = await request(app)
      .post('/api/update/skip')
      .send({ version: '1.0.1' })
    expect(skip.status).toBe(200)
    expect(skip.body.updateAvailable).toBe(false)

    const bad = await request(app).post('/api/update/skip').send({})
    expect(bad.status).toBe(400)
  })
})
