import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase
      .from("tournament_registrations")
      .select(`
        *,
        team:team_id(*),
        profile:profile_id(*)
      `)
      .eq("tournament_id", params.id)

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching tournament registrations:", error)
    return NextResponse.json({ error: "Failed to fetch tournament registrations" }, { status: 500 })
  }
}
