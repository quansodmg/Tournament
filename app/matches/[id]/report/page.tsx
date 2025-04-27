import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import MatchResultForm from "@/components/matches/match-result-form"

interface MatchReportPageProps {
  params: {
    id: string
  }
}

export default async function MatchReportPage({ params }: MatchReportPageProps) {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth?redirect=/matches/" + params.id + "/report")
  }

  // Get match details to check if user is a participant and can report
  const { data: match, error } = await supabase
    .from("matches")
    .select(`
      *,
      participants:match_participants(
        team_id,
        team:team_id(
          *,
          members:team_members(
            profile_id,
            role
          )
        )
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !match) {
    redirect("/matches")
  }

  // Find user's team
  const userTeamParticipant = match.participants.find((p: any) =>
    p.team?.members?.some((m: any) => m.profile_id === session.user.id),
  )

  if (!userTeamParticipant) {
    redirect("/matches")
  }

  // Find opponent team
  const opponentTeamParticipant = match.participants.find((p: any) => p.team_id !== userTeamParticipant.team_id)

  if (!opponentTeamParticipant) {
    redirect("/matches")
  }

  // Check if user is a captain or team owner
  const isTeamCaptain =
    userTeamParticipant.team.created_by === session.user.id ||
    userTeamParticipant.team.members.some((m: any) => m.profile_id === session.user.id && m.role === "captain")

  if (!isTeamCaptain) {
    redirect(`/matches/${params.id}?error=not_captain`)
  }

  // Check if match is in the correct status
  if (match.status !== "in_progress") {
    redirect(`/matches/${params.id}?error=invalid_status`)
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Report Match Result</h1>
      <MatchResultForm
        matchId={params.id}
        userTeamId={userTeamParticipant.team_id}
        opponentTeamId={opponentTeamParticipant.team_id}
        userId={session.user.id}
      />
    </div>
  )
}
