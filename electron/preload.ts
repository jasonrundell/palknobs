import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  pickSettingsFile: (): Promise<string | null> =>
    ipcRenderer.invoke('pick-settings-file'),
})
