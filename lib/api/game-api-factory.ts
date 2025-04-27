import type { BaseGameService } from "./core/base-game-service"
import { LeagueOfLegendsService } from "./games/league-of-legends"
import { CSGOService } from "./games/csgo"
import { API_CONFIG, ENV_KEYS } from "./config"

export type SupportedGame = "league-of-legends" | "csgo" | "valorant" | "dota2" | "overwatch"

export class GameApiFactory {
  private static services: Record<string, BaseGameService> = {}

  static getGameService(game: SupportedGame, options: { region?: string } = {}): BaseGameService {
    const cacheKey = `${game}-${options.region || "default"}`

    // Return cached service if available
    if (this.services[cacheKey]) {
      return this.services[cacheKey]
    }

    // Create new service based on game
    let service: BaseGameService

    switch (game) {
      case "league-of-legends":
        service = new LeagueOfLegendsService({
          apiKey: process.env[ENV_KEYS.RIOT_API_KEY],
          region: options.region || "na1",
          baseUrl: API_CONFIG.RIOT_GAMES.BASE_URL,
        })
        break

      case "csgo":
        service = new CSGOService({
          apiKey: process.env[ENV_KEYS.STEAM_API_KEY],
          baseUrl: API_CONFIG.STEAM.BASE_URL,
        })
        break

      // Add more game services as they're implemented

      default:
        throw new Error(`Game API not implemented for: ${game}`)
    }

    // Cache the service
    this.services[cacheKey] = service

    return service
  }

  static clearCache() {
    this.services = {}
  }
}
