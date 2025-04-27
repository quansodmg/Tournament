export type GameMode = "tdm" | "snd" | "hp" | "control" | "ffa" | "gunfight"

export interface Map {
  id: string
  name: string
  modes: GameMode[]
  imageUrl?: string
}

export interface RuleSet {
  id: string
  name: string
  gameMode: GameMode
  description: string
  teamSize: number
  maps: string[]
  rules: {
    scoreLimit?: number
    timeLimit?: number
    roundsToWin?: number
    customRules?: string[]
  }
}

export const codMaps: Map[] = [
  {
    id: "nuketown",
    name: "Nuketown",
    modes: ["tdm", "hp", "snd", "ffa"],
    imageUrl: "/nuketown-standoff.png",
  },
  {
    id: "shipment",
    name: "Shipment",
    modes: ["tdm", "hp", "ffa", "gunfight"],
    imageUrl: "/container-yard-conflict.png",
  },
  {
    id: "shoothouse",
    name: "Shoot House",
    modes: ["tdm", "hp", "snd", "control", "ffa"],
    imageUrl: "/urban-training-facility.png",
  },
  {
    id: "rust",
    name: "Rust",
    modes: ["tdm", "ffa", "gunfight"],
    imageUrl: "/desert-scrapyard-showdown.png",
  },
  {
    id: "terminal",
    name: "Terminal",
    modes: ["tdm", "snd", "hp", "ffa"],
    imageUrl: "/airport-terminal-conflict.png",
  },
  {
    id: "crash",
    name: "Crash",
    modes: ["tdm", "snd", "hp", "ffa"],
    imageUrl: "/placeholder.svg?height=128&width=256&query=Crash Call of Duty map",
  },
  {
    id: "vacant",
    name: "Vacant",
    modes: ["tdm", "snd", "hp", "ffa"],
    imageUrl: "/placeholder.svg?height=128&width=256&query=Vacant Call of Duty map",
  },
  {
    id: "hackney_yard",
    name: "Hackney Yard",
    modes: ["tdm", "snd", "hp", "control", "ffa"],
    imageUrl: "/placeholder.svg?height=128&width=256&query=Hackney Yard Call of Duty map",
  },
  {
    id: "gun_runner",
    name: "Gun Runner",
    modes: ["tdm", "snd", "hp", "control", "ffa"],
    imageUrl: "/placeholder.svg?height=128&width=256&query=Gun Runner Call of Duty map",
  },
  {
    id: "azhir_cave",
    name: "Azhir Cave",
    modes: ["tdm", "snd", "hp", "ffa"],
    imageUrl: "/placeholder.svg?height=128&width=256&query=Azhir Cave Call of Duty map",
  },
]

export const codRuleSets: RuleSet[] = [
  {
    id: "tdm_standard",
    name: "Team Deathmatch - Standard",
    gameMode: "tdm",
    description: "Standard Team Deathmatch ruleset",
    teamSize: 4,
    maps: ["nuketown", "shipment", "shoothouse", "rust", "terminal", "crash", "vacant", "hackney_yard", "gun_runner"],
    rules: {
      scoreLimit: 75,
      timeLimit: 10,
      customRules: ["All weapons allowed", "All killstreaks allowed", "All perks allowed"],
    },
  },
  {
    id: "tdm_competitive",
    name: "Team Deathmatch - Competitive",
    gameMode: "tdm",
    description: "Competitive Team Deathmatch ruleset with restricted items",
    teamSize: 4,
    maps: ["nuketown", "shoothouse", "terminal", "crash", "hackney_yard", "gun_runner"],
    rules: {
      scoreLimit: 100,
      timeLimit: 10,
      customRules: [
        "Restricted weapons: Shotguns, Riot Shields",
        "Restricted perks: Overkill",
        "Restricted equipment: C4, Claymores",
      ],
    },
  },
  {
    id: "snd_standard",
    name: "Search and Destroy - Standard",
    gameMode: "snd",
    description: "Standard Search and Destroy ruleset",
    teamSize: 4,
    maps: ["nuketown", "shoothouse", "terminal", "crash", "vacant", "hackney_yard", "gun_runner"],
    rules: {
      roundsToWin: 6,
      timeLimit: 1.5,
      customRules: ["All weapons allowed", "All perks allowed", "Plant/defuse time: 5 seconds"],
    },
  },
  {
    id: "snd_competitive",
    name: "Search and Destroy - Competitive",
    gameMode: "snd",
    description: "Competitive Search and Destroy ruleset",
    teamSize: 4,
    maps: ["terminal", "crash", "vacant", "hackney_yard", "gun_runner"],
    rules: {
      roundsToWin: 6,
      timeLimit: 1.5,
      customRules: [
        "Restricted weapons: Shotguns, Riot Shields, Snipers with Thermal scopes",
        "Restricted perks: Overkill, Tracker",
        "Restricted equipment: C4, Claymores, Proximity Mines",
        "Plant/defuse time: 5 seconds",
      ],
    },
  },
  {
    id: "hp_standard",
    name: "Hardpoint - Standard",
    gameMode: "hp",
    description: "Standard Hardpoint ruleset",
    teamSize: 4,
    maps: ["nuketown", "shoothouse", "terminal", "crash", "hackney_yard", "gun_runner"],
    rules: {
      scoreLimit: 250,
      timeLimit: 10,
      customRules: ["All weapons allowed", "All perks allowed", "Hardpoint rotation: 60 seconds"],
    },
  },
  {
    id: "gunfight_standard",
    name: "Gunfight - Standard",
    gameMode: "gunfight",
    description: "Standard 2v2 Gunfight ruleset",
    teamSize: 2,
    maps: ["shipment", "rust"],
    rules: {
      roundsToWin: 6,
      timeLimit: 0.75,
      customRules: ["Random weapons each round", "No custom loadouts", "Overtime flag spawns after 40 seconds"],
    },
  },
]

export function getRuleSetById(id: string): RuleSet | undefined {
  return codRuleSets.find((ruleset) => ruleset.id === id)
}

export function getMapsForGameMode(gameMode: GameMode): Map[] {
  return codMaps.filter((map) => map.modes.includes(gameMode))
}

export function getAvailableRuleSets(gameMode?: GameMode): RuleSet[] {
  if (!gameMode) return codRuleSets
  return codRuleSets.filter((ruleset) => ruleset.gameMode === gameMode)
}
