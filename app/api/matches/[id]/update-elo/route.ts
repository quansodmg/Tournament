import { NextResponse } from "next/server"
import { EloService } from "@/lib/services/elo-service"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const matchId = params.id
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc("is_admin", {
      user_id: session.user.id,
    })

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Check if match exists and is completed
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("status")
      .eq("id", matchId)
      .single()

    if (matchError || !match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    if (match.status !== "completed") {
      return NextResponse.json({ error: "Match is not completed" }, { status: 400 })
    }

    // Update ELO ratings
    const success = await EloService.updateRatingsForMatch(matchId)

    if (!success) {
      return NextResponse.json({ error: "Failed to update ELO ratings" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating ELO ratings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
