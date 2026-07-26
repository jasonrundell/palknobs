import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

function normalizeWindowsRoot(dir: string): string {
  if (process.platform !== 'win32') return dir
  return dir.replace(/^([a-z]):/, (_, letter: string) => `${letter.toUpperCase()}:`)
}

export default defineConfig({
  // Pin root with uppercase drive letter so Vitest path maps stay consistent on Windows.
  root: normalizeWindowsRoot(fileURLToPath(new URL('.', import.meta.url))),
  test: {
    include: ['server/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['server/**/*.ts'],
      exclude: ['server/**/*.test.ts', 'server/start.ts'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
})
