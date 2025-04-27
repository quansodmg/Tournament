import { type NextRequest, NextResponse } from "next/server"
import { GameApiFactory, type SupportedGame } from "@/lib/api/game-api-factory"

export async function GET(request: NextRequest, { params }: { params: { game: string } }) {
  try {
    // Check if the game is supported
    const game = params.game as SupportedGame
    const searchParams = request.nextUrl.searchParams

    // Get action and required parameters
    const action = searchParams.get("action")
    const region = searchParams.get("region") || undefined

    if (!action) {
      return NextResponse.json({ error: "Missing required parameter: action" }, { status: 400 })
    }

    // Create game service
    try {
      const gameService = GameApiFactory.getGameService(game, { region })

      // Handle different actions
      switch (action) {
        case "profile": {
          const playerId = searchParams.get("playerId")
          if (!playerId) {
            return NextResponse.json({ error: "Missing required parameter: playerId" }, { status: 400 })
          }
          const response = await gameService.getPlayerProfile(playerId)
          return NextResponse.json(response)
        }

        case "stats": {
          const playerId = searchParams.get("playerId")
          if (!playerId) {
            return NextResponse.json({ error: "Missing required parameter: playerId" }, { status: 400 })
          }
          const response = await gameService.getPlayerStats(playerId)
          return NextResponse.json(response)
        }

        case "matches": {
          const playerId = searchParams.get("playerId")
          const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined

          if (!playerId) {
            return NextResponse.json({ error: "Missing required parameter: playerId" }, { status: 400 })
          }

          const response = await gameService.getRecentMatches(playerId, limit)
          return NextResponse.json(response)
        }

        case "match": {
          const matchId = searchParams.get("matchId")
          if (!matchId) {
            return NextResponse.json({ error: "Missing required parameter: matchId" }, { status: 400 })
          }
          const response = await gameService.getMatch(matchId)
          return NextResponse.json(response)
        }

        case "leaderboard": {
          const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
          const response = await gameService.getLeaderboard(region, limit)
          return NextResponse.json(response)
        }

        case "search": {
          const username = searchParams.get("username")
          if (!username) {
            return NextResponse.json({ error: "Missing required parameter: username" }, { status: 400 })
          }
          const response = await gameService.searchPlayer(username)
          return NextResponse.json(response)
        }

        case "tournaments": {
          const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
          const response = await gameService.getTournaments(limit)
          return NextResponse.json(response)
        }

        case "live": {
          const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
          const response = await gameService.getLiveMatches(limit)
          return NextResponse.json(response)
        }

        default:
          return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 })
      }
    } catch (error) {
      console.error(`Error in game API (${game}):`, error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Unknown error occurred" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Unexpected error in game-data API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
