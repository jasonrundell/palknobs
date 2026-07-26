import { useEffect, useMemo, useState } from 'react'
import {
  fetchMeta,
  fetchSettings,
  fetchUpdateStatus,
  resetSettingsPath,
  saveSettings,
  skipUpdateVersion,
  updateSettingsPath,
  valuesEqual,
} from './api'
import { SettingField } from './components/SettingField'
import { UpdateBanner } from './components/UpdateBanner'
import type {
  IniValue,
  MetaResponse,
  OptionSettings,
  SettingsResponse,
  UpdateStatus,
} from './types'

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'reloading' }
  | { kind: 'saving' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; message: string }

export default function App() {
  const [meta, setMeta] = useState<MetaResponse | null>(null)
  const [baseline, setBaseline] = useState<OptionSettings>({})
  const [draft, setDraft] = useState<OptionSettings>({})
  const [info, setInfo] = useState<Pick<SettingsResponse, 'paths'> | null>(null)
  const [pathInput, setPathInput] = useState('')
  const [pathBusy, setPathBusy] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState<Status>({ kind: 'loading' })
  const [update, setUpdate] = useState<UpdateStatus | null>(null)
  const [updateDismissed, setUpdateDismissed] = useState(false)
  const [updateBusy, setUpdateBusy] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function boot() {
      try {
        setStatus({ kind: 'loading' })
        const metaResponse = await fetchMeta()
        if (cancelled) return
        setMeta(metaResponse)
        setInfo({ paths: metaResponse.paths })

        const settingsResponse = await fetchSettings()
        if (cancelled) return
        setBaseline(settingsResponse.settings)
        setDraft(settingsResponse.settings)
        setInfo({ paths: settingsResponse.paths })
        setSettingsLoaded(true)
        setStatus({ kind: 'idle' })
      } catch (error) {
        if (cancelled) return
        setStatus({
          kind: 'error',
          message: error instanceof Error ? error.message : String(error),
        })
      }
    }

    void boot()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    // Update check is independent of settings loading; fail silently.
    fetchUpdateStatus()
      .then((result) => {
        if (!cancelled) setUpdate(result)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSkipUpdate() {
    if (!update?.latestVersion) return
    setUpdateBusy(true)
    try {
      const result = await skipUpdateVersion(update.latestVersion)
      setUpdate(result)
    } catch {
      // Keep the banner; the skip simply didn't take.
    } finally {
      setUpdateBusy(false)
    }
  }

  useEffect(() => {
    if (info?.paths.settings) {
      setPathInput(info.paths.settings)
    }
  }, [info?.paths.settings])

  async function reloadSettings(): Promise<void> {
    const [metaResponse, settingsResponse] = await Promise.all([
      fetchMeta(),
      fetchSettings(),
    ])
    setMeta(metaResponse)
    setBaseline(settingsResponse.settings)
    setDraft(settingsResponse.settings)
    setInfo({ paths: settingsResponse.paths })
    setSettingsLoaded(true)
    setStatus({ kind: 'idle' })
  }

  async function handleApplyPath() {
    if (info && !info.paths.editable) return
    try {
      setPathBusy(true)
      const paths = await updateSettingsPath(pathInput.trim())
      setInfo({ paths })
      await reloadSettings()
      setStatus({
        kind: 'success',
        message: `Now editing ${paths.settings}`,
      })
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setPathBusy(false)
    }
  }

  async function handleResetPath() {
    if (!info?.paths.editable) return
    try {
      setPathBusy(true)
      const paths = await resetSettingsPath()
      setInfo({ paths })
      setPathInput(paths.settings)
      await reloadSettings()
      setStatus({
        kind: 'success',
        message: `Reset to default settings file: ${paths.settings}`,
      })
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setPathBusy(false)
    }
  }

  async function handleBrowsePath() {
    const picked = await window.electronAPI?.pickSettingsFile()
    if (picked) {
      setPathInput(picked)
    }
  }

  const pathChanged =
    info?.paths.editable &&
    pathInput.trim() !== '' &&
    pathInput.trim() !== info.paths.settings

  const canResetPath =
    info?.paths.editable && info.paths.source !== 'default'

  const dirtyKeys = useMemo(() => {
    return Object.keys(draft).filter(
      (key) => !valuesEqual(draft[key], baseline[key]),
    )
  }, [baseline, draft])

  const filteredMeta = useMemo(() => {
    if (!meta) return []
    const needle = query.trim().toLowerCase()
    return meta.settings.filter((item) => {
      if (category !== 'All' && item.category !== category) return false
      if (!needle) return true
      return (
        item.label.toLowerCase().includes(needle) ||
        item.key.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle)
      )
    })
  }, [category, meta, query])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filteredMeta>()
    for (const item of filteredMeta) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return map
  }, [filteredMeta])

  function updateSetting(key: string, value: IniValue) {
    setDraft((current) => ({ ...current, [key]: value }))
    setStatus({ kind: 'idle' })
  }

  async function handleSave() {
    try {
      setStatus({ kind: 'saving' })
      const updates = Object.fromEntries(
        dirtyKeys.map((key) => [key, draft[key]]),
      )
      const result = await saveSettings(updates)
      setBaseline(result.settings)
      setDraft(result.settings)
      setStatus({
        kind: 'success',
        message: `Saved ${dirtyKeys.length} change${dirtyKeys.length === 1 ? '' : 's'} to ${result.path}`,
      })
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  async function handleResetDraft() {
    setDraft(baseline)
    setStatus({ kind: 'idle' })
  }

  async function handleReloadSettings() {
    if (
      dirtyKeys.length > 0 &&
      !window.confirm(
        'Reload settings from the INI file? Unsaved changes will be lost.',
      )
    ) {
      return
    }

    try {
      setStatus({ kind: 'reloading' })
      await reloadSettings()
      setStatus({
        kind: 'success',
        message: `Reloaded settings from ${info?.paths.settings ?? 'INI file'}`,
      })
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  if (status.kind === 'loading' && !settingsLoaded) {
    return (
      <div className="shell shell--center">
        <p className="muted">Loading Palworld settings…</p>
      </div>
    )
  }

  if (status.kind === 'error' && !settingsLoaded) {
    return (
      <div className="shell shell--center">
        <div className="panel path-panel">
          <h1>Could not load settings</h1>
          <p>{status.message}</p>
          <label className="path-field">
            <span className="path-field__label">Settings file</span>
            <input
              className="path-field__input"
              type="text"
              value={pathInput}
              onChange={(event) => setPathInput(event.target.value)}
              placeholder="Path to PalWorldSettings.ini"
            />
          </label>
          <div className="path-actions">
            {window.electronAPI ? (
              <button
                type="button"
                className="button"
                disabled={pathBusy}
                onClick={handleBrowsePath}
              >
                Browse…
              </button>
            ) : null}
            <button
              type="button"
              className="button button--primary"
              disabled={pathBusy || !pathInput.trim()}
              onClick={handleApplyPath}
            >
              {pathBusy ? 'Applying…' : 'Use this file'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="shell">
      {update?.updateAvailable && !updateDismissed && (
        <UpdateBanner
          status={update}
          busy={updateBusy}
          onSkip={handleSkipUpdate}
          onDismiss={() => setUpdateDismissed(true)}
        />
      )}
      <header className="hero">
        <div className="hero__copy">
          <p className="eyebrow">PalKnobs</p>
          <h1>World settings</h1>
          <p className="lede">
            Edit dedicated server options with clear labels, then save to
            PalWorldSettings.ini.
          </p>
        </div>
        <div className="hero__meta">
          <div className="stat">
            <span className="stat__label">Changes</span>
            <strong>{dirtyKeys.length}</strong>
          </div>
        </div>
      </header>

      <div className="toolbar">
        <input
          className="search"
          type="search"
          placeholder="Search settings…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="category-row">
          <button
            type="button"
            className={`category${category === 'All' ? ' category--active' : ''}`}
            onClick={() => setCategory('All')}
          >
            All
          </button>
          {(meta?.categories ?? []).map((name) => (
            <button
              key={name}
              type="button"
              className={`category${category === name ? ' category--active' : ''}`}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="layout">
        <main className="settings">
          {[...grouped.entries()].map(([name, items]) => (
            <section key={name} className="section">
              <div className="section__header">
                <h2>{name}</h2>
                <span>{items.length}</span>
              </div>
              <div className="section__grid">
                {items.map((item) => (
                  <SettingField
                    key={item.key}
                    meta={item}
                    value={draft[item.key]}
                    dirty={dirtyKeys.includes(item.key)}
                    onChange={(value) => updateSetting(item.key, value)}
                  />
                ))}
              </div>
            </section>
          ))}
          {filteredMeta.length === 0 ? (
            <div className="panel">
              <p>No settings match this search.</p>
            </div>
          ) : null}
        </main>

        <aside className="sidebar">
          <div className="panel">
            <h2>Save</h2>
            <p className="muted">
              Restart PalServer after saving for changes to take effect.
            </p>

            <div className="path-panel">
              <label className="path-field">
                <span className="path-field__label">Settings file</span>
                <input
                  className="path-field__input"
                  type="text"
                  value={pathInput}
                  onChange={(event) => setPathInput(event.target.value)}
                  disabled={!info?.paths.editable || pathBusy}
                  placeholder="Path to PalWorldSettings.ini"
                />
              </label>
              {info?.paths.editable ? (
                <div className="path-actions">
                  {window.electronAPI ? (
                    <button
                      type="button"
                      className="button"
                      disabled={pathBusy}
                      onClick={handleBrowsePath}
                    >
                      Browse…
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="button"
                    disabled={pathBusy || !pathChanged}
                    onClick={handleApplyPath}
                  >
                    {pathBusy ? 'Applying…' : 'Apply path'}
                  </button>
                  {canResetPath ? (
                    <button
                      type="button"
                      className="button"
                      disabled={pathBusy}
                      onClick={handleResetPath}
                    >
                      Reset default
                    </button>
                  ) : null}
                </div>
              ) : (
                <p className="muted path-note">
                  Path is fixed by the PALSERVER_SETTINGS_PATH environment
                  variable.
                </p>
              )}
            </div>

            <div className="actions">
              <button
                type="button"
                className="button button--primary"
                disabled={
                  dirtyKeys.length === 0 ||
                  status.kind === 'saving' ||
                  status.kind === 'reloading'
                }
                onClick={handleSave}
              >
                {status.kind === 'saving' ? 'Saving…' : `Save ${dirtyKeys.length || ''}`.trim()}
              </button>
              <button
                type="button"
                className="button"
                disabled={dirtyKeys.length === 0 || status.kind === 'reloading'}
                onClick={handleResetDraft}
              >
                Discard
              </button>
              <button
                type="button"
                className="button"
                disabled={
                  status.kind === 'saving' ||
                  status.kind === 'reloading' ||
                  pathBusy
                }
                onClick={handleReloadSettings}
              >
                {status.kind === 'reloading' ? 'Reloading…' : 'Reload from file'}
              </button>
            </div>

            {status.kind === 'error' ? (
              <p className="status status--error">{status.message}</p>
            ) : null}
            {status.kind === 'success' ? (
              <p className="status status--success">{status.message}</p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  )
}
