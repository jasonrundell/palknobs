export {}

declare global {
  interface Window {
    electronAPI?: {
      pickSettingsFile: () => Promise<string | null>
    }
  }
}
