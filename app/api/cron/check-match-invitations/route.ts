import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { handleMatchForfeit } from "@/lib/utils/match-utils"

export async function GET(request: Request) {
  try {
    // Verify authorization (you should implement a proper auth check here)
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    // In production, validate this token against an expected value
    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Find expired invitations
    const now = new Date().toISOString()
    const { data: expiredInvitations, error } = await supabase
      .from("match_invitations")
      .select("id, match_id, team_id")
      .eq("status", "pending")
      .lt("acceptance_deadline", now)

    if (error) {
      throw error
    }

    // Process each expired invitation
    const results = []
    for (const invitation of expiredInvitations || []) {
      // Update invitation status
      await supabase
        .from("match_invitations")
        .update({
          status: "expired",
          responded_at: now,
        })
        .eq("id", invitation.id)

      // Handle forfeit
      const result = await handleMatchForfeit(invitation.match_id, invitation.team_id)
      results.push({
        invitationId: invitation.id,
        matchId: invitation.match_id,
        teamId: invitation.team_id,
        success: result.success,
      })
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error("Error checking match invitations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
