import { createServerClient } from "@/lib/supabase/server"
import { createServerNotification, createTeamNotification } from "./notifications"

// Match-related notifications
export async function generateMatchInvitationNotification(matchId: string, teamId: string, invitedBy: string) {
  try {
    const supabase = createServerClient()

    // Get match details
    const { data: match, error: matchError } = await supabase.from("matches").select("*").eq("id", matchId).single()

    if (matchError) throw matchError

    // Get team details
    const { data: team, error: teamError } = await supabase.from("teams").select("*").eq("id", teamId).single()

    if (teamError) throw teamError

    // Get inviter details
    const { data: inviter, error: inviterError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", invitedBy)
      .single()

    if (inviterError) throw inviterError

    // Create notification for team members
    await createTeamNotification({
      teamId,
      title: "New Match Invitation",
      message: `${inviter.username} has invited your team ${team.name} to a match`,
      type: "match",
      referenceId: matchId,
      referenceType: "match",
      actionUrl: `/teams/${teamId}/invitations`,
      excludeProfileId: invitedBy,
    })

    return true
  } catch (error) {
    console.error("Error generating match invitation notification:", error)
    return false
  }
}

export async function generateMatchStartNotification(matchId: string) {
  try {
    const supabase = createServerClient()

    // Get match details
    const { data: match, error: matchError } = await supabase.from("matches").select("*").eq("id", matchId).single()

    if (matchError) throw matchError

    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from("match_participants")
      .select(`
        *,
        team:team_id(*),
        profile:profile_id(*)
      `)
      .eq("match_id", matchId)

    if (participantsError) throw participantsError

    // For each participant, notify team members
    for (const participant of participants) {
      if (participant.team_id) {
        await createTeamNotification({
          teamId: participant.team_id,
          title: "Match Starting Soon",
          message: `Your match is starting soon`,
          type: "match",
          referenceId: matchId,
          referenceType: "match",
          actionUrl: `/matches/${matchId}`,
        })
      }
    }

    return true
  } catch (error) {
    console.error("Error generating match start notification:", error)
    return false
  }
}

export async function generateMatchResultNotification(matchId: string, winnerTeamId: string) {
  try {
    const supabase = createServerClient()

    // Get match details
    const { data: match, error: matchError } = await supabase.from("matches").select("*").eq("id", matchId).single()

    if (matchError) throw matchError

    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from("match_participants")
      .select(`
        *,
        team:team_id(*),
        profile:profile_id(*)
      `)
      .eq("match_id", matchId)

    if (participantsError) throw participantsError

    // Get winner team details
    const { data: winnerTeam, error: winnerTeamError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", winnerTeamId)
      .single()

    if (winnerTeamError) throw winnerTeamError

    // For each participant, notify team members
    for (const participant of participants) {
      if (participant.team_id) {
        const isWinner = participant.team_id === winnerTeamId

        await createTeamNotification({
          teamId: participant.team_id,
          title: isWinner ? "Match Victory!" : "Match Result",
          message: isWinner ? `Your team won the match!` : `Your team lost the match against ${winnerTeam.name}`,
          type: "match",
          referenceId: matchId,
          referenceType: "match",
          actionUrl: `/matches/${matchId}`,
        })
      }
    }

    return true
  } catch (error) {
    console.error("Error generating match result notification:", error)
    return false
  }
}

// Tournament-related notifications
export async function generateTournamentRegistrationNotification(
  tournamentId: string,
  profileId: string,
  teamId?: string,
) {
  try {
    const supabase = createServerClient()

    // Get tournament details
    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", tournamentId)
      .single()

    if (tournamentError) throw tournamentError

    await createServerNotification({
      profileId,
      title: "Tournament Registration Confirmed",
      message: `Your registration for ${tournament.name} has been confirmed`,
      type: "tournament",
      referenceId: tournamentId,
      referenceType: "tournament",
      actionUrl: `/tournaments/${tournament.slug}`,
    })

    // If team registration, notify other team members
    if (teamId) {
      await createTeamNotification({
        teamId,
        title: "Team Registered for Tournament",
        message: `Your team has been registered for ${tournament.name}`,
        type: "tournament",
        referenceId: tournamentId,
        referenceType: "tournament",
        actionUrl: `/tournaments/${tournament.slug}`,
        excludeProfileId: profileId,
      })
    }

    return true
  } catch (error) {
    console.error("Error generating tournament registration notification:", error)
    return false
  }
}

export async function generateTournamentStartNotification(tournamentId: string) {
  try {
    const supabase = createServerClient()

    // Get tournament details
    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", tournamentId)
      .single()

    if (tournamentError) throw tournamentError

    // Get all registrations
    const { data: registrations, error: registrationsError } = await supabase
      .from("tournament_registrations")
      .select(`
        *,
        team:team_id(*),
        profile:profile_id(*)
      `)
      .eq("tournament_id", tournamentId)

    if (registrationsError) throw registrationsError

    // For individual registrations
    const individualRegistrations = registrations.filter((reg: any) => reg.profile_id && !reg.team_id)
    for (const reg of individualRegistrations) {
      await createServerNotification({
        profileId: reg.profile_id,
        title: "Tournament Starting Soon",
        message: `${tournament.name} is starting soon`,
        type: "tournament",
        referenceId: tournamentId,
        referenceType: "tournament",
        actionUrl: `/tournaments/${tournament.slug}`,
      })
    }

    // For team registrations
    const teamRegistrations = registrations.filter((reg: any) => reg.team_id)
    for (const reg of teamRegistrations) {
      await createTeamNotification({
        teamId: reg.team_id,
        title: "Tournament Starting Soon",
        message: `${tournament.name} is starting soon`,
        type: "tournament",
        referenceId: tournamentId,
        referenceType: "tournament",
        actionUrl: `/tournaments/${tournament.slug}`,
      })
    }

    return true
  } catch (error) {
    console.error("Error generating tournament start notification:", error)
    return false
  }
}

// Team-related notifications
export async function generateTeamInvitationNotification(teamId: string, profileId: string, invitedBy: string) {
  try {
    const supabase = createServerClient()

    // Get team details
    const { data: team, error: teamError } = await supabase.from("teams").select("*").eq("id", teamId).single()

    if (teamError) throw teamError

    // Get inviter details
    const { data: inviter, error: inviterError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", invitedBy)
      .single()

    if (inviterError) throw inviterError

    await createServerNotification({
      profileId,
      title: "Team Invitation",
      message: `${inviter.username} has invited you to join ${team.name}`,
      type: "team",
      referenceId: teamId,
      referenceType: "team",
      actionUrl: "/invitations",
    })

    return true
  } catch (error) {
    console.error("Error generating team invitation notification:", error)
    return false
  }
}

export async function generateTeamJoinNotification(teamId: string, profileId: string) {
  try {
    const supabase = createServerClient()

    // Get team details
    const { data: team, error: teamError } = await supabase.from("teams").select("*").eq("id", teamId).single()

    if (teamError) throw teamError

    // Get profile details
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single()

    if (profileError) throw profileError

    // Notify team owner
    await createServerNotification({
      profileId: team.created_by,
      title: "New Team Member",
      message: `${profile.username} has joined your team ${team.name}`,
      type: "team",
      referenceId: teamId,
      referenceType: "team",
      actionUrl: `/teams/${teamId}`,
    })

    // Notify other team members
    await createTeamNotification({
      teamId,
      title: "New Team Member",
      message: `${profile.username} has joined the team`,
      type: "team",
      referenceId: teamId,
      referenceType: "team",
      actionUrl: `/teams/${teamId}`,
      excludeProfileId: profileId,
    })

    return true
  } catch (error) {
    console.error("Error generating team join notification:", error)
    return false
  }
}
