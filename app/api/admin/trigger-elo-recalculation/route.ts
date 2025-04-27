import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { EloService } from "@/lib/services/elo-service"

export async function POST() {
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
      console.error("Error fetching matches:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json({ 
        success: true,
        matchesProcessed: 0,
        message: "No matches to process" 
      })
    }

    // Process each match
    const results = []
    let successCount = 0
    
    for (const match of matches) {
      try {
        const success = await EloService.updateRatingsForMatch(match.id)
        
        if (success) {
          await supabase
            .from("matches")
            .update({ elo_processed: true })
            .eq("id", match.id)
          
          successCount++
        }
        
        results.push({ matchId: match.id, success })
      } catch (matchError) {
        console.error(`Error processing match ${match.id}:`, matchError)
        results.push({ 
          matchId: match.id, 
          success: false, 
          error: matchError instanceof Error ? matchError.message : "Unknown error" 
        })
      }
    }

    // Try to log to cron_job_logs if it exists, but don't fail if it doesn't
    try {
      await supabase.from("cron_job_logs").insert({
        job_name: "elo_recalculation",
        status: "completed",
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        items_processed: successCount,
        details: { results },
        manual: true
      })
    } catch (logError) {
      // Ignore errors from logging - the table might not exist yet
      console.log("Could not log to cron_job_logs (table might not exist yet)")
    }

    return NextResponse.json({
      success: true,
      matchesProcessed: successCount,
      totalMatches: matches.length,
      message: `Processed ${successCount} out of ${matches.length} matches`,
      results,
    })
  } catch (err) {
    console.error("Error in trigger-elo-recalculation:", err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
