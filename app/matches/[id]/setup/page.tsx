import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import MatchSetupClient from "@/components/matches/match-setup-client"

interface MatchSetupPageProps {
  params: {
    id: string
  }
}

export default async function MatchSetupPage({ params }: MatchSetupPageProps) {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth?redirect=/matches/" + params.id + "/setup")
  }

  // Get match details to check if user is a participant
  const { data: match, error } = await supabase
    .from("matches")
    .select(`
      *,
      participants:match_participants(
        team_id,
        team:team_id(
          members:team_members(profile_id)
        )
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !match) {
    redirect("/matches")
  }

  // Check if user is a participant in this match
  const isParticipant = match.participants.some((p: any) =>
    p.team?.members?.some((m: any) => m.profile_id === session.user.id),
  )

  if (!isParticipant) {
    redirect("/matches")
  }

  // Check if match is in the correct status
  if (match.status !== "pending" && match.status !== "setup") {
    redirect(`/matches/${params.id}`)
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Match Setup</h1>
      <MatchSetupClient matchId={params.id} userId={session.user.id} />
    </div>
  )
}
