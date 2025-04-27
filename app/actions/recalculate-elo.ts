"use server"

import { createServerClient } from "@/lib/supabase/server"
import { EloService } from "@/lib/services/elo-service"

/**
 * Server action to recalculate ELO ratings
 * This keeps the CRON_SECRET secure on the server
 */
export async function recalculateEloRatings() {
  try {
    const supabase = await createServerClient()

    // Get completed matches that might need ELO recalculation
    const { data: matches, error } = await supabase
      .from("matches")
      .select("id")
      .eq("status", "completed")
      .is("elo_processed", null)
      .order("completed_at", { ascending: true })
      .limit(50)

    if (error) {
      throw error
    }

    if (!matches || matches.length === 0) {
      return { success: true, message: "No matches to process", results: [] }
    }

    // Process each match
    const results = []
    for (const match of matches) {
      const success = await EloService.updateRatingsForMatch(match.id)

      // Mark the match as processed
      await supabase.from("matches").update({ elo_processed: true }).eq("id", match.id)

      results.push({ matchId: match.id, success })
    }

    return {
      success: true,
      message: `Processed ${matches.length} matches`,
      results,
    }
  } catch (error: any) {
    console.error("Error in ELO recalculation:", error)
    return {
      success: false,
      message: error.message || "An error occurred during ELO recalculation",
      results: [],
    }
  }
}
