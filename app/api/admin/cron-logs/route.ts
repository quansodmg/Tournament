import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Get the latest cron job logs
    const { data, error } = await supabase
      .from("cron_job_logs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error fetching cron logs:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      logs: data || [],
    })
  } catch (err) {
    console.error("Exception in cron-logs:", err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
