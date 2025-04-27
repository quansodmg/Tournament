import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_description = requestUrl.searchParams.get("error_description")
  const provider = requestUrl.searchParams.get("provider")

  // Log the callback parameters for debugging
  console.log("Auth callback received:", {
    hasCode: !!code,
    error,
    error_description,
    provider,
    url: requestUrl.toString(),
  })

  // If there's an error, redirect to auth page with error message
  if (error || error_description) {
    const errorMsg = error_description || error || "Unknown error"
    console.error("Auth callback error:", errorMsg)
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=${encodeURIComponent(errorMsg)}`)
  }

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("Code exchange error:", exchangeError)
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=${encodeURIComponent(exchangeError.message)}`)
      }

      // For social logins, we may need to create a profile if it's a new user
      if (provider && data?.user) {
        try {
          // Check if profile exists
          const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", data.user.id).single()

          if (!existingProfile) {
            // Create new profile for social login user
            const username =
              data.user.user_metadata?.preferred_username ||
              data.user.user_metadata?.name ||
              data.user.email?.split("@")[0] ||
              `user_${Math.floor(Math.random() * 10000)}`

            await supabase.from("profiles").insert({
              id: data.user.id,
              username,
              email: data.user.email,
              avatar_url: data.user.user_metadata?.avatar_url,
              created_at: new Date().toISOString(),
            })

            console.log("Created new profile for social login user:", data.user.id)
          }
        } catch (profileError) {
          console.error("Error handling profile for social login:", profileError)
          // Continue anyway, as the user was authenticated
        }
      }

      // Redirect to the home page after successful authentication
      return NextResponse.redirect(requestUrl.origin)
    } catch (unexpectedError) {
      console.error("Unexpected error in auth callback:", unexpectedError)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth?error=${encodeURIComponent("An unexpected error occurred")}`,
      )
    }
  }

  // No code provided, redirect to auth page
  return NextResponse.redirect(`${requestUrl.origin}/auth?error=No authentication code provided`)
}
