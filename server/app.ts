import cors from 'cors'
import express from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import {
  mergeSettings,
  parsePalWorldIni,
  serializePalWorldIni,
  type OptionSettings,
  type PalWorldIni,
} from './ini.js'
import {
  getPathsInfo,
  getSettingsPath,
  resetSettingsPath,
  setSettingsPath,
} from './paths.js'
import { CATEGORIES, SETTINGS_META } from './settingsMeta.js'
import { setSkippedVersion } from './configStore.js'
import { getUpdateStatus } from './updateCheck.js'

export function createApp(staticDir?: string) {
  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '2mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.get('/api/meta', (_req, res) => {
    res.json({
      categories: CATEGORIES,
      settings: SETTINGS_META,
      paths: getPathsInfo(),
    })
  })

  app.get('/api/paths', (_req, res) => {
    res.json(getPathsInfo())
  })

  app.put('/api/paths', async (req, res) => {
    try {
      const nextPath = req.body?.settings
      if (typeof nextPath !== 'string' || !nextPath.trim()) {
        throw new Error('Request body must include a non-empty settings path.')
      }

      const resolved = await setSettingsPath(nextPath.trim())
      await assertValidSettingsFile(resolved)

      res.json(getPathsInfo())
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[paths:put]', message)
      res.status(400).json({ error: message })
    }
  })

  app.delete('/api/paths', async (_req, res) => {
    try {
      await resetSettingsPath()
      res.json(getPathsInfo())
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[paths:delete]', message)
      res.status(400).json({ error: message })
    }
  })

  app.get('/api/settings', async (_req, res) => {
    try {
      const payload = await loadSettings()
      res.json(payload)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[settings:get]', message)
      res.status(500).json({ error: message })
    }
  })

  app.put('/api/settings', async (req, res) => {
    try {
      const updates = req.body?.settings as OptionSettings | undefined
      if (!updates || typeof updates !== 'object') {
        throw new Error('Request body must include a settings object.')
      }

      const loaded = await loadSettings()
      const merged = mergeSettings(loaded.settings, updates)
      const nextIni: PalWorldIni = {
        section: loaded.section,
        comments: [
          '; Palworld dedicated server settings',
          '; Managed by palknobs',
          '; Restart the server for changes to take effect.',
        ],
        settings: merged,
      }

      const filePath = getSettingsPath()
      const serialized = serializePalWorldIni(nextIni)
      await fs.writeFile(filePath, serialized, 'utf8')

      res.json({
        ok: true,
        path: filePath,
        settings: merged,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[settings:put]', message)
      res.status(400).json({ error: message })
    }
  })

  app.get('/api/update', async (_req, res) => {
    // getUpdateStatus never throws; errors are reported in the payload.
    res.json(await getUpdateStatus())
  })

  app.post('/api/update/skip', async (req, res) => {
    try {
      const version = req.body?.version
      if (typeof version !== 'string' || !version.trim()) {
        throw new Error('Request body must include a version to skip.')
      }
      await setSkippedVersion(version.trim().replace(/^v/i, ''))
      // Recompute so the response reflects the new suppression immediately.
      res.json(await getUpdateStatus(true))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[update:skip]', message)
      res.status(400).json({ error: message })
    }
  })

  if (staticDir) {
    app.use(express.static(staticDir))
    app.get(/.*/, (_req, res) => {
      res.sendFile(path.join(staticDir, 'index.html'))
    })
  }

  return app
}

async function readSettingsFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf8')
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'ENOENT') {
      throw new Error(`Settings file not found: ${filePath}`)
    }
    throw error
  }
}

export async function loadSettings() {
  const settingsPath = getSettingsPath()
  const raw = await readSettingsFile(settingsPath)

  if (!/OptionSettings=\(/.test(raw)) {
    throw new Error(
      `Settings file is missing OptionSettings=(...): ${settingsPath}`,
    )
  }

  const ini = parsePalWorldIni(raw)
  return {
    settings: ini.settings,
    section: ini.section,
    comments: ini.comments,
    paths: getPathsInfo(),
  }
}

async function assertValidSettingsFile(filePath: string): Promise<void> {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    if (!/OptionSettings=\(/.test(raw)) {
      throw new Error(
        `Settings file is missing OptionSettings=(...): ${filePath}`,
      )
    }
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'ENOENT') {
      throw new Error(`Settings file not found: ${filePath}`)
    }
    throw error
  }
}
