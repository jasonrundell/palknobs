import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { clearConfigCache } from './configStore'
import {
  getDefaultSettingsPath,
  getPathsInfo,
  getSettingsPath,
  getSettingsPathSource,
  initPaths,
  resetPathsState,
  resetSettingsPath,
  setSettingsPath,
} from './paths'

describe('paths', () => {
  let configDir = ''
  let previousConfigDir: string | undefined
  let previousRoot: string | undefined
  let previousSettingsPath: string | undefined

  beforeEach(async () => {
    configDir = await fs.mkdtemp(path.join(os.tmpdir(), 'palserver-config-'))
    previousConfigDir = process.env.PALSERVER_MANAGER_CONFIG_DIR
    previousRoot = process.env.PALSERVER_ROOT
    previousSettingsPath = process.env.PALSERVER_SETTINGS_PATH

    delete process.env.PALSERVER_SETTINGS_PATH
    process.env.PALSERVER_MANAGER_CONFIG_DIR = configDir
    process.env.PALSERVER_ROOT = path.join(configDir, 'PalServer')
    resetPathsState()
  })

  afterEach(async () => {
    if (previousConfigDir === undefined) {
      delete process.env.PALSERVER_MANAGER_CONFIG_DIR
    } else {
      process.env.PALSERVER_MANAGER_CONFIG_DIR = previousConfigDir
    }
    if (previousRoot === undefined) delete process.env.PALSERVER_ROOT
    else process.env.PALSERVER_ROOT = previousRoot
    if (previousSettingsPath === undefined) {
      delete process.env.PALSERVER_SETTINGS_PATH
    } else {
      process.env.PALSERVER_SETTINGS_PATH = previousSettingsPath
    }
    resetPathsState()
    clearConfigCache()
    await fs.rm(configDir, { recursive: true, force: true })
  })

  it('derives the default settings path from PALSERVER_ROOT', () => {
    expect(getSettingsPath()).toBe(getDefaultSettingsPath())
    expect(getSettingsPathSource()).toBe('default')
  })

  it('loads a persisted settings path on init', async () => {
    const customPath = path.join(configDir, 'custom', 'PalWorldSettings.ini')
    await fs.mkdir(path.dirname(customPath), { recursive: true })
    await fs.writeFile(
      path.join(configDir, 'config.json'),
      `${JSON.stringify({ settingsPath: customPath })}\n`,
      'utf8',
    )

    await initPaths()
    expect(getSettingsPath()).toBe(customPath)
    expect(getSettingsPathSource()).toBe('config')
  })

  it('prefers PALSERVER_SETTINGS_PATH over persisted config', async () => {
    const envPath = path.join(configDir, 'env', 'PalWorldSettings.ini')
    process.env.PALSERVER_SETTINGS_PATH = envPath
    await fs.mkdir(path.dirname(envPath), { recursive: true })
    await fs.writeFile(
      path.join(configDir, 'config.json'),
      `${JSON.stringify({ settingsPath: path.join(configDir, 'ignored.ini') })}\n`,
      'utf8',
    )

    await initPaths()
    expect(getSettingsPath()).toBe(envPath)
    expect(getPathsInfo().editable).toBe(false)
  })

  it('persists and clears custom settings paths', async () => {
    const customPath = path.join(configDir, 'saved', 'PalWorldSettings.ini')
    await setSettingsPath(customPath)

    resetPathsState()
    await initPaths()
    expect(getSettingsPath()).toBe(customPath)

    await resetSettingsPath()
    expect(getSettingsPath()).toBe(getDefaultSettingsPath())
  })
})
