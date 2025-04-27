import { ApiClient, type ApiResponse } from "./api-client"
import type { GameProfile, GameStats, GameMatch, GameLeaderboard, GameTournament } from "../types/game-data"

export interface GameServiceConfig {
  apiKey?: string
  region?: string
  language?: string
  baseUrl: string
}

export abstract class BaseGameService {
  protected apiClient: ApiClient
  protected config: GameServiceConfig

  constructor(config: GameServiceConfig) {
    this.config = config
    this.apiClient = new ApiClient(config.baseUrl, {
      headers: {
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
    })
  }

  // Abstract methods that each game service must implement
  abstract getPlayerProfile(playerId: string): Promise<ApiResponse<GameProfile>>
  abstract getPlayerStats(playerId: string): Promise<ApiResponse<GameStats>>
  abstract getRecentMatches(playerId: string, limit?: number): Promise<ApiResponse<GameMatch[]>>
  abstract getMatch(matchId: string): Promise<ApiResponse<GameMatch>>
  abstract getLeaderboard(region?: string, limit?: number): Promise<ApiResponse<GameLeaderboard>>
  abstract searchPlayer(username: string): Promise<ApiResponse<GameProfile[]>>

  // Optional methods that game services can implement
  async getTournaments(limit?: number): Promise<ApiResponse<GameTournament[]>> {
    return {
      data: null,
      error: "Not implemented for this game",
      status: 501,
    }
  }

  async getLiveMatches(limit?: number): Promise<ApiResponse<GameMatch[]>> {
    return {
      data: null,
      error: "Not implemented for this game",
      status: 501,
    }
  }

  // Helper methods for all game services
  protected handleError(error: any): ApiResponse<null> {
    console.error("Game API error:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      status: error.status || 500,
    }
  }
}
