import { describe, expect, it } from 'vitest'
import {
  assertWellFormedSerializedIni,
  mergeSettings,
  parsePalWorldIni,
  serializePalWorldIni,
} from './ini'

const SAMPLE = `; Palworld dedicated server settings
; Managed by palknobs
; Restart the server for changes to take effect.
[/Script/Pal.PalGameWorldSettings]
OptionSettings=(Difficulty=None,RandomizerSeed="",ExpRate=1.000000,bIsPvP=False,ServerName="Default Palworld Server",ServerPlayerMaxNum=32,CrossplayPlatforms=(Steam,Xbox,PS5,Mac),DenyTechnologyList=,DeathPenalty=Item)
`

describe('parsePalWorldIni', () => {
  it('parses option settings with mixed value types', () => {
    const parsed = parsePalWorldIni(SAMPLE)
    expect(parsed.section).toBe('/Script/Pal.PalGameWorldSettings')
    expect(parsed.settings.Difficulty).toBe('None')
    expect(parsed.settings.RandomizerSeed).toBe('')
    expect(parsed.settings.ExpRate).toBe(1)
    expect(parsed.settings.bIsPvP).toBe(false)
    expect(parsed.settings.ServerName).toBe('Default Palworld Server')
    expect(parsed.settings.ServerPlayerMaxNum).toBe(32)
    expect(parsed.settings.CrossplayPlatforms).toEqual([
      'Steam',
      'Xbox',
      'PS5',
      'Mac',
    ])
    expect(parsed.settings.DenyTechnologyList).toBe('')
    expect(parsed.settings.DeathPenalty).toBe('Item')
  })

  it('throws when OptionSettings is missing', () => {
    expect(() => parsePalWorldIni('[/Script/Pal.PalGameWorldSettings]\n')).toThrow(
      /missing OptionSettings/,
    )
  })
})

describe('serializePalWorldIni', () => {
  it('round-trips parsed settings', () => {
    const parsed = parsePalWorldIni(SAMPLE)
    const serialized = serializePalWorldIni(parsed)
    const again = parsePalWorldIni(serialized)
    expect(again.settings).toEqual(parsed.settings)
  })

  it('quotes single-word text fields like ServerName', () => {
    const parsed = parsePalWorldIni(SAMPLE)
    parsed.settings.ServerName = 'BOOMTOWN'
    parsed.settings.ServerDescription = 'Welcome to boomtown'
    const serialized = serializePalWorldIni(parsed)
    expect(serialized).toContain('ServerName="BOOMTOWN"')
    expect(serialized).toContain('ServerDescription="Welcome to boomtown"')
    expect(serialized).toContain('Difficulty=None')
    expect(serialized).toContain('DeathPenalty=Item')
  })

  it('refuses malformed unquoted text fields', () => {
    expect(() =>
      assertWellFormedSerializedIni(
        `[/Script/Pal.PalGameWorldSettings]\r\nOptionSettings=(ServerName=BOOMTOWN,Difficulty=None)\r\n`,
      ),
    ).toThrow(/ServerName must be a quoted string/)
  })
})

describe('mergeSettings', () => {
  it('updates known keys only', () => {
    const base = parsePalWorldIni(SAMPLE).settings
    const merged = mergeSettings(base, { ExpRate: 2, bIsPvP: true })
    expect(merged.ExpRate).toBe(2)
    expect(merged.bIsPvP).toBe(true)
    expect(merged.ServerName).toBe('Default Palworld Server')
  })

  it('throws on unknown keys', () => {
    const base = parsePalWorldIni(SAMPLE).settings
    expect(() => mergeSettings(base, { NotARealKey: true })).toThrow(
      /Unknown setting key/,
    )
  })
})
