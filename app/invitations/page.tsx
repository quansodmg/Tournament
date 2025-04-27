import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import UserInvitations from "@/components/teams/user-invitations"

// Make this page dynamic to avoid prerendering issues
export const dynamic = "force-dynamic"

export default async function InvitationsPage() {
  const supabase = createServerClient()

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If not logged in, redirect to auth page
  if (!session) {
    redirect("/auth?redirectedFrom=/invitations")
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Team Invitations</h1>
      <UserInvitations userId={session.user.id} />
    </div>
  )
}
