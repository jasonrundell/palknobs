export type IniValue = string | number | boolean | string[]

export type OptionSettings = Record<string, IniValue>

export interface SettingMeta {
  key: string
  label: string
  description: string
  category: string
  control:
    | 'boolean'
    | 'number'
    | 'integer'
    | 'text'
    | 'password'
    | 'select'
    | 'multiselect'
  min?: number
  max?: number
  step?: number
  options?: { value: string; label: string }[]
  sensitive?: boolean
}

export interface PathsInfo {
  root: string
  settings: string
  defaultSettings: string
  source: 'env' | 'config' | 'default'
  editable: boolean
}

export interface SettingsResponse {
  settings: OptionSettings
  section: string
  comments: string[]
  paths: PathsInfo
}

export interface MetaResponse {
  categories: string[]
  settings: SettingMeta[]
  paths: PathsInfo
}
