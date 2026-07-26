import type {
  IniValue,
  MetaResponse,
  OptionSettings,
  PathsInfo,
  SettingsResponse,
  UpdateStatus,
} from './types'

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`)
  }
  return data
}

export function fetchMeta(): Promise<MetaResponse> {
  return fetch('/api/meta').then((res) => parseJson<MetaResponse>(res))
}

export function fetchSettings(): Promise<SettingsResponse> {
  return fetch('/api/settings').then((res) => parseJson<SettingsResponse>(res))
}

export function saveSettings(
  settings: OptionSettings,
): Promise<{ settings: OptionSettings; path: string }> {
  return fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings }),
  }).then((res) => parseJson(res))
}

export function updateSettingsPath(settings: string): Promise<PathsInfo> {
  return fetch('/api/paths', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings }),
  }).then((res) => parseJson<PathsInfo>(res))
}

export function resetSettingsPath(): Promise<PathsInfo> {
  return fetch('/api/paths', { method: 'DELETE' }).then((res) =>
    parseJson<PathsInfo>(res),
  )
}

export function fetchUpdateStatus(): Promise<UpdateStatus> {
  return fetch('/api/update').then((res) => parseJson<UpdateStatus>(res))
}

export function skipUpdateVersion(version: string): Promise<UpdateStatus> {
  return fetch('/api/update/skip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version }),
  }).then((res) => parseJson<UpdateStatus>(res))
}

export function valuesEqual(a: IniValue, b: IniValue): boolean {
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false
    if (a.length !== b.length) return false
    return a.every((item, index) => item === b[index])
  }
  return a === b
}
