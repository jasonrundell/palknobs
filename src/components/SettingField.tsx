import type { IniValue, SettingMeta } from '../types'

interface SettingFieldProps {
  meta: SettingMeta
  value: IniValue | undefined
  dirty: boolean
  onChange: (value: IniValue) => void
}

export function SettingField({ meta, value, dirty, onChange }: SettingFieldProps) {
  const id = `setting-${meta.key}`
  const resolved =
    value === undefined
      ? meta.control === 'boolean'
        ? false
        : meta.control === 'multiselect'
          ? []
          : meta.control === 'number' || meta.control === 'integer'
            ? 0
            : ''
      : value

  return (
    <label className={`setting${dirty ? ' setting--dirty' : ''}`} htmlFor={id}>
      <div className="setting__header">
        <span className="setting__label">{meta.label}</span>
        {dirty ? <span className="setting__badge">Edited</span> : null}
      </div>
      <p className="setting__description">{meta.description}</p>
      <div className="setting__control">{renderControl(meta, id, resolved, onChange)}</div>
      <code className="setting__key">{meta.key}</code>
    </label>
  )
}

function renderControl(
  meta: SettingMeta,
  id: string,
  value: IniValue,
  onChange: (value: IniValue) => void,
) {
  switch (meta.control) {
    case 'boolean':
      return (
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          className={`toggle${value ? ' toggle--on' : ''}`}
          onClick={() => onChange(!value)}
        >
          <span className="toggle__thumb" />
          <span className="toggle__text">{value ? 'On' : 'Off'}</span>
        </button>
      )
    case 'select':
      return (
        <select
          id={id}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
        >
          {(meta.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    case 'multiselect': {
      const selected = Array.isArray(value) ? value : []
      return (
        <div className="chip-group" id={id}>
          {(meta.options ?? []).map((option) => {
            const active = selected.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                className={`chip${active ? ' chip--active' : ''}`}
                onClick={() => {
                  onChange(
                    active
                      ? selected.filter((item) => item !== option.value)
                      : [...selected, option.value],
                  )
                }}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )
    }
    case 'password':
    case 'text':
      return (
        <input
          id={id}
          type={meta.control === 'password' ? 'password' : 'text'}
          value={String(value ?? '')}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
        />
      )
    case 'integer':
    case 'number':
      return (
        <div className="number-field">
          <input
            id={id}
            type="number"
            value={typeof value === 'number' ? value : Number(value)}
            min={meta.min}
            max={meta.max}
            step={meta.step ?? (meta.control === 'integer' ? 1 : 0.1)}
            onChange={(event) => {
              const next = Number(event.target.value)
              if (Number.isNaN(next)) return
              onChange(meta.control === 'integer' ? Math.trunc(next) : next)
            }}
          />
          {typeof meta.min === 'number' && typeof meta.max === 'number' ? (
            <input
              type="range"
              aria-label={`${meta.label} slider`}
              min={meta.min}
              max={meta.max}
              step={meta.step ?? (meta.control === 'integer' ? 1 : 0.1)}
              value={clampNumber(
                typeof value === 'number' ? value : Number(value),
                meta.min,
                meta.max,
              )}
              onChange={(event) => {
                const next = Number(event.target.value)
                onChange(meta.control === 'integer' ? Math.trunc(next) : next)
              }}
            />
          ) : null}
        </div>
      )
    default:
      return null
  }
}

function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}
