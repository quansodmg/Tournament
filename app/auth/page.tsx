import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import AuthForm from "@/components/auth/auth-form"
import AuthRedirect from "@/components/auth/auth-redirect"

export const dynamic = "force-dynamic"

export default async function AuthPage({
  searchParams,
}: {
  searchParams: { redirectedFrom?: string; error?: string }
}) {
  // Get the redirectedFrom parameter or default to "/"
  const redirectTo = searchParams.redirectedFrom || "/"
  const error = searchParams.error

  try {
    // Create a Supabase client for server components
    const supabase = createServerComponentClient({ cookies })

    // Check if user is already signed in
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If there's a session, use client-side redirect component
    if (session) {
      return <AuthRedirect redirectTo={redirectTo} />
    }

    // Otherwise, render the auth form
    return (
      <div className="container flex items-center justify-center min-h-[80vh] py-8">
        <div className="w-full max-w-md">
          <AuthForm redirectTo={redirectTo} serverError={error} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in auth page:", error)

    // If there's an error, still render the auth form
    return (
      <div className="container flex items-center justify-center min-h-[80vh] py-8">
        <div className="w-full max-w-md">
          <AuthForm redirectTo={redirectTo} serverError="An unexpected error occurred. Please try again." />
        </div>
      </div>
    )
  }
}
