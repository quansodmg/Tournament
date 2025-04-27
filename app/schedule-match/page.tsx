import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import EnhancedScheduleMatchForm from "@/components/matches/enhanced-schedule-match-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function ScheduleMatchPage() {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/auth?redirect=/schedule-match")
    }

    // Get user's teams - using a more direct query approach
    const { data: teamMembers, error: teamsError } = await supabase
      .from("team_members")
      .select("team_id, role")
      .eq("profile_id", session.user.id)

    if (teamsError) {
      console.error("Error fetching team members:", teamsError)
      throw new Error(`Failed to load team members: ${teamsError.message}`)
    }

    // Get team details separately
    const teamIds = teamMembers?.map((tm) => tm.team_id) || []

    let teams = []
    if (teamIds.length > 0) {
      const { data: teamsData, error: teamsDataError } = await supabase
        .from("teams")
        .select("id, name, created_by")
        .in("id", teamIds)

      if (teamsDataError) {
        console.error("Error fetching teams data:", teamsDataError)
        throw new Error(`Failed to load teams data: ${teamsDataError.message}`)
      }

      teams = teamsData || []
    }

    // Format teams for the form by combining team members with team data
    const formattedTeams =
      teamMembers?.map((member) => {
        const teamData = teams.find((t) => t.id === member.team_id) || { name: "Unknown Team", created_by: null }
        return {
          id: member.team_id,
          name: teamData.name,
          role: member.role,
          created_by: teamData.created_by,
        }
      }) || []

    return (
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/matches">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Matches
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-6">Schedule a Match</h1>
        <EnhancedScheduleMatchForm userId={session.user.id} userTeams={formattedTeams} />
      </div>
    )
  } catch (error) {
    console.error("Schedule match page error:", error)
    throw error // Let the error boundary handle it
  }
}
