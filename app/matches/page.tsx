import { createServerClient } from "@/lib/supabase/server"
import MatchesOverview from "@/components/matches/matches-overview"

export const metadata = {
  title: "Matches | Esports Platform",
  description: "View and join available matches on our esports platform.",
}

export default async function MatchesPage() {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Instead of redirecting, we'll handle both authenticated and unauthenticated states
    const userId = session?.user?.id

    // Get user's teams if authenticated
    let userTeamIds: string[] = []
    if (userId) {
      const { data: userTeams } = await supabase.from("team_members").select("team_id").eq("profile_id", userId)
      userTeamIds = userTeams?.map((t) => t.team_id) || []
    }

    return (
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Matches</h1>
        <MatchesOverview userId={userId} userTeamIds={userTeamIds} isAuthenticated={!!userId} />
      </div>
    )
  } catch (error) {
    // Special handling for redirect errors to prevent crashes
    if ((error as Error).message?.includes("NEXT_REDIRECT")) {
      console.log("Handling redirect gracefully")
      return <div>Redirecting...</div>
    }

    console.error("Error in matches page:", error)
    throw error // Let the error boundary handle it
  }
}
