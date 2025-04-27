import { createServerClient } from "@/lib/supabase/server"

/**
 * Updates player statistics after a match or tournament
 *
 * @param userId - The user ID to update stats for
 * @param gameId - The game ID the stats are for
 * @param options - Options for updating stats
 */
export async function updatePlayerStats(
  userId: string,
  gameId: string,
  options: {
    matchPlayed?: boolean
    matchWon?: boolean
    tournamentPlayed?: boolean
    tournamentWon?: boolean
    earnings?: number
  },
) {
  try {
    const supabase = await createServerClient()

    // Check if player stats record exists
    const { data: existingStats, error: fetchError } = await supabase
      .from("player_stats")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      console.error("Error fetching player stats:", fetchError)
      return
    }

    const { matchPlayed, matchWon, tournamentPlayed, tournamentWon, earnings } = options

    if (existingStats) {
      // Update existing stats
      const updates: any = {}

      if (matchPlayed) updates.matches_played = existingStats.matches_played + 1
      if (matchWon) updates.matches_won = existingStats.matches_won + 1
      if (tournamentPlayed) updates.tournaments_played = existingStats.tournaments_played + 1
      if (tournamentWon) updates.tournaments_won = existingStats.tournaments_won + 1
      if (earnings) updates.total_earnings = existingStats.total_earnings + earnings

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase.from("player_stats").update(updates).eq("id", existingStats.id)

        if (updateError) {
          console.error("Error updating player stats:", updateError)
        }
      }
    } else {
      // Create new stats record
      const newStats = {
        user_id: userId,
        game_id: gameId,
        matches_played: matchPlayed ? 1 : 0,
        matches_won: matchWon ? 1 : 0,
        tournaments_played: tournamentPlayed ? 1 : 0,
        tournaments_won: tournamentWon ? 1 : 0,
        total_earnings: earnings || 0,
      }

      const { error: insertError } = await supabase.from("player_stats").insert(newStats)

      if (insertError) {
        console.error("Error creating player stats:", insertError)
      }
    }
  } catch (error) {
    console.error("Error in updatePlayerStats:", error)
  }
}
