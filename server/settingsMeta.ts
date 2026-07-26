export type ControlType =
  | 'boolean'
  | 'number'
  | 'integer'
  | 'text'
  | 'password'
  | 'select'
  | 'multiselect'

export interface SettingMeta {
  key: string
  label: string
  description: string
  category: string
  control: ControlType
  min?: number
  max?: number
  step?: number
  options?: { value: string; label: string }[]
  sensitive?: boolean
}

export const CATEGORIES = [
  'Server',
  'Players & Multiplayer',
  'Difficulty & Rates',
  'Time & World',
  'Pals',
  'Player Survival',
  'Building & Bases',
  'Guilds',
  'Items & Drops',
  'Gameplay Features',
  'PvP',
  'Voice Chat',
  'Advanced',
] as const

export type Category = (typeof CATEGORIES)[number]

const deathPenaltyOptions = [
  { value: 'None', label: 'None' },
  { value: 'Item', label: 'Items only' },
  { value: 'ItemAndEquipment', label: 'Items & equipment' },
  { value: 'All', label: 'All (including pals)' },
]

const difficultyOptions = [
  { value: 'None', label: 'None (custom)' },
  { value: 'Easy', label: 'Easy' },
  { value: 'Normal', label: 'Normal' },
  { value: 'Hard', label: 'Hard' },
]

const randomizerOptions = [
  { value: 'None', label: 'None' },
  { value: 'Region', label: 'Region' },
  { value: 'All', label: 'All' },
]

const logFormatOptions = [
  { value: 'Text', label: 'Text' },
  { value: 'Json', label: 'JSON' },
]

const crossplayOptions = [
  { value: 'Steam', label: 'Steam' },
  { value: 'Xbox', label: 'Xbox' },
  { value: 'PS5', label: 'PlayStation 5' },
  { value: 'Mac', label: 'Mac' },
]

export const SETTINGS_META: SettingMeta[] = [
  // Server
  {
    key: 'ServerName',
    label: 'Server name',
    description:
      'Display name in the server browser and friends list. Does not change gameplay — only how players find and identify your world.',
    category: 'Server',
    control: 'text',
  },
  {
    key: 'ServerDescription',
    label: 'Description',
    description:
      'Short blurb under the server name in the browser. Use it for rules, rates, or Discord links — no in-game effect.',
    category: 'Server',
    control: 'text',
  },
  {
    key: 'AdminPassword',
    label: 'Admin password',
    description:
      'Password required for in-game admin commands (kick, ban, teleport, etc.). Leave empty to disable admin login.',
    category: 'Server',
    control: 'password',
    sensitive: true,
  },
  {
    key: 'ServerPassword',
    label: 'Join password',
    description:
      'Password players must enter to join. Leave empty for a public server; set one to keep the world private.',
    category: 'Server',
    control: 'password',
    sensitive: true,
  },
  {
    key: 'PublicIP',
    label: 'Public IP',
    description:
      'IP address advertised to clients for connecting. Leave empty to auto-detect; set manually if behind NAT or a reverse proxy.',
    category: 'Server',
    control: 'text',
  },
  {
    key: 'PublicPort',
    label: 'Public port',
    description:
      'UDP game port players connect to (default 8211). Must match your firewall / router forward; changing it does not alter gameplay.',
    category: 'Server',
    control: 'integer',
    min: 1,
    max: 65535,
  },
  {
    key: 'Region',
    label: 'Region',
    description:
      'Optional region tag shown in the server browser (e.g. NA, EU). Helps players filter — no effect on world simulation.',
    category: 'Server',
    control: 'text',
  },
  {
    key: 'bAllowClientMod',
    label: 'Allow client mods',
    description:
      'On: players can join with client-side mods. Off: modded clients are blocked (stricter, more consistent experience).',
    category: 'Server',
    control: 'boolean',
  },
  {
    key: 'bShowPlayerList',
    label: 'Show player list',
    description:
      'On: clients can see who is online. Off: hides the player list (more privacy, less social visibility).',
    category: 'Server',
    control: 'boolean',
  },
  {
    key: 'bIsShowJoinLeftMessage',
    label: 'Join / leave messages',
    description:
      'On: chat announces when players join or leave. Off: quieter chat with no join/leave spam.',
    category: 'Server',
    control: 'boolean',
  },
  {
    key: 'ChatPostLimitPerMinute',
    label: 'Chat rate limit',
    description:
      'Max chat messages per player per minute. Increase to allow more spam; decrease (or 0) to throttle chat harder.',
    category: 'Server',
    control: 'integer',
    min: 0,
    max: 1000,
  },
  {
    key: 'CrossplayPlatforms',
    label: 'Crossplay platforms',
    description:
      'Which platforms may join (Steam, Xbox, PS5, Mac). Deselect platforms to lock the server to specific stores.',
    category: 'Server',
    control: 'multiselect',
    options: crossplayOptions,
  },

  // Players & Multiplayer
  {
    key: 'ServerPlayerMaxNum',
    label: 'Max players',
    description:
      'Maximum concurrent players on the server. Increase for larger worlds; decrease to reduce load and keep sessions smaller.',
    category: 'Players & Multiplayer',
    control: 'integer',
    min: 1,
    max: 128,
  },
  {
    key: 'CoopPlayerMaxNum',
    label: 'Max coop party size',
    description:
      'Maximum players in a cooperative party. Increase for bigger groups; decrease to keep parties small.',
    category: 'Players & Multiplayer',
    control: 'integer',
    min: 1,
    max: 32,
  },
  {
    key: 'bIsMultiplay',
    label: 'Multiplay',
    description:
      'On: enables dedicated multiplayer behavior. Off: treats the session more like single-player / limited coop.',
    category: 'Players & Multiplayer',
    control: 'boolean',
  },
  {
    key: 'bIsPvP',
    label: 'PvP mode',
    description:
      'On: player-versus-player combat and related PvP rules are active. Off: cooperative / PvE-focused play.',
    category: 'Players & Multiplayer',
    control: 'boolean',
  },
  {
    key: 'bEnablePlayerToPlayerDamage',
    label: 'Player-to-player damage',
    description:
      'On: players can hurt each other (needed for real PvP). Off: players cannot damage other players even if PvP is on.',
    category: 'Players & Multiplayer',
    control: 'boolean',
  },
  {
    key: 'bEnableFriendlyFire',
    label: 'Friendly fire',
    description:
      'On: allies and their pals can damage each other. Off: party/guild mates are safe from accidental hits.',
    category: 'Players & Multiplayer',
    control: 'boolean',
  },
  {
    key: 'bExistPlayerAfterLogout',
    label: 'Keep character after logout',
    description:
      'On: your character stays in the world when you disconnect (can be raided or starve). Off: character despawns on logout.',
    category: 'Players & Multiplayer',
    control: 'boolean',
  },
  {
    key: 'bIsStartLocationSelectByMap',
    label: 'Choose start location on map',
    description:
      'On: new players pick a starting point on the map. Off: they spawn at the default starting area.',
    category: 'Players & Multiplayer',
    control: 'boolean',
  },

  // Difficulty & Rates
  {
    key: 'Difficulty',
    label: 'Difficulty preset',
    description:
      'Built-in difficulty preset that adjusts several rates at once. Use None for fully custom rates below.',
    category: 'Difficulty & Rates',
    control: 'select',
    options: difficultyOptions,
  },
  {
    key: 'ExpRate',
    label: 'EXP rate',
    description:
      'Multiplier for experience gain. Increase to level up faster; decrease for a slower, grindier progression.',
    category: 'Difficulty & Rates',
    control: 'number',
    min: 0.1,
    max: 20,
    step: 0.1,
  },
  {
    key: 'PalCaptureRate',
    label: 'Pal capture rate',
    description:
      'Multiplier for capture success chance. Increase to catch pals more easily; decrease to make captures harder.',
    category: 'Difficulty & Rates',
    control: 'number',
    min: 0.5,
    max: 20,
    step: 0.1,
  },
  {
    key: 'PalSpawnNumRate',
    label: 'Pal spawn rate',
    description:
      'Multiplier for wild pal spawn density. Increase for more pals in the world; decrease for scarcer encounters (also reduces server load).',
    category: 'Difficulty & Rates',
    control: 'number',
    min: 0.5,
    max: 5,
    step: 0.1,
  },
  {
    key: 'CollectionDropRate',
    label: 'Gathering drop rate',
    description:
      'Multiplier for items from trees, ore, and other gathering nodes. Increase for more resources per gather; decrease for scarcer materials.',
    category: 'Difficulty & Rates',
    control: 'number',
    min: 0.5,
    max: 20,
    step: 0.1,
  },
  {
    key: 'EnemyDropItemRate',
    label: 'Enemy drop rate',
    description:
      'Multiplier for loot from defeated enemies. Increase for more drops; decrease for rarer loot.',
    category: 'Difficulty & Rates',
    control: 'number',
    min: 0.5,
    max: 20,
    step: 0.1,
  },
  {
    key: 'WorkSpeedRate',
    label: 'Work speed rate',
    description:
      'Multiplier for crafting and base work speed. Increase so pals/players finish jobs faster; decrease to slow production.',
    category: 'Difficulty & Rates',
    control: 'number',
    min: 0.1,
    max: 20,
    step: 0.1,
  },
  {
    key: 'ItemWeightRate',
    label: 'Item weight rate',
    description:
      'Multiplier for item weight. Increase to make inventory fill up sooner (harder); decrease (or 0) so players can carry more.',
    category: 'Difficulty & Rates',
    control: 'number',
    min: 0,
    max: 5,
    step: 0.1,
  },
  {
    key: 'EquipmentDurabilityDamageRate',
    label: 'Equipment durability loss',
    description:
      'Multiplier for how fast weapons and armor wear out. Increase for more repair upkeep; decrease (or 0) so gear lasts longer.',
    category: 'Difficulty & Rates',
    control: 'number',
    min: 0,
    max: 10,
    step: 0.1,
  },
  {
    key: 'ItemCorruptionMultiplier',
    label: 'Food spoilage rate',
    description:
      'Multiplier for how fast food and perishable items spoil. Increase for faster spoilage; decrease (or 0) so food lasts longer.',
    category: 'Difficulty & Rates',
    control: 'number',
    min: 0,
    max: 10,
    step: 0.1,
  },
  {
    key: 'bHardcore',
    label: 'Hardcore',
    description:
      'On: enables hardcore rules (harsher death / progression). Off: standard survival rules.',
    category: 'Difficulty & Rates',
    control: 'boolean',
  },
  {
    key: 'bPalLost',
    label: 'Permanent pal loss',
    description:
      'On: pals can be permanently lost on death (high stakes). Off: pals are not permanently deleted that way.',
    category: 'Difficulty & Rates',
    control: 'boolean',
  },
  {
    key: 'bCharacterRecreateInHardcore',
    label: 'Recreate character in hardcore',
    description:
      'On (with hardcore): players may recreate a character after death. Off: hardcore death is more final.',
    category: 'Difficulty & Rates',
    control: 'boolean',
  },

  // Time & World
  {
    key: 'DayTimeSpeedRate',
    label: 'Daytime speed',
    description:
      'How fast daytime progresses. Increase for shorter days; decrease for longer daylight (more time to explore and build).',
    category: 'Time & World',
    control: 'number',
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    key: 'NightTimeSpeedRate',
    label: 'Nighttime speed',
    description:
      'How fast nighttime progresses. Increase for shorter nights; decrease for longer nights (more nocturnal pals and danger).',
    category: 'Time & World',
    control: 'number',
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    key: 'RandomizerType',
    label: 'Randomizer type',
    description:
      'None: normal world. Region / All: scramble pal spawns by region or globally for a fresh exploration layout.',
    category: 'Time & World',
    control: 'select',
    options: randomizerOptions,
  },
  {
    key: 'RandomizerSeed',
    label: 'Randomizer seed',
    description:
      'Seed for the randomizer layout. Same seed = same scramble; change it for a different randomized world.',
    category: 'Time & World',
    control: 'text',
  },
  {
    key: 'bIsRandomizerPalLevelRandom',
    label: 'Randomize pal levels',
    description:
      'On (with randomizer): wild pal levels are randomized. Off: levels follow the usual area scaling.',
    category: 'Time & World',
    control: 'boolean',
  },
  {
    key: 'SupplyDropSpan',
    label: 'Supply drop interval (min)',
    description:
      'Minutes between supply drops. Increase for rarer crates; decrease for more frequent drops.',
    category: 'Time & World',
    control: 'integer',
    min: 0,
    max: 9999,
  },
  {
    key: 'EnablePredatorBossPal',
    label: 'Predator boss pals',
    description:
      'On: predator boss pal encounters can appear. Off: those special boss spawns are disabled.',
    category: 'Time & World',
    control: 'boolean',
  },
  {
    key: 'AutoSaveSpan',
    label: 'Autosave interval (sec)',
    description:
      'Seconds between automatic world saves. Increase to save less often (less I/O); decrease for more frequent backups against crashes.',
    category: 'Time & World',
    control: 'number',
    min: 30,
    max: 3600,
    step: 1,
  },

  // Pals
  {
    key: 'PalDamageRateAttack',
    label: 'Pal attack damage',
    description:
      'Damage dealt by pals. Increase so pals hit harder; decrease to weaken pal combat.',
    category: 'Pals',
    control: 'number',
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    key: 'PalDamageRateDefense',
    label: 'Pal damage taken',
    description:
      'Damage received by pals. Increase so pals die faster (harder); decrease so pals are tankier.',
    category: 'Pals',
    control: 'number',
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    key: 'PalStomachDecreaceRate',
    label: 'Pal hunger rate',
    description:
      'How fast pals get hungry. Increase so they need food more often; decrease (or 0) so they stay fed longer.',
    category: 'Pals',
    control: 'number',
    min: 0,
    max: 5,
    step: 0.1,
  },
  {
    key: 'PalStaminaDecreaceRate',
    label: 'Pal stamina drain',
    description:
      'How fast pal stamina depletes during work and combat. Increase for more rest needs; decrease so pals work longer.',
    category: 'Pals',
    control: 'number',
    min: 0,
    max: 5,
    step: 0.1,
  },
  {
    key: 'PalAutoHPRegeneRate',
    label: 'Pal HP regen',
    description:
      'Pal health regeneration while awake. Increase for faster out-of-combat healing; decrease for slower recovery.',
    category: 'Pals',
    control: 'number',
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    key: 'PalAutoHpRegeneRateInSleep',
    label: 'Pal HP regen (sleep)',
    description:
      'Pal health regeneration while sleeping. Increase for faster bed recovery; decrease for slower sleep healing.',
    category: 'Pals',
    control: 'number',
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    key: 'PalEggDefaultHatchingTime',
    label: 'Egg hatch time (hours)',
    description:
      'Default hours to hatch a pal egg. Increase for longer incubations; decrease (or 0) for near-instant hatching.',
    category: 'Pals',
    control: 'number',
    min: 0,
    max: 240,
    step: 0.5,
  },
  {
    key: 'MonsterFarmActionSpeedRate',
    label: 'Ranch / farm action speed',
    description:
      'Speed multiplier for ranch and farm pal actions (milking, gathering, etc.). Increase for faster farm output; decrease to slow it down.',
    category: 'Pals',
    control: 'number',
    min: 0.1,
    max: 20,
    step: 0.1,
  },
  {
    key: 'bAllowGlobalPalboxExport',
    label: 'Allow global palbox export',
    description:
      'On: players can export pals to the global palbox (cross-world transfer out). Off: export is blocked.',
    category: 'Pals',
    control: 'boolean',
  },
  {
    key: 'bAllowGlobalPalboxImport',
    label: 'Allow global palbox import',
    description:
      'On: players can import pals from the global palbox into this world. Off: import is blocked.',
    category: 'Pals',
    control: 'boolean',
  },

  // Player Survival
  {
    key: 'PlayerDamageRateAttack',
    label: 'Player attack damage',
    description:
      'Damage dealt by players. Increase so players hit harder; decrease to make combat tougher.',
    category: 'Player Survival',
    control: 'number',
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    key: 'PlayerDamageRateDefense',
    label: 'Player damage taken',
    description:
      'Damage received by players. Increase so players die faster (harder); decrease so players are tankier.',
    category: 'Player Survival',
    control: 'number',
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    key: 'PlayerStomachDecreaceRate',
    label: 'Player hunger rate',
    description:
      'How fast players get hungry. Increase for more frequent eating; decrease (or 0) so hunger is less of a concern.',
    category: 'Player Survival',
    control: 'number',
    min: 0,
    max: 5,
    step: 0.1,
  },
  {
    key: 'PlayerStaminaDecreaceRate',
    label: 'Player stamina drain',
    description:
      'How fast player stamina depletes when sprinting, climbing, or gliding. Increase for more stamina pressure; decrease for freer movement.',
    category: 'Player Survival',
    control: 'number',
    min: 0,
    max: 5,
    step: 0.1,
  },
  {
    key: 'PlayerAutoHPRegeneRate',
    label: 'Player HP regen',
    description:
      'Player health regeneration while awake. Increase for faster recovery; decrease for slower out-of-combat healing.',
    category: 'Player Survival',
    control: 'number',
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    key: 'PlayerAutoHpRegeneRateInSleep',
    label: 'Player HP regen (sleep)',
    description:
      'Player health regeneration while sleeping. Increase for faster bed recovery; decrease for slower sleep healing.',
    category: 'Player Survival',
    control: 'number',
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    key: 'DeathPenalty',
    label: 'Death penalty',
    description:
      'What players drop on death. None is most forgiving; All (including pals) is the harshest.',
    category: 'Player Survival',
    control: 'select',
    options: deathPenaltyOptions,
  },
  {
    key: 'bEnableNonLoginPenalty',
    label: 'Offline penalty',
    description:
      'On: long absences can apply offline penalties. Off: players can stay away without those penalties.',
    category: 'Player Survival',
    control: 'boolean',
  },
  {
    key: 'BlockRespawnTime',
    label: 'Respawn block time (sec)',
    description:
      'Seconds before a player can respawn after death. Increase for longer downtime; decrease (or 0) for instant respawns.',
    category: 'Player Survival',
    control: 'number',
    min: 0,
    max: 600,
    step: 1,
  },
  {
    key: 'RespawnPenaltyDurationThreshold',
    label: 'Respawn penalty threshold',
    description:
      'Time window (seconds) where repeated deaths escalate respawn penalties. Increase to punish death streaks sooner; decrease to be more forgiving.',
    category: 'Player Survival',
    control: 'number',
    min: 0,
    max: 3600,
    step: 1,
  },
  {
    key: 'RespawnPenaltyTimeScale',
    label: 'Respawn penalty scale',
    description:
      'Multiplier for escalating respawn wait times. Increase for harsher death streaks; decrease (or 0) to soften or disable escalation.',
    category: 'Player Survival',
    control: 'number',
    min: 0,
    max: 20,
    step: 0.1,
  },
  {
    key: 'bAllowEnhanceStat_Health',
    label: 'Allow health enhancement',
    description:
      'On: players can spend points to raise max Health. Off: Health enhancement is locked.',
    category: 'Player Survival',
    control: 'boolean',
  },
  {
    key: 'bAllowEnhanceStat_Attack',
    label: 'Allow attack enhancement',
    description:
      'On: players can spend points to raise Attack. Off: Attack enhancement is locked.',
    category: 'Player Survival',
    control: 'boolean',
  },
  {
    key: 'bAllowEnhanceStat_Stamina',
    label: 'Allow stamina enhancement',
    description:
      'On: players can spend points to raise Stamina. Off: Stamina enhancement is locked.',
    category: 'Player Survival',
    control: 'boolean',
  },
  {
    key: 'bAllowEnhanceStat_Weight',
    label: 'Allow weight enhancement',
    description:
      'On: players can spend points to raise carry Weight. Off: Weight enhancement is locked.',
    category: 'Player Survival',
    control: 'boolean',
  },
  {
    key: 'bAllowEnhanceStat_WorkSpeed',
    label: 'Allow work speed enhancement',
    description:
      'On: players can spend points to raise Work Speed. Off: Work Speed enhancement is locked.',
    category: 'Player Survival',
    control: 'boolean',
  },

  // Building & Bases
  {
    key: 'BaseCampMaxNum',
    label: 'Max base camps (server)',
    description:
      'Maximum base camps allowed on the entire server. Increase for more bases overall; decrease to limit world sprawl and server load.',
    category: 'Building & Bases',
    control: 'integer',
    min: 0,
    max: 1024,
  },
  {
    key: 'BaseCampMaxNumInGuild',
    label: 'Max bases per guild',
    description:
      'Maximum base camps a single guild may own. Increase for sprawling guild empires; decrease to keep guilds compact.',
    category: 'Building & Bases',
    control: 'integer',
    min: 0,
    max: 64,
  },
  {
    key: 'BaseCampWorkerMaxNum',
    label: 'Max workers per base',
    description:
      'Maximum working pals assigned to a base camp. Increase for larger workforces; decrease to limit base productivity and load.',
    category: 'Building & Bases',
    control: 'integer',
    min: 1,
    max: 50,
  },
  {
    key: 'BuildObjectHpRate',
    label: 'Building HP',
    description:
      'Health multiplier for built structures. Increase so buildings take more hits; decrease so structures are easier to destroy.',
    category: 'Building & Bases',
    control: 'number',
    min: 0.1,
    max: 10,
    step: 0.1,
  },
  {
    key: 'BuildObjectDamageRate',
    label: 'Building damage dealt',
    description:
      'Damage multiplier for defensive structures (turrets, etc.). Increase for stronger base defense; decrease to weaken it.',
    category: 'Building & Bases',
    control: 'number',
    min: 0.1,
    max: 10,
    step: 0.1,
  },
  {
    key: 'BuildObjectDeteriorationDamageRate',
    label: 'Building decay rate',
    description:
      'How fast structures deteriorate when unattended. Increase for faster decay; decrease (or 0) so bases last without maintenance.',
    category: 'Building & Bases',
    control: 'number',
    min: 0,
    max: 10,
    step: 0.1,
  },
  {
    key: 'MaxBuildingLimitNum',
    label: 'Max buildings per player',
    description:
      'Cap on structures per player. Increase for larger builds; decrease to limit building spam. 0 = unlimited.',
    category: 'Building & Bases',
    control: 'integer',
    min: 0,
    max: 100000,
  },
  {
    key: 'bBuildAreaLimit',
    label: 'Limit build area',
    description:
      'On: building is restricted to allowed zones. Off: players can build more freely across the map.',
    category: 'Building & Bases',
    control: 'boolean',
  },
  {
    key: 'bInvisibleOtherGuildBaseCampAreaFX',
    label: 'Hide other guild base FX',
    description:
      'On: hides other guilds’ base-camp area visuals. Off: you can see rival base boundaries more clearly.',
    category: 'Building & Bases',
    control: 'boolean',
  },
  {
    key: 'bEnableBuildingPlayerUIdDisplay',
    label: 'Show builder player ID',
    description:
      'On: structures show the builder’s player UID (useful for moderation). Off: builder IDs are hidden.',
    category: 'Building & Bases',
    control: 'boolean',
  },
  {
    key: 'BuildingNameDisplayCacheTTLSeconds',
    label: 'Building name cache TTL',
    description:
      'Seconds to cache building name display data. Increase to reduce refresh work; decrease for fresher name updates.',
    category: 'Building & Bases',
    control: 'integer',
    min: 0,
    max: 3600,
  },

  // Guilds
  {
    key: 'GuildPlayerMaxNum',
    label: 'Max players per guild',
    description:
      'Maximum members in a guild. Increase for larger alliances; decrease to keep guilds small.',
    category: 'Guilds',
    control: 'integer',
    min: 1,
    max: 100,
  },
  {
    key: 'bAutoResetGuildNoOnlinePlayers',
    label: 'Auto-reset inactive guilds',
    description:
      'On: guilds with no online members are cleared after the timeout below. Off: empty guilds persist indefinitely.',
    category: 'Guilds',
    control: 'boolean',
  },
  {
    key: 'AutoResetGuildTimeNoOnlinePlayers',
    label: 'Inactive guild reset (hours)',
    description:
      'Hours offline before an inactive guild is reset. Increase to keep abandoned guilds longer; decrease to clear them sooner.',
    category: 'Guilds',
    control: 'number',
    min: 1,
    max: 720,
    step: 1,
  },
  {
    key: 'GuildRejoinCooldownMinutes',
    label: 'Guild rejoin cooldown (min)',
    description:
      'Minutes before a player can rejoin a guild after leaving. Increase to discourage guild hopping; decrease (or 0) for free switching.',
    category: 'Guilds',
    control: 'integer',
    min: 0,
    max: 10080,
  },
  {
    key: 'bEnableDefenseOtherGuildPlayer',
    label: 'Defend against other guilds',
    description:
      'On: base defenses can engage other guild players. Off: defenses ignore rival guild members.',
    category: 'Guilds',
    control: 'boolean',
  },
  {
    key: 'bCanPickupOtherGuildDeathPenaltyDrop',
    label: 'Loot other guild death drops',
    description:
      'On: you can pick up death-penalty bags from other guilds. Off: those drops are guild-locked.',
    category: 'Guilds',
    control: 'boolean',
  },
  {
    key: 'AutoTransferMasterCheckIntervalSeconds',
    label: 'Guild master transfer check',
    description:
      'Seconds between automatic guild-master transfer checks. Increase to check less often; decrease for faster leadership handoff.',
    category: 'Guilds',
    control: 'number',
    min: 60,
    max: 86400,
    step: 1,
  },
  {
    key: 'AutoTransferMasterThresholdDays',
    label: 'Guild master transfer days',
    description:
      'Days of master inactivity before leadership can transfer. Increase to keep inactive masters longer; decrease for faster succession.',
    category: 'Guilds',
    control: 'integer',
    min: 1,
    max: 365,
  },
  {
    key: 'MaxGuildsPerFrame',
    label: 'Max guilds per frame',
    description:
      'Performance tuning: guilds processed per frame. Increase for faster guild updates (more CPU); decrease to reduce frame cost.',
    category: 'Guilds',
    control: 'integer',
    min: 1,
    max: 100,
  },

  // Items & Drops
  {
    key: 'DropItemMaxNum',
    label: 'Max dropped items',
    description:
      'Maximum dropped items kept in the world. Increase so more loot stays on the ground; decrease to despawn excess sooner and reduce lag.',
    category: 'Items & Drops',
    control: 'integer',
    min: 0,
    max: 20000,
  },
  {
    key: 'PhysicsActiveDropItemMaxNum',
    label: 'Max physics drop items',
    description:
      'Max dropped items with active physics. Increase for more physical loot (costlier); decrease to reduce physics load. -1 = default.',
    category: 'Items & Drops',
    control: 'integer',
    min: -1,
    max: 20000,
  },
  {
    key: 'DropItemMaxNum_UNKO',
    label: 'Max UNKO drop items',
    description:
      'Maximum UNKO-related dropped items. Increase to keep more of them; decrease to clear them faster.',
    category: 'Items & Drops',
    control: 'integer',
    min: 0,
    max: 5000,
  },
  {
    key: 'DropItemAliveMaxHours',
    label: 'Drop item lifetime (hours)',
    description:
      'How long dropped items remain before despawning. Increase so loot lasts longer; decrease so the ground clears sooner.',
    category: 'Items & Drops',
    control: 'number',
    min: 0,
    max: 72,
    step: 0.5,
  },
  {
    key: 'CollectionObjectHpRate',
    label: 'Gathering node HP',
    description:
      'Health of trees, ore, and other gatherables. Increase so nodes take more hits to harvest; decrease for faster gathering.',
    category: 'Items & Drops',
    control: 'number',
    min: 0.1,
    max: 10,
    step: 0.1,
  },
  {
    key: 'CollectionObjectRespawnSpeedRate',
    label: 'Gathering respawn speed',
    description:
      'How fast gatherable nodes respawn. Increase for quicker resource refresh; decrease so nodes stay depleted longer.',
    category: 'Items & Drops',
    control: 'number',
    min: 0.1,
    max: 10,
    step: 0.1,
  },
  {
    key: 'DenyTechnologyList',
    label: 'Denied technologies',
    description:
      'Comma-separated technology IDs players cannot unlock. Use to ban specific crafts or progression items; leave empty for no bans.',
    category: 'Items & Drops',
    control: 'text',
  },

  // Gameplay Features
  {
    key: 'bEnableInvaderEnemy',
    label: 'Base raids / invaders',
    description:
      'On: enemy raids can attack bases over time. Off: bases are safe from invader waves.',
    category: 'Gameplay Features',
    control: 'boolean',
  },
  {
    key: 'bActiveUNKO',
    label: 'Enable UNKO',
    description:
      'On: UNKO (dung) gameplay content is active. Off: that content is disabled.',
    category: 'Gameplay Features',
    control: 'boolean',
  },
  {
    key: 'bEnableAimAssistPad',
    label: 'Gamepad aim assist',
    description:
      'On: controller players get aim assist. Off: gamepad aiming is fully manual.',
    category: 'Gameplay Features',
    control: 'boolean',
  },
  {
    key: 'bEnableAimAssistKeyboard',
    label: 'Keyboard aim assist',
    description:
      'On: mouse & keyboard get aim assist. Off: M&K aiming is fully manual (typical for competitive play).',
    category: 'Gameplay Features',
    control: 'boolean',
  },
  {
    key: 'bEnableFastTravel',
    label: 'Fast travel',
    description:
      'On: players can fast travel between unlocked points. Off: no fast travel — travel is on foot / mount only.',
    category: 'Gameplay Features',
    control: 'boolean',
  },
  {
    key: 'bEnableFastTravelOnlyBaseCamp',
    label: 'Fast travel bases only',
    description:
      'On: fast travel is limited to base camps. Off: other unlocked fast-travel points remain available (if fast travel is on).',
    category: 'Gameplay Features',
    control: 'boolean',
  },

  // PvP
  {
    key: 'bDisplayPvPItemNumOnWorldMap_BaseCamp',
    label: 'Show base item counts on map',
    description:
      'On (PvP): world map shows item counts at base camps — useful intel for raids. Off: those counts are hidden.',
    category: 'PvP',
    control: 'boolean',
  },
  {
    key: 'bDisplayPvPItemNumOnWorldMap_Player',
    label: 'Show player item counts on map',
    description:
      'On (PvP): world map shows item counts on players. Off: player inventory counts stay private on the map.',
    category: 'PvP',
    control: 'boolean',
  },
  {
    key: 'bAdditionalDropItemWhenPlayerKillingInPvPMode',
    label: 'Extra PvP kill drops',
    description:
      'On: killing a player in PvP drops a bonus item (configured below). Off: no extra kill reward.',
    category: 'PvP',
    control: 'boolean',
  },
  {
    key: 'AdditionalDropItemWhenPlayerKillingInPvPMode',
    label: 'PvP kill drop item',
    description:
      'Item ID granted as the extra PvP kill reward when that feature is on. Must be a valid game item ID.',
    category: 'PvP',
    control: 'text',
  },
  {
    key: 'AdditionalDropItemNumWhenPlayerKillingInPvPMode',
    label: 'PvP kill drop amount',
    description:
      'Quantity of the extra PvP kill drop. Increase for bigger kill rewards; decrease (or 0) for smaller or no bonus.',
    category: 'PvP',
    control: 'integer',
    min: 0,
    max: 100,
  },

  // Voice Chat
  {
    key: 'bEnableVoiceChat',
    label: 'Voice chat',
    description:
      'On: proximity voice chat is available. Off: no in-game voice — use Discord or similar instead.',
    category: 'Voice Chat',
    control: 'boolean',
  },
  {
    key: 'VoiceChatMaxVolumeDistance',
    label: 'Full volume distance',
    description:
      'Distance at which voice chat is still at full volume. Increase so nearby players hear clearly farther; decrease for tighter proximity chat.',
    category: 'Voice Chat',
    control: 'number',
    min: 0,
    max: 50000,
    step: 100,
  },
  {
    key: 'VoiceChatZeroVolumeDistance',
    label: 'Silence distance',
    description:
      'Distance at which voice chat becomes inaudible. Increase to hear players from farther away; decrease so voices cut off sooner.',
    category: 'Voice Chat',
    control: 'number',
    min: 0,
    max: 100000,
    step: 100,
  },

  // Advanced
  {
    key: 'bUseAuth',
    label: 'Use authentication',
    description:
      'On: players must pass official platform authentication. Off: skips that check (not recommended for public servers).',
    category: 'Advanced',
    control: 'boolean',
  },
  {
    key: 'BanListURL',
    label: 'Ban list URL',
    description:
      'Remote URL the server fetches for banned players. Leave as the official list unless you host a custom ban feed.',
    category: 'Advanced',
    control: 'text',
  },
  {
    key: 'RCONEnabled',
    label: 'Enable RCON',
    description:
      'On: allows remote console admin tools over the RCON port. Off: RCON is disabled (safer if unused).',
    category: 'Advanced',
    control: 'boolean',
  },
  {
    key: 'RCONPort',
    label: 'RCON port',
    description:
      'TCP port for RCON admin connections. Only matters when RCON is enabled; forward/firewall this port carefully.',
    category: 'Advanced',
    control: 'integer',
    min: 1,
    max: 65535,
  },
  {
    key: 'RESTAPIEnabled',
    label: 'Enable REST API',
    description:
      'On: exposes the Palworld REST API for monitoring and admin scripts. Off: API endpoints are unavailable.',
    category: 'Advanced',
    control: 'boolean',
  },
  {
    key: 'RESTAPIPort',
    label: 'REST API port',
    description:
      'Port for the REST API. Only used when the API is enabled; protect it if exposed beyond localhost.',
    category: 'Advanced',
    control: 'integer',
    min: 1,
    max: 65535,
  },
  {
    key: 'bIsUseBackupSaveData',
    label: 'Backup save data',
    description:
      'On: the server keeps automatic save backups (safer against corruption). Off: no automatic backup copies.',
    category: 'Advanced',
    control: 'boolean',
  },
  {
    key: 'LogFormatType',
    label: 'Log format',
    description:
      'Text: human-readable logs. JSON: structured logs for tooling and log aggregators. Does not change gameplay.',
    category: 'Advanced',
    control: 'select',
    options: logFormatOptions,
  },
  {
    key: 'ServerReplicatePawnCullDistance',
    label: 'Pawn cull distance',
    description:
      'Distance at which pawns stop replicating to clients. Increase to see entities farther (more network cost); decrease to reduce replication load.',
    category: 'Advanced',
    control: 'number',
    min: 1000,
    max: 100000,
    step: 100,
  },
  {
    key: 'ItemContainerForceMarkDirtyInterval',
    label: 'Item container dirty interval',
    description:
      'Internal sync interval for item containers. Increase to sync less often (less overhead); decrease for more frequent inventory sync.',
    category: 'Advanced',
    control: 'number',
    min: 0.1,
    max: 60,
    step: 0.1,
  },
  {
    key: 'PlayerDataPalStorageUpdateCheckTickInterval',
    label: 'Pal storage update interval',
    description:
      'Tick interval for pal storage update checks. Increase to check less often; decrease for more frequent storage updates.',
    category: 'Advanced',
    control: 'number',
    min: 0.1,
    max: 60,
    step: 0.1,
  },
]

export const SETTINGS_BY_KEY = Object.fromEntries(
  SETTINGS_META.map((meta) => [meta.key, meta]),
) as Record<string, SettingMeta>
