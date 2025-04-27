import { BaseGameService, type GameServiceConfig } from "../core/base-game-service"
import type { ApiResponse } from "../core/api-client"
import type { GameProfile, GameStats, GameMatch, GameLeaderboard } from "../types/game-data"

interface SteamPlayerSummary {
  steamid: string
  communityvisibilitystate: number
  profilestate: number
  personaname: string
  profileurl: string
  avatar: string
  avatarmedium: string
  avatarfull: string
  lastlogoff: number
  personastate: number
  primaryclanid?: string
  timecreated?: number
  personastateflags?: number
  loccountrycode?: string
}

interface CSGOPlayerStats {
  steamid: string
  stats: {
    total_kills: number
    total_deaths: number
    total_time_played: number
    total_wins: number
    total_matches_played: number
    total_shots_fired: number
    total_shots_hit: number
    total_mvps: number
    [key: string]: number
  }
}

export class CSGOService extends BaseGameService {
  constructor(config: GameServiceConfig) {
    super(config)
  }

  async getPlayerProfile(steamId: string): Promise<ApiResponse<GameProfile>> {
    try {
      // Convert vanity URL to Steam ID if needed
      if (isNaN(Number(steamId))) {
        const vanityResponse = await this.apiClient.get<any>(
          `/ISteamUser/ResolveVanityURL/v1?vanityurl=${steamId}&key=${this.config.apiKey}`,
        )

        if (vanityResponse.error || !vanityResponse.data?.response?.steamid) {
          return {
            data: null,
            error: "Could not resolve vanity URL to Steam ID",
            status: 400,
          }
        }

        steamId = vanityResponse.data.response.steamid
      }

      // Get player summary from Steam API
      const response = await this.apiClient.get<any>(
        `/ISteamUser/GetPlayerSummaries/v2?steamids=${steamId}&key=${this.config.apiKey}`,
      )

      if (response.error || !response.data?.response?.players?.[0]) {
        return {
          data: null,
          error: response.error || "Player not found",
          status: response.status || 404,
        }
      }

      const player = response.data.response.players[0] as SteamPlayerSummary

      return {
        data: {
          id: player.steamid,
          username: player.personaname,
          displayName: player.personaname,
          avatarUrl: player.avatarfull,
          region: player.loccountrycode,
          gameSpecificData: {
            profileUrl: player.profileurl,
            visibility: player.communityvisibilitystate,
            lastLogoff: player.lastlogoff ? new Date(player.lastlogoff * 1000).toISOString() : undefined,
          },
        },
        error: null,
        status: response.status,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getPlayerStats(steamId: string): Promise<ApiResponse<GameStats>> {
    try {
      // CS:GO App ID is 730
      const response = await this.apiClient.get<any>(
        `/ISteamUserStats/GetUserStatsForGame/v2?appid=730&steamid=${steamId}&key=${this.config.apiKey}`,
      )

      if (response.error || !response.data?.playerstats?.stats) {
        return {
          data: {
            wins: 0,
            losses: 0,
            winRate: 0,
            totalMatches: 0,
          },
          error: response.error || "Stats not available",
          status: response.status,
        }
      }

      const stats = response.data.playerstats as CSGOPlayerStats
      const gameStats = stats.stats

      // Extract relevant stats
      const wins = gameStats.total_wins || 0
      const totalMatches = gameStats.total_matches_played || 0
      const losses = totalMatches - wins
      const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0

      // Calculate accuracy
      const shotsFired = gameStats.total_shots_fired || 0
      const shotsHit = gameStats.total_shots_hit || 0
      const accuracy = shotsFired > 0 ? (shotsHit / shotsFired) * 100 : 0

      return {
        data: {
          wins,
          losses,
          winRate: Math.round(winRate * 100) / 100,
          totalMatches,
          gameSpecificStats: {
            kills: gameStats.total_kills,
            deaths: gameStats.total_deaths,
            timePlayed: gameStats.total_time_played,
            accuracy: Math.round(accuracy * 100) / 100,
            mvps: gameStats.total_mvps,
            headshots: gameStats.total_kills_headshot,
          },
        },
        error: null,
        status: response.status,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getRecentMatches(steamId: string, limit = 10): Promise<ApiResponse<GameMatch[]>> {
    // Steam API doesn't provide match history for CS:GO
    // We would need to use a third-party API like FACEIT or ESEA
    // For now, returning a mock response
    return {
      data: [],
      error: "Match history not available through Steam API",
      status: 501,
    }
  }

  async getMatch(matchId: string): Promise<ApiResponse<GameMatch>> {
    // Steam API doesn't provide match details for CS:GO
    return {
      data: null,
      error: "Match details not available through Steam API",
      status: 501,
    }
  }

  async getLeaderboard(region?: string, limit = 100): Promise<ApiResponse<GameLeaderboard>> {
    // Steam API doesn't provide leaderboards for CS:GO
    return {
      data: null,
      error: "Leaderboards not available through Steam API",
      status: 501,
    }
  }

  async searchPlayer(username: string): Promise<ApiResponse<GameProfile[]>> {
    // Steam API doesn't provide search functionality
    // We can only look up by Steam ID or vanity URL
    return {
      data: [],
      error: "Player search not available through Steam API",
      status: 501,
    }
  }
}
