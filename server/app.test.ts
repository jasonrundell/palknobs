import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { clearConfigCache } from './configStore'
import { createApp } from './app'
import { resetPathsState } from './paths'

const SAMPLE = `; Palworld dedicated server settings
[/Script/Pal.PalGameWorldSettings]
OptionSettings=(Difficulty=None,ExpRate=1.000000,bIsPvP=False,ServerName="Default Palworld Server",ServerPlayerMaxNum=32,CrossplayPlatforms=(Steam,Xbox),DenyTechnologyList=,DeathPenalty=Item)
`

function settingsPath(root: string) {
  return path.join(
    root,
    'Pal',
    'Saved',
    'Config',
    'WindowsServer',
    'PalWorldSettings.ini',
  )
}

describe('settings API', () => {
  let root = ''
  let configDir = ''
  let previousRoot: string | undefined
  let previousConfigDir: string | undefined

  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'palknobs-'))
    configDir = await fs.mkdtemp(path.join(os.tmpdir(), 'palserver-config-'))
    previousRoot = process.env.PALSERVER_ROOT
    previousConfigDir = process.env.PALSERVER_MANAGER_CONFIG_DIR
    process.env.PALSERVER_ROOT = root
    process.env.PALSERVER_MANAGER_CONFIG_DIR = configDir
    resetPathsState()

    await fs.mkdir(path.dirname(settingsPath(root)), { recursive: true })
    await fs.writeFile(settingsPath(root), SAMPLE, 'utf8')
  })

  afterEach(async () => {
    if (previousRoot === undefined) delete process.env.PALSERVER_ROOT
    else process.env.PALSERVER_ROOT = previousRoot
    if (previousConfigDir === undefined) {
      delete process.env.PALSERVER_MANAGER_CONFIG_DIR
    } else {
      process.env.PALSERVER_MANAGER_CONFIG_DIR = previousConfigDir
    }
    resetPathsState()
    clearConfigCache()
    await fs.rm(root, { recursive: true, force: true })
    await fs.rm(configDir, { recursive: true, force: true })
  })

  it('loads settings from PalWorldSettings.ini', async () => {
    const res = await request(createApp()).get('/api/settings')
    expect(res.status).toBe(200)
    expect(res.body.settings.ServerName).toBe('Default Palworld Server')
    expect(res.body.paths.settings).toBe(settingsPath(root))
  })

  it('re-reads settings when the INI file changes on disk', async () => {
    const app = createApp()
    const first = await request(app).get('/api/settings')
    expect(first.body.settings.ServerName).toBe('Default Palworld Server')

    const updated = SAMPLE.replace(
      'Default Palworld Server',
      'Reloaded Palworld Server',
    )
    await fs.writeFile(settingsPath(root), updated, 'utf8')

    const second = await request(app).get('/api/settings')
    expect(second.status).toBe(200)
    expect(second.body.settings.ServerName).toBe('Reloaded Palworld Server')
  })

  it('errors when settings file is missing OptionSettings', async () => {
    await fs.writeFile(settingsPath(root), '\r\n', 'utf8')
    const res = await request(createApp()).get('/api/settings')
    expect(res.status).toBe(500)
    expect(res.body.error).toMatch(/missing OptionSettings/)
  })

  it('saves updates only to PalWorldSettings.ini', async () => {
    const res = await request(createApp())
      .put('/api/settings')
      .send({ settings: { ExpRate: 2.5, bIsPvP: true } })

    expect(res.status).toBe(200)
    expect(res.body.settings.ExpRate).toBe(2.5)
    expect(res.body.settings.bIsPvP).toBe(true)
    expect(res.body.path).toBe(settingsPath(root))

    const live = await fs.readFile(settingsPath(root), 'utf8')
    expect(live).toContain('ExpRate=2.500000')
    expect(live).toContain('bIsPvP=True')

    await expect(
      fs.access(path.join(root, 'DefaultPalWorldSettings.ini')),
    ).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('rejects unknown setting keys', async () => {
    const res = await request(createApp())
      .put('/api/settings')
      .send({ settings: { NotReal: true } })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Unknown setting key/)
  })

  it('serves the built UI when staticDir is configured', async () => {
    const staticRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'palserver-ui-'))
    await fs.writeFile(path.join(staticRoot, 'index.html'), '<html>ui</html>', 'utf8')

    const res = await request(createApp(staticRoot)).get('/')
    expect(res.status).toBe(200)
    expect(res.text).toBe('<html>ui</html>')

    await fs.rm(staticRoot, { recursive: true, force: true })
  })

  it('updates the settings file path', async () => {
    const altDir = path.join(root, 'alt')
    const altPath = path.join(altDir, 'PalWorldSettings.ini')
    await fs.mkdir(altDir, { recursive: true })
    await fs.writeFile(altPath, SAMPLE.replace('Default Palworld Server', 'Alt Server'), 'utf8')

    const putRes = await request(createApp())
      .put('/api/paths')
      .send({ settings: altPath })
    expect(putRes.status).toBe(200)
    expect(putRes.body.settings).toBe(altPath)
    expect(putRes.body.source).toBe('config')

    const getRes = await request(createApp()).get('/api/settings')
    expect(getRes.status).toBe(200)
    expect(getRes.body.settings.ServerName).toBe('Alt Server')
    expect(getRes.body.paths.settings).toBe(altPath)
  })

  it('rejects invalid settings file paths', async () => {
    const missing = path.join(root, 'missing.ini')
    const res = await request(createApp())
      .put('/api/paths')
      .send({ settings: missing })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/not found/)
  })

  it('resets the settings file path to the default', async () => {
    const altPath = path.join(root, 'alt', 'PalWorldSettings.ini')
    await fs.mkdir(path.dirname(altPath), { recursive: true })
    await fs.writeFile(altPath, SAMPLE, 'utf8')

    await request(createApp()).put('/api/paths').send({ settings: altPath })

    const resetRes = await request(createApp()).delete('/api/paths')
    expect(resetRes.status).toBe(200)
    expect(resetRes.body.settings).toBe(settingsPath(root))
    expect(resetRes.body.source).toBe('default')
  })
})
