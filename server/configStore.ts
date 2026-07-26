import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

export interface AppConfig {
  settingsPath?: string
}

let cached: AppConfig | null = null

export function getConfigDir(): string {
  const dir = process.env.PALSERVER_MANAGER_CONFIG_DIR
  if (dir) return path.resolve(dir)
  return path.join(os.homedir(), '.palknobs')
}

export function getConfigPath(): string {
  return path.join(getConfigDir(), 'config.json')
}

export function clearConfigCache(): void {
  cached = null
}

export async function loadConfig(): Promise<AppConfig> {
  if (cached) return cached
  try {
    const raw = await fs.readFile(getConfigPath(), 'utf8')
    cached = JSON.parse(raw) as AppConfig
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code !== 'ENOENT') {
      throw error
    }
    cached = {}
  }
  return cached
}

export async function saveConfig(update: Partial<AppConfig>): Promise<AppConfig> {
  const dir = getConfigDir()
  await fs.mkdir(dir, { recursive: true })
  const next = { ...(await loadConfig()), ...update }
  await fs.writeFile(getConfigPath(), `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  cached = next
  return next
}

export async function clearPersistedSettingsPath(): Promise<AppConfig> {
  const current = await loadConfig()
  const { settingsPath: _removed, ...rest } = current
  const dir = getConfigDir()
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(getConfigPath(), `${JSON.stringify(rest, null, 2)}\n`, 'utf8')
  cached = rest
  return rest
}
