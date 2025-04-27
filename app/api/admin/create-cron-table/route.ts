import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createServerClient()

    // Create the table
    const { error: createTableError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS cron_job_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        job_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        duration_ms INTEGER,
        items_processed INTEGER DEFAULT 0,
        details JSONB,
        error TEXT
      )
    `)

    if (createTableError) {
      console.error("Error creating table:", createTableError)
      return NextResponse.json({ error: createTableError.message }, { status: 500 })
    }

    // Create the first index
    const { error: index1Error } = await supabase.query(`
      CREATE INDEX IF NOT EXISTS cron_job_logs_job_name_idx ON cron_job_logs(job_name)
    `)

    if (index1Error) {
      console.error("Error creating first index:", index1Error)
      // Continue anyway, the table is created
    }

    // Create the second index
    const { error: index2Error } = await supabase.query(`
      CREATE INDEX IF NOT EXISTS cron_job_logs_started_at_idx ON cron_job_logs(started_at)
    `)

    if (index2Error) {
      console.error("Error creating second index:", index2Error)
      // Continue anyway, the table is created
    }

    return NextResponse.json({
      success: true,
      message: "Cron job logs table created successfully",
    })
  } catch (err) {
    console.error("Exception in create-cron-table:", err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
