import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import EnhancedScheduleMatchForm from "@/components/matches/enhanced-schedule-match-form"

export default async function ScheduleMatchPage() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth?redirect=/matches/schedule")
  }

  // Get user's teams
  const { data: userTeams } = await supabase
    .from("team_members")
    .select(`
      team_id,
      role,
      team:team_id(
        id,
        name,
        created_by
      )
    `)
    .eq("profile_id", session.user.id)

  // Format teams for the form
  const teams =
    userTeams?.map((item) => ({
      id: item.team.id,
      name: item.team.name,
      role: item.role,
      created_by: item.team.created_by,
    })) || []

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Schedule a Match</h1>
      <EnhancedScheduleMatchForm userId={session.user.id} userTeams={teams} />
    </div>
  )
}
