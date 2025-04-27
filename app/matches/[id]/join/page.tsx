import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import JoinMatchForm from "@/components/matches/join-match-form"
import type { Metadata } from "next"

interface JoinMatchPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: JoinMatchPageProps): Promise<Metadata> {
  return {
    title: "Join Match | Esports Platform",
    description: "Join an existing match with your team",
  }
}

export default async function JoinMatchPage({ params }: JoinMatchPageProps) {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect(`/auth?redirect=/matches/${params.id}/join`)
  }

  // Get match details
  const { data: match, error } = await supabase
    .from("matches")
    .select(`
      *,
      game:game_id(*),
      participants:match_participants(
        *,
        team:team_id(*)
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !match) {
    notFound()
  }

  // Check if match is already full
  if (match.participants.length >= 2) {
    redirect(`/matches/${params.id}?error=full`)
  }

  // Check if match is still open for joining
  if (match.status !== "scheduled") {
    redirect(`/matches/${params.id}?error=closed`)
  }

  // Get user's teams where they are captain or owner
  const { data: userTeams } = await supabase
    .from("team_members")
    .select(`
      team_id,
      role,
      team:team_id(
        id,
        name,
        logo_url
      )
    `)
    .eq("profile_id", session.user.id)
    .in("role", ["owner", "captain"])

  // Check if user has any teams
  if (!userTeams || userTeams.length === 0) {
    redirect(`/teams/create?redirect=/matches/${params.id}/join`)
  }

  // Filter out teams that are already in the match
  const participantTeamIds = match.participants.map((p: any) => p.team_id)
  const availableTeams = userTeams.filter((t) => !participantTeamIds.includes(t.team_id))

  // If user has no available teams, redirect
  if (availableTeams.length === 0) {
    redirect(`/matches/${params.id}?error=already-joined`)
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <JoinMatchForm match={match} userId={session.user.id} availableTeams={availableTeams.map((t) => t.team)} />
    </div>
  )
}
