import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// This is a special endpoint that allows running essential migrations
// without requiring admin privileges
export async function GET() {
  try {
    const supabase = await createServerClient()

    // SQL to safely add missing columns to matches table
    const sql = `
      -- This migration adds commonly needed columns to the matches table if they don't exist
      DO $$
      BEGIN
        -- Add game_id column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'matches'
          AND column_name = 'game_id'
        ) THEN
          ALTER TABLE matches ADD COLUMN game_id UUID REFERENCES games(id);
          CREATE INDEX IF NOT EXISTS idx_matches_game_id ON matches(game_id);
        END IF;

        -- Add name column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'matches'
          AND column_name = 'name'
        ) THEN
          ALTER TABLE matches ADD COLUMN name TEXT;
        END IF;

        -- Add description column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'matches'
          AND column_name = 'description'
        ) THEN
          ALTER TABLE matches ADD COLUMN description TEXT;
        END IF;

        -- Add match_notes column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'matches'
          AND column_name = 'match_notes'
        ) THEN
          ALTER TABLE matches ADD COLUMN match_notes TEXT;
        END IF;

        -- Add is_private column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'matches'
          AND column_name = 'is_private'
        ) THEN
          ALTER TABLE matches ADD COLUMN is_private BOOLEAN DEFAULT false;
        END IF;

        -- Add match_type column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'matches'
          AND column_name = 'match_type'
        ) THEN
          ALTER TABLE matches ADD COLUMN match_type TEXT;
        END IF;

        -- Add game_mode column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'matches'
          AND column_name = 'game_mode'
        ) THEN
          ALTER TABLE matches ADD COLUMN game_mode TEXT;
        END IF;

        -- Add team_size column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'matches'
          AND column_name = 'team_size'
        ) THEN
          ALTER TABLE matches ADD COLUMN team_size INTEGER DEFAULT 4;
        END IF;
      END
      $$;
    `

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("Error running migration:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Database schema updated successfully with all required columns",
    })
  } catch (err) {
    console.error("Exception in run-essential-migration:", err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
