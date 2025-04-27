import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json()
    const { matchData, teamId, gameId, matchSettings, isWager, wagerAmount } = body

    // Create a regular server-side Supabase client for auth checks
    const supabase = await createServerClient()

    // Get the current user's ID from the session
    const cookieStore = cookies()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Validate required fields
    if (!teamId || !gameId || !matchData.start_time || !matchData.end_time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Ensure the user is authorized to create matches for this team
    // Use the correct syntax for Supabase's select method
    const { data: teamMember, error: teamError } = await supabase
      .from("team_members")
      .select("role") // Removed table name qualifier
      .eq("team_id", teamId) // Simplified column reference
      .eq("profile_id", userId) // Simplified column reference
      .single()

    if (teamError) {
      console.error("Team member query error:", teamError)
      return NextResponse.json({ error: "Failed to verify team membership: " + teamError.message }, { status: 500 })
    }

    if (!teamMember || (teamMember.role !== "captain" && teamMember.role !== "owner")) {
      return NextResponse.json({ error: "You must be a team captain or owner to create matches" }, { status: 403 })
    }

    // Create an admin client that can bypass RLS
    const adminClient = createAdminClient()

    // Add the user ID to the match data
    const finalMatchData = {
      ...matchData,
      scheduled_by: userId,
      status: "pending",
    }

    console.log("Creating match with data:", finalMatchData)

    // Create the match using the admin client (bypasses RLS)
    const { data: match, error: matchError } = await adminClient
      .from("matches")
      .insert(finalMatchData)
      .select()
      .single()

    if (matchError) {
      console.error("Error creating match:", matchError)
      return NextResponse.json({ error: matchError.message }, { status: 500 })
    }

    console.log("Match created:", match)

    // Create match settings
    try {
      const { error: settingsError } = await adminClient.from("match_settings").insert({
        match_id: match.id,
        settings: matchSettings.settings,
        rules: {
          ...matchSettings.rules,
          gameId: gameId,
        },
        game_id: gameId,
        ruleset_id: matchSettings.ruleset_id,
      })

      if (settingsError) {
        console.error("Error creating match settings:", settingsError)
      }
    } catch (settingsErr) {
      console.error("Match settings error:", settingsErr)
    }

    // Add user's team as participant
    try {
      const { error: participantError } = await adminClient.from("match_participants").insert({
        match_id: match.id,
        team_id: teamId,
        status: "confirmed", // The creator's team is automatically confirmed
      })

      if (participantError) {
        console.error("Error adding team as participant:", participantError)
      }
    } catch (participantErr) {
      console.error("Match participants error:", participantErr)
    }

    // Create wager if selected
    if (isWager && wagerAmount > 0) {
      try {
        const { error: wagerError } = await adminClient.from("match_wagers").insert({
          match_id: match.id,
          amount: wagerAmount,
          platform_fee: wagerAmount * 0.1, // 10% platform fee
          status: "pending",
        })

        if (wagerError) {
          console.error("Error creating wager:", wagerError)
        }
      } catch (wagerErr) {
        console.error("Match wagers error:", wagerErr)
      }
    }

    return NextResponse.json({ success: true, match })
  } catch (err) {
    console.error("Exception in match creation:", err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
