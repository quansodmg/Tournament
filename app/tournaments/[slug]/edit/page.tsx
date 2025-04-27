export const dynamic = "force-dynamic"
export const revalidate = 0

import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import EditTournamentForm from "@/components/tournaments/edit-tournament-form"

export default async function EditTournamentPage({ params }: { params: { slug: string } }) {
  try {
    // Properly await the Supabase client creation
    const supabase = await createClient()

    // Check authentication with error handling
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // Handle session error
    if (sessionError) {
      console.error("Session error:", sessionError)
      redirect("/auth")
    }

    // If no session, redirect to auth
    if (!session) {
      redirect("/auth")
    }

    // Get tournament details with error handling
    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .select("*")
      .eq("slug", params.slug)
      .single()

    if (tournamentError) {
      console.error("Tournament fetch error:", tournamentError)
      notFound()
    }

    if (!tournament) {
      notFound()
    }

    // Check if user is the tournament creator
    if (tournament.created_by !== session.user.id) {
      redirect(`/tournaments/${params.slug}`)
    }

    // Get games for the dropdown with error handling
    const { data: games, error: gamesError } = await supabase.from("games").select("id, name").order("name")

    if (gamesError) {
      console.error("Games fetch error:", gamesError)
      // Continue with empty games array
    }

    return (
      <div className="container max-w-screen-xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Edit Tournament</h1>
        <div className="max-w-3xl">
          <EditTournamentForm tournament={tournament} games={games || []} />
        </div>
      </div>
    )
  } catch (error) {
    // Log the error and re-throw it to be caught by the error boundary
    console.error("Error in EditTournamentPage:", error)
    throw error
  }
}
