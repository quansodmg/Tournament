import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import MatchDetailsView from "@/components/matches/match-details-view"

interface MatchPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const supabase = createServerClient()

  try {
    const { data: match } = await supabase
      .from("matches")
      .select(`
        *,
        game:game_id(name)
      `)
      .eq("id", params.id)
      .single()

    if (!match) {
      return {
        title: "Match Not Found | Esports Platform",
      }
    }

    return {
      title: `${match.game?.name || "Match"} | Esports Platform`,
      description: `View details and results for this ${match.game?.name || ""} match.`,
    }
  } catch (error) {
    return {
      title: "Match Details | Esports Platform",
    }
  }
}

export default async function MatchPage({ params }: MatchPageProps) {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect(`/auth?redirect=/matches/${params.id}`)
  }

  // Get match details
  const { data: match, error } = await supabase
    .from("matches")
    .select(`
      *,
      game:game_id(*),
      participants:match_participants(
        *,
        team:team_id(*),
        profile:profile_id(*)
      ),
      match_results(*),
      match_settings(*)
    `)
    .eq("id", params.id)
    .single()

  if (error || !match) {
    notFound()
  }

  // Check if user is a participant in this match
  const userTeams = await supabase.from("team_members").select("team_id").eq("profile_id", session.user.id)

  const userTeamIds = userTeams.data?.map((t) => t.team_id) || []

  const isParticipant = match.participants.some((p) => userTeamIds.includes(p.team_id))

  // If match is private and user is not a participant, redirect
  if (match.is_private && !isParticipant && match.scheduled_by !== session.user.id) {
    redirect("/matches?error=private")
  }

  // Get user's profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Get match chat messages
  const { data: chatMessages } = await supabase
    .from("match_chats")
    .select(`
      *,
      profile:profile_id(*)
    `)
    .eq("match_id", params.id)
    .order("created_at", { ascending: true })

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <MatchDetailsView
        match={match}
        userId={session.user.id}
        userProfile={profile}
        userTeamIds={userTeamIds}
        isParticipant={isParticipant}
        chatMessages={chatMessages || []}
      />
    </div>
  )
}
