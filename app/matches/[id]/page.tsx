import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import MatchDetails from "@/components/matches/match-details"
import EloChangeDisplay from "@/components/matches/elo-change-display"

export default async function MatchPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  // Get match details
  const { data: match, error } = await supabase
    .from("matches")
    .select(`
      *,
      game:game_id(*),
      match_participants(
        id,
        team_id,
        profile_id,
        result,
        score,
        team:team_id(
          id,
          name,
          logo_url
        ),
        profile:profile_id(
          id,
          username,
          avatar_url
        )
      ),
      match_results(*)
    `)
    .eq("id", params.id)
    .single()

  if (error || !match) {
    notFound()
  }

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const userId = session?.user?.id || null

  // Get user's profile
  let userProfile = null
  if (userId) {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

    userProfile = profile
  }

  // Get user's teams
  let userTeams = []
  if (userId) {
    const { data: teams } = await supabase
      .from("team_members")
      .select("team_id, team:team_id(*)")
      .eq("profile_id", userId)

    userTeams = teams?.map((t) => t.team) || []
  }

  // Check if match is completed
  const isCompleted = match.status === "completed"

  return (
    <div className="container max-w-screen-xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <MatchDetails match={match} userId={userId} userProfile={userProfile} userTeams={userTeams} />
        </div>
        <div>
          {/* Show ELO changes if match is completed */}
          {isCompleted && <EloChangeDisplay matchId={params.id} />}

          {/* Other match sidebar components */}
          {/* ... */}
        </div>
      </div>
    </div>
  )
}
