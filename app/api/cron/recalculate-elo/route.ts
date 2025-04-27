import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { EloService } from "@/lib/services/elo-service"

export async function POST(request: Request) {
  // Create a log entry for this execution
  const supabase = await createServerClient()
  const { data: logEntry, error: logError } = await supabase
    .from("cron_job_logs")
    .insert({
      job_name: "recalculate-elo",
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  const logId = logEntry?.id

  try {
    // Verify the request is authorized
    const authHeader = request.headers.get("authorization")
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Update log with error
      if (logId) {
        await supabase
          .from("cron_job_logs")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
            error: "Unauthorized request",
          })
          .eq("id", logId)
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get completed matches that might need ELO recalculation
    const startTime = Date.now()
    const { data: matches, error } = await supabase
      .from("matches")
      .select("id")
      .eq("status", "completed")
      .is("elo_processed", null)
      .order("end_time", { ascending: true }) // Use end_time instead of completed_at
      .limit(50)

    if (error) {
      throw error
    }

    if (!matches || matches.length === 0) {
      // Update log with completion info
      if (logId) {
        const endTime = Date.now()
        await supabase
          .from("cron_job_logs")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            duration_ms: endTime - startTime,
            items_processed: 0,
            details: { message: "No matches to process" },
          })
          .eq("id", logId)
      }
      return NextResponse.json({ message: "No matches to process" })
    }

    // Process each match
    const results = []
    for (const match of matches) {
      const success = await EloService.updateRatingsForMatch(match.id)
      await supabase.from("matches").update({ elo_processed: true }).eq("id", match.id)
      results.push({ matchId: match.id, success })
    }

    // Update log with completion info
    if (logId) {
      const endTime = Date.now()
      await supabase
        .from("cron_job_logs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          duration_ms: endTime - startTime,
          items_processed: matches.length,
          details: { results },
        })
        .eq("id", logId)
    }

    return NextResponse.json({
      message: `Processed ${matches.length} matches`,
      results,
    })
  } catch (error) {
    console.error("Error in ELO recalculation cron:", error)

    // Update log with error info
    if (logId) {
      await supabase
        .from("cron_job_logs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error),
        })
        .eq("id", logId)
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Also support GET requests
export { POST as GET }
