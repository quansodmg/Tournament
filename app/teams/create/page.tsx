// Add this at the top of the file to prevent static rendering
export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CreateTeamForm from "@/components/teams/create-team-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function CreateTeamPage() {
  let authError = null
  let userId = null

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
      authError = "Authentication error. Please try signing in again."
    } else if (!session) {
      // If no session, redirect to auth
      redirect("/auth?redirectTo=/teams/create")
    } else {
      userId = session.user.id
    }

    return (
      <div className="container max-w-screen-xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Create a New Team</h1>

        {authError ? (
          <div className="max-w-2xl">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
            <Button asChild>
              <Link href="/auth">Sign In Again</Link>
            </Button>
          </div>
        ) : (
          <div className="max-w-2xl">
            <CreateTeamForm userId={userId!} />
          </div>
        )}
      </div>
    )
  } catch (error) {
    // Log the error and show an error message
    console.error("Unexpected error in CreateTeamPage:", error)

    return (
      <div className="container max-w-screen-xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Create a New Team</h1>
        <div className="max-w-2xl">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load team creation page. Please try again later.</AlertDescription>
          </Alert>
          <div className="flex space-x-4">
            <Button asChild>
              <Link href="/teams">Back to Teams</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
