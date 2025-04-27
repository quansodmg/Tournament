import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import fs from "fs"
import path from "path"

export async function GET(request: Request) {
  try {
    // Get the migration file from the query parameter
    const { searchParams } = new URL(request.url)
    const migrationFile = searchParams.get("file")

    if (!migrationFile) {
      return NextResponse.json({ error: "No migration file specified" }, { status: 400 })
    }

    // Security check - only allow specific migration files
    const allowedMigrations = ["create_cron_job_logs_table.sql"]
    if (!allowedMigrations.includes(migrationFile)) {
      return NextResponse.json({ error: "Invalid migration file" }, { status: 400 })
    }

    // Read the migration file
    const migrationPath = path.join(process.cwd(), "migrations", migrationFile)
    let sql

    try {
      sql = fs.readFileSync(migrationPath, "utf8")
    } catch (err) {
      return NextResponse.json({ error: "Could not read migration file" }, { status: 500 })
    }

    // Run the migration
    const supabase = await createServerClient()
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("Error running migration:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Migration ${migrationFile} executed successfully`,
    })
  } catch (err) {
    console.error("Exception in run-migration:", err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
