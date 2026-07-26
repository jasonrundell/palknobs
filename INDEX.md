# PalKnobs — Project Index

Local web UI for editing Palworld dedicated server `OptionSettings` in an intuitive form.

## Runtime

| Command | Purpose |
| --- | --- |
| `npm run dev` | API (`:8787`) + Vite UI (`:5173`) |
| `npm run electron:dev` | Electron desktop app (Vite dev + embedded API) |
| `npm run electron:start` | Electron desktop app (production build, no installer) |
| `npm run electron:build` | Windows installer (`.exe`) via electron-builder |
| `npm run start` | API only |
| `npm test` | Vitest unit/API tests |
| `npm run build` | Production UI build |

## Key paths

| Path | Purpose |
| --- | --- |
| `electron/main.ts` | Electron main process: window + embedded API |
| `server/app.ts` | Express API: load/save settings |
| `server/start.ts` | API process entrypoint |
| `server/ini.ts` | Parse/serialize `OptionSettings=(...)`; quotes text/password FStrings; rejects malformed writes |
| `server/settingsMeta.ts` | Labels, categories, control types, gameplay effect descriptions |
| `server/paths.ts` | PalServer root + settings INI path |
| `server/configStore.ts` | Persisted settings INI path (user config) |
| `src/App.tsx` | Settings editor UI |
| `src/components/SettingField.tsx` | Per-setting control |
| `src/api.ts` | Frontend API client |

Default PalServer root: `C:/Program Files (x86)/Steam/steamapps/common/PalServer`  
Override with `PALSERVER_ROOT`.

Default settings file (derived from root):  
`Pal/Saved/Config/WindowsServer/PalWorldSettings.ini`

Change the INI path in the app sidebar, or override with:

- `PALSERVER_SETTINGS_PATH` — full path to `PalWorldSettings.ini` (fixed; UI cannot change it)
- Persisted config — `~/.palknobs/config.json` (web/CLI) or Electron `userData/config.json`

## API

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/meta` | Categories + field metadata |
| `GET` | `/api/paths` | Current/default settings INI paths |
| `PUT` | `/api/paths` | Point the app at a different `PalWorldSettings.ini` |
| `DELETE` | `/api/paths` | Reset to the default derived path |
| `GET` | `/api/settings` | Current settings from `PalWorldSettings.ini` |
| `PUT` | `/api/settings` | Save updates to `PalWorldSettings.ini` |
