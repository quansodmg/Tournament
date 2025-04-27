import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import MatchSetupForm from "@/components/matches/match-setup-form"
import type { Metadata } from "next"

interface SetupMatchPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: SetupMatchPageProps): Promise<Metadata> {
  return {
    title: "Setup Match | Esports Platform",
    description: "Configure your match settings before it begins",
  }
}

export default async function SetupMatchPage({ params }: SetupMatchPageProps) {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect(`/auth?redirect=/matches/${params.id}/setup`)
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
      ),
      match_settings(*)
    `)
    .eq("id", params.id)
    .single()

  if (error || !match) {
    notFound()
  }

  // Check if match has 2 participants
  if (match.participants.length !== 2) {
    redirect(`/matches/${params.id}?error=not-ready`)
  }

  // Check if match is still in scheduled status
  if (match.status !== "scheduled") {
    redirect(`/matches/${params.id}?error=already-started`)
  }

  // Check if user is a participant
  const userTeams = await supabase.from("team_members").select("team_id").eq("profile_id", session.user.id)
  const userTeamIds = userTeams.data?.map((t) => t.team_id) || []
  const isParticipant = match.participants.some((p: any) => userTeamIds.includes(p.team_id))

  if (!isParticipant && match.scheduled_by !== session.user.id) {
    redirect(`/matches/${params.id}?error=not-participant`)
  }

  // Get user's team in this match
  const userTeam = match.participants.find((p: any) => userTeamIds.includes(p.team_id))?.team

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <MatchSetupForm match={match} userId={session.user.id} userTeam={userTeam} />
    </div>
  )
}
