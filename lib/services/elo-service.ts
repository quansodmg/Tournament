import { createServerClient } from "@/lib/supabase/server"
import { EloCalculator } from "@/lib/utils/elo-calculator"

export class EloService {
  /**
   * Updates ELO ratings for a completed match
   * @param matchId The ID of the completed match
   * @returns Boolean indicating success
   */
  static async updateRatingsForMatch(matchId: string): Promise<boolean> {
    try {
      const supabase = await createServerClient()

      // Get match details with teams
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select(`
          id,
          game_id,
          team1_id,
          team2_id,
          winner_id,
          team1:team1_id (id, name),
          team2:team2_id (id, name)
        `)
        .eq("id", matchId)
        .single()

      if (matchError || !match) {
        console.error("Error fetching match:", matchError)
        return false
      }

      // If no winner is set, we can't update ELO
      if (!match.winner_id) {
        console.error("Match has no winner set:", matchId)
        return false
      }

      // Get current ELO ratings for both teams
      const { data: ratings, error: ratingsError } = await supabase
        .from("elo_ratings")
        .select("team_id, rating, game_id")
        .in("team_id", [match.team1_id, match.team2_id])
        .in("game_id", [match.game_id, null]) // Get both game-specific and overall ratings

      if (ratingsError) {
        console.error("Error fetching ratings:", ratingsError)
        return false
      }

      // Organize ratings by team and type (game-specific or overall)
      const team1GameRating =
        ratings.find((r) => r.team_id === match.team1_id && r.game_id === match.game_id)?.rating || 1200
      const team2GameRating =
        ratings.find((r) => r.team_id === match.team2_id && r.game_id === match.game_id)?.rating || 1200
      const team1OverallRating = ratings.find((r) => r.team_id === match.team1_id && r.game_id === null)?.rating || 1200
      const team2OverallRating = ratings.find((r) => r.team_id === match.team2_id && r.game_id === null)?.rating || 1200

      // Determine match outcome (1 for team1 win, 0 for team2 win, 0.5 for draw)
      const outcome = match.winner_id === match.team1_id ? 1 : 0

      // Calculate new ratings
      const { player1NewRating: team1NewGameRating, player2NewRating: team2NewGameRating } =
        EloCalculator.calculateNewRatings(team1GameRating, team2GameRating, outcome)

      const { player1NewRating: team1NewOverallRating, player2NewRating: team2NewOverallRating } =
        EloCalculator.calculateNewRatings(team1OverallRating, team2OverallRating, outcome)

      // Update or insert game-specific ratings
      await this.upsertRating(match.team1_id, match.game_id, team1NewGameRating)
      await this.upsertRating(match.team2_id, match.game_id, team2NewGameRating)

      // Update or insert overall ratings
      await this.upsertRating(match.team1_id, null, team1NewOverallRating)
      await this.upsertRating(match.team2_id, null, team2NewOverallRating)

      // Record ELO history
      await this.recordEloHistory(match.id, match.team1_id, team1GameRating, team1NewGameRating, match.game_id)
      await this.recordEloHistory(match.id, match.team2_id, team2GameRating, team2NewGameRating, match.game_id)
      await this.recordEloHistory(match.id, match.team1_id, team1OverallRating, team1NewOverallRating, null)
      await this.recordEloHistory(match.id, match.team2_id, team2OverallRating, team2NewOverallRating, null)

      return true
    } catch (error) {
      console.error("Error updating ELO ratings:", error)
      return false
    }
  }

  /**
   * Updates or inserts an ELO rating for a team
   */
  private static async upsertRating(teamId: string, gameId: string | null, rating: number): Promise<void> {
    const supabase = await createServerClient()

    await supabase.from("elo_ratings").upsert(
      {
        team_id: teamId,
        game_id: gameId,
        rating: rating,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "team_id,game_id",
      },
    )
  }

  /**
   * Records ELO rating changes in history table
   */
  private static async recordEloHistory(
    matchId: string,
    teamId: string,
    oldRating: number,
    newRating: number,
    gameId: string | null,
  ): Promise<void> {
    const supabase = await createServerClient()

    await supabase.from("elo_history").insert({
      match_id: matchId,
      team_id: teamId,
      game_id: gameId,
      old_rating: oldRating,
      new_rating: newRating,
      change: newRating - oldRating,
      created_at: new Date().toISOString(),
    })
  }
}
