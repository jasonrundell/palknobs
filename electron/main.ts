import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import path from 'node:path'
import type { StartedServer } from '../server/start.js'
import { startApiServer } from '../server/start.js'

let mainWindow: BrowserWindow | null = null
let apiServer: StartedServer | null = null

const DEV_UI_URL = 'http://localhost:5173'
const API_PORT = Number(process.env.PORT ?? 8787)
const useViteDevServer = process.env.ELECTRON_DEV === '1'

function resolveStaticDir(): string {
  return path.join(app.getAppPath(), 'dist')
}

function resolvePreloadPath(): string {
  return path.join(app.getAppPath(), 'dist-electron', 'electron', 'preload.js')
}

function registerIpcHandlers(): void {
  ipcMain.handle('pick-settings-file', async () => {
    const dialogOptions = {
      title: 'Select PalWorldSettings.ini',
      properties: ['openFile' as const],
      filters: [{ name: 'INI files', extensions: ['ini'] }],
    }
    const result = mainWindow
      ? await dialog.showOpenDialog(mainWindow, dialogOptions)
      : await dialog.showOpenDialog(dialogOptions)
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  })
}

async function createWindow(): Promise<void> {
  process.env.PALSERVER_MANAGER_CONFIG_DIR = app.getPath('userData')
  registerIpcHandlers()

  if (useViteDevServer) {
    apiServer = await startApiServer({ port: API_PORT })
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 900,
      minWidth: 960,
      minHeight: 640,
      title: 'PalKnobs',
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: resolvePreloadPath(),
      },
    })
    await mainWindow.loadURL(DEV_UI_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    const staticDir = resolveStaticDir()
    apiServer = await startApiServer({ port: 0, staticDir })
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 900,
      minWidth: 960,
      minHeight: 640,
      title: 'PalKnobs',
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: resolvePreloadPath(),
      },
    })
    await mainWindow.loadURL(`http://localhost:${apiServer.port}`)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function shutdownApiServer(): void {
  if (!apiServer) return
  apiServer.server.close()
  apiServer = null
}

app.whenReady().then(createWindow).catch((error) => {
  console.error('[electron] failed to start', error)
  app.quit()
})

app.on('window-all-closed', () => {
  shutdownApiServer()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow().catch((error) => {
      console.error('[electron] failed to recreate window', error)
    })
  }
})

app.on('before-quit', () => {
  shutdownApiServer()
})
