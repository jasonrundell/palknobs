import path from 'node:path'
import {
  clearConfigCache,
  clearPersistedSettingsPath,
  loadConfig,
  saveConfig,
} from './configStore.js'

export type SettingsPathSource = 'env' | 'config' | 'default'

let settingsPathOverride: string | undefined

export function getPalServerRoot(): string {
  const root =
    process.env.PALSERVER_ROOT ??
    'C:/Program Files (x86)/Steam/steamapps/common/PalServer'
  return path.resolve(root)
}

/** Default path derived from the PalServer install root. */
export function getDefaultSettingsPath(): string {
  return path.join(
    getPalServerRoot(),
    'Pal',
    'Saved',
    'Config',
    'WindowsServer',
    'PalWorldSettings.ini',
  )
}

export function getSettingsPathSource(): SettingsPathSource {
  if (process.env.PALSERVER_SETTINGS_PATH) return 'env'
  if (settingsPathOverride) return 'config'
  return 'default'
}

export function isSettingsPathEditable(): boolean {
  return getSettingsPathSource() !== 'env'
}

/** The only settings file this app reads and writes. */
export function getSettingsPath(): string {
  const envPath = process.env.PALSERVER_SETTINGS_PATH
  if (envPath) return path.resolve(envPath)
  if (settingsPathOverride) return settingsPathOverride
  return getDefaultSettingsPath()
}

export function getPathsInfo() {
  return {
    root: getPalServerRoot(),
    settings: getSettingsPath(),
    defaultSettings: getDefaultSettingsPath(),
    source: getSettingsPathSource(),
    editable: isSettingsPathEditable(),
  }
}

export async function initPaths(): Promise<void> {
  settingsPathOverride = undefined
  clearConfigCache()
  const config = await loadConfig()
  if (config.settingsPath) {
    settingsPathOverride = path.resolve(config.settingsPath)
  }
}

export async function setSettingsPath(nextPath: string): Promise<string> {
  if (!isSettingsPathEditable()) {
    throw new Error(
      'Settings path is fixed by PALSERVER_SETTINGS_PATH and cannot be changed in the app.',
    )
  }

  const resolved = path.resolve(nextPath)
  settingsPathOverride = resolved
  await saveConfig({ settingsPath: resolved })
  return resolved
}

export async function resetSettingsPath(): Promise<string> {
  if (!isSettingsPathEditable()) {
    throw new Error(
      'Settings path is fixed by PALSERVER_SETTINGS_PATH and cannot be changed in the app.',
    )
  }

  settingsPathOverride = undefined
  await clearPersistedSettingsPath()
  return getDefaultSettingsPath()
}

/** Test helper to reset in-memory path state without touching disk. */
export function resetPathsState(): void {
  settingsPathOverride = undefined
  clearConfigCache()
}
