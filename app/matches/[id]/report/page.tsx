import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import MatchResultForm from "@/components/matches/match-result-form"
import type { Metadata } from "next"

interface ReportMatchPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ReportMatchPageProps): Promise<Metadata> {
  return {
    title: "Report Match Results | Esports Platform",
    description: "Submit the results for your completed match",
  }
}

export default async function ReportMatchPage({ params }: ReportMatchPageProps) {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect(`/auth?redirect=/matches/${params.id}/report`)
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
      match_results(*)
    `)
    .eq("id", params.id)
    .single()

  if (error || !match) {
    notFound()
  }

  // Check if match is in progress
  if (match.status !== "in_progress") {
    redirect(`/matches/${params.id}?error=not-in-progress`)
  }

  // Check if results are already reported
  if (match.match_results && match.match_results.length > 0) {
    redirect(`/matches/${params.id}?error=already-reported`)
  }

  // Check if user is a participant
  const userTeams = await supabase.from("team_members").select("team_id").eq("profile_id", session.user.id)
  const userTeamIds = userTeams.data?.map((t) => t.team_id) || []
  const isParticipant = match.participants.some((p: any) => userTeamIds.includes(p.team_id))

  if (!isParticipant && match.scheduled_by !== session.user.id) {
    redirect(`/matches/${params.id}?error=not-participant`)
  }

  // Get user's team in this match
  const userTeam = match.participants.find((p: any) => userTeamIds.includes(p.team_id))

  if (!userTeam) {
    redirect(`/matches/${params.id}?error=no-team`)
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <MatchResultForm match={match} userId={session.user.id} userTeamId={userTeam.team_id} />
    </div>
  )
}
