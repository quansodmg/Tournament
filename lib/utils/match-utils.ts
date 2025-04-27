import { createServerClient } from "@/lib/supabase/server"
import { addMinutes } from "date-fns"

export async function createMatchWithInvitation(
  schedulerId: string,
  teamId: string,
  opponentTeamId: string,
  matchDetails: {
    startTime: string
    gameId?: string
    gameMode?: string
    matchFormat?: string
    matchType?: string
    location?: string
    isPrivate?: boolean
    streamUrl?: string
    matchNotes?: string
    teamSize?: number
  },
) {
  try {
    const supabase = createServerClient()

    // Create the match
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .insert({
        scheduled_by: schedulerId,
        start_time: matchDetails.startTime,
        status: "scheduled",
        location: matchDetails.location || null,
        match_type: matchDetails.matchType || "friendly",
        is_private: matchDetails.isPrivate || false,
        stream_url: matchDetails.streamUrl || null,
        match_notes: matchDetails.matchNotes || null,
        acceptance_status: {}, // Initialize empty acceptance status
        game_id: matchDetails.gameId || null,
        game_mode: matchDetails.gameMode || null,
        match_format: matchDetails.matchFormat || "bo1",
        team_size: matchDetails.teamSize || null,
      })
      .select()
      .single()

    if (matchError) throw matchError

    // Add the scheduler's team as a participant
    const { error: participantError } = await supabase.from("match_participants").insert({
      match_id: match.id,
      team_id: teamId,
    })

    if (participantError) throw participantError

    // Calculate acceptance deadline (15 minutes from now)
    const acceptanceDeadline = addMinutes(new Date(), 15).toISOString()

    // Create invitation for opponent team
    const { error: inviteError } = await supabase.from("match_invitations").insert({
      match_id: match.id,
      team_id: opponentTeamId,
      invited_by: schedulerId,
      acceptance_deadline: acceptanceDeadline,
    })

    if (inviteError) throw inviteError

    // Add system message to match chat
    await supabase.from("match_chats").insert({
      match_id: match.id,
      profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
      message: `Match created. Waiting for opponent team to accept within 15 minutes.`,
      is_system: true,
    })

    return { success: true, matchId: match.id }
  } catch (error) {
    console.error("Error creating match with invitation:", error)
    return { success: false, error }
  }
}

export async function handleMatchForfeit(matchId: string, teamId: string) {
  try {
    const supabase = createServerClient()

    // Update match status
    const { data: match } = await supabase.from("matches").select("acceptance_status").eq("id", matchId).single()

    const acceptanceStatus = match?.acceptance_status || {}
    acceptanceStatus[teamId] = "forfeited"

    await supabase.from("matches").update({ acceptance_status: acceptanceStatus }).eq("id", matchId)

    // Add system message to chat
    await supabase.from("match_chats").insert({
      match_id: matchId,
      profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
      message: `Team has forfeited the match.`,
      is_system: true,
    })

    return { success: true }
  } catch (error) {
    console.error("Error handling match forfeit:", error)
    return { success: false, error }
  }
}

// Function to validate team size for Call of Duty matches
export async function validateTeamForCallOfDuty(teamId: string) {
  try {
    const supabase = createServerClient()

    // Get team members
    const { data: teamMembers, error } = await supabase.from("team_members").select("*").eq("team_id", teamId)

    if (error) throw error

    // Check if team has at least 4 members
    if (!teamMembers || teamMembers.length < 4) {
      return {
        valid: false,
        message: "Call of Duty matches require teams of at least 4 players",
      }
    }

    return { valid: true }
  } catch (error) {
    console.error("Error validating team for Call of Duty:", error)
    return {
      valid: false,
      message: "Failed to validate team",
    }
  }
}

// Function to get match statistics for a team
export async function getTeamMatchStats(teamId: string) {
  try {
    const supabase = createServerClient()

    // Get team matches
    const { data: teamMatches, error: teamMatchesError } = await supabase
      .from("match_participants")
      .select(`
        result,
        match:match_id(status, game_id)
      `)
      .eq("team_id", teamId)
      .eq("match.status", "completed")

    if (teamMatchesError) throw teamMatchesError

    const totalMatches = teamMatches?.length || 0
    const wonMatches = teamMatches?.filter((m) => m.result === "win")?.length || 0
    const winRate = totalMatches > 0 ? (wonMatches / totalMatches) * 100 : 0

    // Get disputes
    const { data: disputes, error: disputesError } = await supabase
      .from("disputes")
      .select("*")
      .eq("reported_by_id", teamId)

    if (disputesError) throw disputesError

    const disputeRate = totalMatches > 0 ? ((disputes?.length || 0) / totalMatches) * 100 : 0

    // Group matches by game
    const gameStats: Record<string, { played: number; won: number }> = {}

    teamMatches?.forEach((match) => {
      const gameId = match.match?.game_id
      if (gameId) {
        if (!gameStats[gameId]) {
          gameStats[gameId] = { played: 0, won: 0 }
        }
        gameStats[gameId].played++
        if (match.result === "win") {
          gameStats[gameId].won++
        }
      }
    })

    return {
      totalMatches,
      wonMatches,
      winRate,
      disputes: disputes?.length || 0,
      disputeRate,
      gameStats,
    }
  } catch (error) {
    console.error("Error getting team match stats:", error)
    return null
  }
}

// Function to check if a user is a team captain or manager
export async function isTeamCaptainOrManager(userId: string, teamId: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("profile_id", userId)
      .single()

    if (error) return false

    return data?.role === "captain" || data?.role === "manager"
  } catch (error) {
    console.error("Error checking team captain status:", error)
    return false
  }
}
