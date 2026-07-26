import { createRequire } from 'node:module'
import { getSkippedVersion } from './configStore.js'

const REPO = 'jasonrundell/palknobs'
const LATEST_URL = `https://api.github.com/repos/${REPO}/releases/latest`
const RELEASES_URL = `https://github.com/${REPO}/releases`
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // ~1 day

export interface UpdateStatus {
  currentVersion: string
  latestVersion: string | null
  updateAvailable: boolean
  releaseUrl: string | null
  checkedAt: string
  /** Present only when the check could not complete (network/rate-limit). */
  error?: string
}

let cache: { at: number; status: UpdateStatus } | null = null

/** Test helper — drop the cached result so the next check re-fetches. */
export function resetUpdateCache(): void {
  cache = null
}

/**
 * The running app's version. Electron sets PALKNOBS_VERSION (from
 * app.getVersion()); otherwise fall back to package.json. Never throws.
 */
export function getCurrentVersion(): string {
  if (process.env.PALKNOBS_VERSION) return process.env.PALKNOBS_VERSION
  try {
    const require = createRequire(import.meta.url)
    const pkg = require('../package.json') as { version?: string }
    return pkg.version ?? '0.0.0'
  } catch {
    return '0.0.0'
  }
}

function parse(version: string): [number, number, number] {
  const core = version.trim().replace(/^v/i, '').split(/[-+]/)[0]
  const parts = core.split('.').map((n) => Number.parseInt(n, 10) || 0)
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0]
}

/** Compare two semver-ish strings. 1 if a > b, -1 if a < b, 0 if equal. */
export function compareVersions(a: string, b: string): number {
  const pa = parse(a)
  const pb = parse(b)
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1
    if (pa[i] < pb[i]) return -1
  }
  return 0
}

interface LatestRelease {
  version: string
  url: string
}

/** Fetch the latest published GitHub release. null when there are none yet. */
export async function fetchLatestRelease(): Promise<LatestRelease | null> {
  const res = await fetch(LATEST_URL, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'palknobs-update-check',
    },
  })
  if (res.status === 404) return null // repo has no releases yet
  if (!res.ok) throw new Error(`GitHub responded ${res.status}`)
  const data = (await res.json()) as { tag_name?: string; html_url?: string }
  if (!data.tag_name) return null
  return {
    version: data.tag_name.replace(/^v/i, ''),
    url: data.html_url ?? RELEASES_URL,
  }
}

async function computeStatus(): Promise<UpdateStatus> {
  const currentVersion = getCurrentVersion()
  const checkedAt = new Date().toISOString()
  try {
    const latest = await fetchLatestRelease()
    if (!latest) {
      return {
        currentVersion,
        latestVersion: null,
        updateAvailable: false,
        releaseUrl: null,
        checkedAt,
      }
    }
    const skipped = await getSkippedVersion()
    const newerThanCurrent = compareVersions(latest.version, currentVersion) > 0
    const newerThanSkipped =
      !skipped || compareVersions(latest.version, skipped) > 0
    return {
      currentVersion,
      latestVersion: latest.version,
      updateAvailable: newerThanCurrent && newerThanSkipped,
      releaseUrl: latest.url,
      checkedAt,
    }
  } catch (error) {
    // Network failure / rate limit: report gracefully, never surface an update.
    return {
      currentVersion,
      latestVersion: null,
      updateAvailable: false,
      releaseUrl: null,
      checkedAt,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Current update status, served from a ~24h cache so repeated app opens don't
 * re-hit GitHub. `force` bypasses the cache (used after the user skips a
 * version). Failed checks are not cached, so they retry next time.
 */
export async function getUpdateStatus(force = false): Promise<UpdateStatus> {
  const now = Date.now()
  if (!force && cache && now - cache.at < CACHE_TTL_MS) {
    return cache.status
  }
  const status = await computeStatus()
  if (!status.error) cache = { at: now, status }
  return status
}
