import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import MatchDetailsView from "@/components/matches/match-details-view"

interface MatchPageProps {
  params: {
    id: string
  }
}

// List of reserved paths that should not be treated as match IDs
const RESERVED_PATHS = ["schedule", "create"]

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  // Check if this is a reserved path
  if (RESERVED_PATHS.includes(params.id)) {
    return {
      title: "Match Not Found | Esports Platform",
    }
  }

  const supabase = createServerClient()

  try {
    // Validate that the ID is a valid UUID
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!UUID_REGEX.test(params.id)) {
      return {
        title: "Match Not Found | Esports Platform",
      }
    }

    // Fetch match and game separately
    const { data: match } = await supabase.from("matches").select("*, game_id").eq("id", params.id).single()

    if (!match) {
      return {
        title: "Match Not Found | Esports Platform",
      }
    }

    // If we have a game_id, fetch the game separately
    let gameName = "Match"
    if (match.game_id) {
      const { data: game } = await supabase.from("games").select("name").eq("id", match.game_id).single()

      if (game) {
        gameName = game.name
      }
    }

    return {
      title: `${gameName} | Esports Platform`,
      description: `View details and results for this ${gameName} match.`,
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Match Details | Esports Platform",
    }
  }
}

export default async function MatchPage({ params }: MatchPageProps) {
  // Check if this is a reserved path and redirect
  if (RESERVED_PATHS.includes(params.id)) {
    if (params.id === "schedule") {
      redirect("/matches/create")
    }
    redirect(`/matches/${params.id}`)
  }

  const supabase = createServerClient()

  try {
    // Validate that the ID is a valid UUID
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!UUID_REGEX.test(params.id)) {
      console.error("Invalid match ID format:", params.id)
      notFound()
    }

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect(`/auth?redirect=/matches/${params.id}`)
    }

    // Get match details without using relationships
    const { data: match, error: matchError } = await supabase.from("matches").select("*").eq("id", params.id).single()

    if (matchError || !match) {
      console.error("Match not found:", matchError)
      notFound()
    }

    // Fetch game if game_id exists
    let game = null
    if (match.game_id) {
      const { data: gameData } = await supabase.from("games").select("*").eq("id", match.game_id).single()

      game = gameData
    }

    // Fetch participants
    const { data: participants } = await supabase.from("match_participants").select("*").eq("match_id", params.id)

    // Fetch teams for participants
    const teamIds = participants?.filter((p) => p.team_id).map((p) => p.team_id) || []

    let teams = []
    if (teamIds.length > 0) {
      const { data: teamsData } = await supabase.from("teams").select("*").in("id", teamIds)

      teams = teamsData || []
    }

    // Fetch profiles for participants
    const profileIds = participants?.filter((p) => p.profile_id).map((p) => p.profile_id) || []

    let profiles = []
    if (profileIds.length > 0) {
      const { data: profilesData } = await supabase.from("profiles").select("*").in("id", profileIds)

      profiles = profilesData || []
    }

    // Fetch match results
    const { data: matchResults } = await supabase.from("match_results").select("*").eq("match_id", params.id)

    // Fetch match settings
    const { data: matchSettings } = await supabase.from("match_settings").select("*").eq("match_id", params.id).single()

    // Combine data
    const enrichedParticipants =
      participants?.map((participant) => {
        const team = teams.find((t) => t.id === participant.team_id)
        const profile = profiles.find((p) => p.id === participant.profile_id)

        return {
          ...participant,
          team,
          profile,
        }
      }) || []

    const enrichedMatch = {
      ...match,
      game,
      participants: enrichedParticipants,
      match_results: matchResults || [],
      match_settings: matchSettings || null,
    }

    // Check if user is a participant in this match
    const { data: userTeams } = await supabase.from("team_members").select("team_id").eq("profile_id", session.user.id)

    const userTeamIds = userTeams?.map((t) => t.team_id) || []

    const isParticipant = enrichedParticipants.some((p) => userTeamIds.includes(p.team_id))

    // If match is private and user is not a participant, redirect
    if (match.is_private && !isParticipant && match.scheduled_by !== session.user.id) {
      redirect("/matches?error=private")
    }

    // Get user's profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    // Get match chat messages
    const { data: chatMessagesRaw } = await supabase
      .from("match_chats")
      .select("*")
      .eq("match_id", params.id)
      .order("created_at", { ascending: true })

    // Fetch profiles for chat messages
    const chatProfileIds = chatMessagesRaw?.filter((msg) => msg.profile_id).map((msg) => msg.profile_id) || []

    let chatProfiles = []
    if (chatProfileIds.length > 0) {
      const { data: chatProfilesData } = await supabase.from("profiles").select("*").in("id", chatProfileIds)

      chatProfiles = chatProfilesData || []
    }

    // Combine chat messages with profiles
    const chatMessages =
      chatMessagesRaw?.map((msg) => {
        const profile = chatProfiles.find((p) => p.id === msg.profile_id)
        return {
          ...msg,
          profile,
        }
      }) || []

    return (
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <MatchDetailsView
          match={enrichedMatch}
          userId={session.user.id}
          userProfile={profile}
          userTeamIds={userTeamIds}
          isParticipant={isParticipant}
          chatMessages={chatMessages}
        />
      </div>
    )
  } catch (error) {
    console.error("Error loading match:", error)
    throw error // Let the error boundary handle it
  }
}
