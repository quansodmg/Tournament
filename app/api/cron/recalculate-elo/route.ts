import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { EloService } from "@/lib/services/elo-service"

export async function GET(request: Request) {
  try {
    // Verify the request is authorized using CRON_SECRET only
    const authHeader = request.headers.get("authorization")
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
      return NextResponse.json({ message: "No matches to process" })
    }

    // Process each match
    const results = []
    for (const match of matches) {
      const success = await EloService.updateRatingsForMatch(match.id)
      await supabase.from("matches").update({ elo_processed: true }).eq("id", match.id)
      results.push({ matchId: match.id, success })
    }

    return NextResponse.json({
      message: `Processed ${matches.length} matches`,
      results,
    })
  } catch (error) {
    console.error("Error in ELO recalculation cron:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Also support POST requests for manual triggering
export { GET as POST }
