import { redirect } from "next/navigation"
import EnhancedScheduleMatchForm from "@/components/matches/enhanced-schedule-match-form"
import { createServerClient } from "@/lib/supabase/server"

export default async function CreateMatchPage() {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/auth?redirect=/matches/create")
    }

    // Get user's teams
    const { data: userTeams, error: teamsError } = await supabase
      .from("team_members")
      .select(`
        team_id,
        role,
        team:teams(
          id,
          name,
          created_by
        )
      `)
      .eq("profile_id", session.user.id)

    if (teamsError) {
      console.error("Error fetching teams:", teamsError)
      throw new Error(`Failed to load teams: ${teamsError.message}`)
    }

    // Format teams for the form
    const teams =
      userTeams?.map((item) => ({
        id: item.team?.id,
        name: item.team?.name,
        role: item.role,
        created_by: item.team?.created_by,
      })) || []

    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6">Schedule a Match</h1>
        <EnhancedScheduleMatchForm userId={session.user.id} userTeams={teams} />
      </div>
    )
  } catch (error) {
    console.error("Create match page error:", error)
    throw error // Let the error boundary handle it
  }
}
