import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase
      .from("match_participants")
      .select(`
        *,
        team:team_id(*),
        profile:profile_id(*)
      `)
      .eq("match_id", params.id)

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching match participants:", error)
    return NextResponse.json({ error: "Failed to fetch match participants" }, { status: 500 })
  }
}
