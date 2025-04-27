// Common interfaces for game data across different APIs

export interface GameProfile {
  id: string
  username: string
  displayName: string
  avatarUrl?: string
  level?: number
  region?: string
  gameSpecificData?: any
}

export interface GameStats {
  wins: number
  losses: number
  winRate: number
  totalMatches: number
  rank?: string
  rankTier?: number
  rankDivision?: string
  rankIconUrl?: string
  eloRating?: number
  gameSpecificStats?: any
}

export interface GameMatch {
  id: string
  gameId: string
  startTime: string
  endTime?: string
  duration?: number
  mapName?: string
  mode?: string
  result?: "win" | "loss" | "draw" | "ongoing"
  score?: {
    team1: number
    team2: number
  }
  participants?: GameMatchParticipant[]
  gameSpecificData?: any
}

export interface GameMatchParticipant {
  id: string
  profileId: string
  username: string
  teamId?: string
  teamName?: string
  champion?: string
  role?: string
  stats?: {
    kills?: number
    deaths?: number
    assists?: number
    score?: number
    [key: string]: any
  }
}

export interface GameLeaderboard {
  id: string
  name: string
  region?: string
  entries: GameLeaderboardEntry[]
  updatedAt: string
}

export interface GameLeaderboardEntry {
  rank: number
  profileId: string
  username: string
  displayName?: string
  avatarUrl?: string
  score: number
  wins?: number
  losses?: number
  gameSpecificData?: any
}

export interface GameTournament {
  id: string
  name: string
  startDate: string
  endDate: string
  region?: string
  prizePool?: string
  teams?: {
    id: string
    name: string
    logoUrl?: string
  }[]
  matches?: GameMatch[]
  gameSpecificData?: any
}

// Game-specific API response types will extend these interfaces
