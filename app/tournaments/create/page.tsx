export const dynamic = "force-dynamic"
export const revalidate = 0

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CreateTournamentForm from "@/components/tournaments/create-tournament-form"

export default async function CreateTournamentPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Check if the user has a profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", session.user.id)
    .single()

  // If no profile exists, create one
  if (!profile) {
    const userMetadata = session.user.user_metadata || {}

    await supabase.from("profiles").insert({
      id: session.user.id,
      username: userMetadata.username || `user_${session.user.id.substring(0, 8)}`,
      full_name: userMetadata.full_name || null,
      updated_at: new Date().toISOString(),
    })
  }

  // Get games for the dropdown
  const { data: games } = await supabase.from("games").select("id, name").order("name")

  return (
    <div className="container max-w-screen-xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Create a Tournament</h1>
      <div className="max-w-3xl">
        <CreateTournamentForm userId={session.user.id} games={games || []} />
      </div>
    </div>
  )
}
