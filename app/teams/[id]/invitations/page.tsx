import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import TeamMatchInvitations from "@/components/matches/team-match-invitations"

export default async function TeamInvitationsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get team details
  const { data: team, error } = await supabase.from("teams").select("*").eq("id", params.id).single()

  if (error || !team) {
    notFound()
  }

  // Check if user is a member of the team
  const { data: membership } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", team.id)
    .eq("profile_id", session.user.id)
    .single()

  if (!membership) {
    redirect(`/teams/${params.id}?error=You must be a team member to view invitations`)
  }

  return (
    <div className="container max-w-screen-xl mx-auto py-16 px-4">
      <div className="mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href={`/teams/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-8">Match Invitations for {team.name}</h1>

      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Pending Match Invitations</CardTitle>
            <CardDescription>Matches that your team has been invited to join</CardDescription>
          </CardHeader>
          <CardContent>
            <TeamMatchInvitations teamId={team.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
