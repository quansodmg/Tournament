import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import MatchAcceptanceDetails from "@/components/matches/match-acceptance-details"
import MainLayout from "@/components/layout/main-layout"
import { createServerClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Accept Match | Esports Platform",
  description: "Review and accept a match invitation",
}

export default async function AcceptMatchPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth?redirect=/matches/" + params.id + "/accept")
  }

  // Get match details
  const { data: match, error } = await supabase
    .from("matches")
    .select(`
      *,
      game:game_id(*),
      host:scheduled_by(id, username, avatar_url)
    `)
    .eq("id", params.id)
    .single()

  if (error || !match) {
    notFound()
  }

  // Check if user is part of a team that's invited to this match
  const { data: userTeams } = await supabase
    .from("team_members")
    .select("team_id, role")
    .eq("profile_id", session.user.id)

  const userTeamIds = userTeams?.map((item) => item.team_id) || []

  // Check if any of user's teams are invited to this match
  const { data: invitations } = await supabase
    .from("match_invitations")
    .select("*")
    .eq("match_id", params.id)
    .in("team_id", userTeamIds)
    .eq("status", "pending")

  // If no invitations found, user is not authorized to accept this match
  if (!invitations || invitations.length === 0) {
    redirect("/matches?error=You are not invited to this match")
  }

  // Check if user is a captain or manager of the invited team
  const isTeamCaptain = userTeams?.some(
    (team) =>
      invitations.some((inv) => inv.team_id === team.team_id) && (team.role === "captain" || team.role === "manager"),
  )

  if (!isTeamCaptain) {
    redirect("/matches?error=Only team captains or managers can accept match invitations")
  }

  // Get the invited team details
  const invitedTeamId = invitations[0].team_id
  const { data: invitedTeam } = await supabase.from("teams").select("*").eq("id", invitedTeamId).single()

  // Get the host team details (the team that created the match)
  const { data: hostTeamParticipant } = await supabase
    .from("match_participants")
    .select("team:team_id(*)")
    .eq("match_id", params.id)
    .single()

  const hostTeam = hostTeamParticipant?.team

  return (
    <MainLayout>
      <div className="container max-w-screen-xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/matches">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Matches
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Match Invitation</h1>
          <p className="text-muted-foreground">Review the match details and opponent information before accepting</p>
        </div>

        <MatchAcceptanceDetails
          matchId={params.id}
          userId={session.user.id}
          teamId={invitedTeamId}
          hostTeam={hostTeam}
        />
      </div>
    </MainLayout>
  )
}
