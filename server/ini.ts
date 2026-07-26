import { SETTINGS_BY_KEY } from './settingsMeta.js'

export type IniValue = string | number | boolean | string[]

export type OptionSettings = Record<string, IniValue>

export interface PalWorldIni {
  section: string
  comments: string[]
  settings: OptionSettings
}

const SECTION_RE = /^\[(.+)\]\s*$/
const OPTION_SETTINGS_RE = /OptionSettings=\(([\s\S]*)\)\s*$/
const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]*$/

function splitOptionSettings(body: string): string[] {
  const parts: string[] = []
  let current = ''
  let depth = 0
  let inQuotes = false

  for (let i = 0; i < body.length; i++) {
    const ch = body[i]

    if (ch === '"' && body[i - 1] !== '\\') {
      inQuotes = !inQuotes
      current += ch
      continue
    }

    if (!inQuotes) {
      if (ch === '(') depth++
      if (ch === ')') depth--
      if (ch === ',' && depth === 0) {
        parts.push(current)
        current = ''
        continue
      }
    }

    current += ch
  }

  if (current.trim()) parts.push(current)
  return parts
}

function parseValue(raw: string): IniValue {
  const value = raw.trim()

  if (value === 'True') return true
  if (value === 'False') return false

  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\"/g, '"')
  }

  if (value.startsWith('(') && value.endsWith(')')) {
    const inner = value.slice(1, -1).trim()
    if (!inner) return []
    return inner.split(',').map((item) => item.trim()).filter(Boolean)
  }

  if (value === '') return ''

  if (/^-?\d+\.\d+$/.test(value)) return Number(value)
  if (/^-?\d+$/.test(value)) return Number(value)

  return value
}

export function parsePalWorldIni(content: string): PalWorldIni {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/)
  const comments: string[] = []
  let section = '/Script/Pal.PalGameWorldSettings'
  let optionLine = ''

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed.startsWith(';')) {
      comments.push(trimmed)
      continue
    }

    const sectionMatch = trimmed.match(SECTION_RE)
    if (sectionMatch) {
      section = sectionMatch[1]
      continue
    }

    if (trimmed.startsWith('OptionSettings=')) {
      optionLine = trimmed
    }
  }

  if (!optionLine) {
    throw new Error(
      'PalWorld settings file is missing OptionSettings=(...).',
    )
  }

  const match = optionLine.match(OPTION_SETTINGS_RE)
  if (!match) {
    throw new Error('Could not parse OptionSettings block.')
  }

  const settings: OptionSettings = {}
  for (const part of splitOptionSettings(match[1])) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const key = part.slice(0, eq).trim()
    const rawValue = part.slice(eq + 1)
    if (!key) continue
    settings[key] = parseValue(rawValue)
  }

  return { section, comments, settings }
}

/** Free-text / password FString fields must be quoted; select enums stay bare. */
export function shouldQuoteString(key: string, value: string): boolean {
  if (value === '') return false
  const meta = SETTINGS_BY_KEY[key]
  if (meta) {
    if (meta.control === 'text' || meta.control === 'password') return true
    if (meta.control === 'select') return false
  }
  // Unknown keys: quote anything that is not a plain identifier/enum token.
  return !IDENT_RE.test(value)
}

function formatValue(key: string, value: IniValue): string {
  if (typeof value === 'boolean') return value ? 'True' : 'False'
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return String(value)
    return value.toFixed(6)
  }
  if (Array.isArray(value)) return `(${value.join(',')})`
  if (value === '') return ''
  if (shouldQuoteString(key, value)) {
    return `"${value.replace(/"/g, '\\"')}"`
  }
  return value
}

/** Refuse to write OptionSettings that would trip Palworld's string parser. */
export function assertWellFormedSerializedIni(serialized: string): void {
  const parsed = parsePalWorldIni(serialized)
  for (const [key, value] of Object.entries(parsed.settings)) {
    if (typeof value !== 'string' || value === '') continue
    const meta = SETTINGS_BY_KEY[key]
    if (!meta || (meta.control !== 'text' && meta.control !== 'password')) {
      continue
    }
    const assignment = serialized.match(
      new RegExp(`(?:^|[,\\n])${key}=("[^"]*"|[^,]*)`),
    )
    const raw = assignment?.[1]
    if (!raw || !raw.startsWith('"') || !raw.endsWith('"')) {
      throw new Error(
        `Refusing to write malformed INI: ${key} must be a quoted string (got ${raw ?? 'missing'}).`,
      )
    }
  }
}

export function serializePalWorldIni(ini: PalWorldIni): string {
  const comments =
    ini.comments.length > 0
      ? ini.comments
      : [
          '; Palworld dedicated server settings',
          '; Managed by palknobs',
          '; Restart the server for changes to take effect.',
        ]

  const pairs = Object.entries(ini.settings).map(
    ([key, value]) => `${key}=${formatValue(key, value)}`,
  )

  const lines = [
    ...comments,
    `[${ini.section}]`,
    `OptionSettings=(${pairs.join(',')})`,
    '',
  ]

  const serialized = lines.join('\r\n')
  assertWellFormedSerializedIni(serialized)
  return serialized
}

export function mergeSettings(
  base: OptionSettings,
  updates: OptionSettings,
): OptionSettings {
  const next: OptionSettings = { ...base }
  for (const [key, value] of Object.entries(updates)) {
    if (!(key in base)) {
      throw new Error(`Unknown setting key: ${key}`)
    }
    next[key] = value
  }
  return next
}
