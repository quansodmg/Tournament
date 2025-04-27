import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api/public")
  ) {
    return res
  }

  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    // Use try-catch to handle potential errors
    let session = null
    try {
      const { data } = await supabase.auth.getSession()
      session = data.session
    } catch (sessionError) {
      console.error("Error getting session in middleware:", sessionError)
      // Continue without session
    }

    // Protected routes that require authentication
    const protectedRoutes = [
      "/profile",
      "/settings",
      "/teams/create",
      "/tournaments/create",
      "/matches/schedule",
      "/admin",
      "/stats",
      "/friends",
      "/invitations",
    ]

    // Routes that require team ownership or membership
    const teamEditRoutes = ["/teams/[id]/edit"]

    // Admin-only routes
    const adminRoutes = ["/admin"]

    // Debug routes - only accessible in development
    const debugRoutes = ["/auth/debug"]
    const isDevelopment = process.env.NODE_ENV === "development"

    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
    const isTeamEditRoute = pathname.match(/\/teams\/[^/]+\/edit/)
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
    const isDebugRoute = debugRoutes.some((route) => pathname.startsWith(route))

    // For debug routes, only allow in development
    if (isDebugRoute && !isDevelopment) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // For protected routes, redirect to auth if no session
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL("/auth", req.url)
      redirectUrl.searchParams.set("redirectedFrom", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // For team edit routes, check if user is a team member or owner
    if (isTeamEditRoute && session) {
      try {
        const teamId = pathname.split("/")[2]

        // Check if user is team owner or member
        const { data: teamMembership, error: membershipError } = await supabase
          .from("team_members")
          .select("role")
          .eq("team_id", teamId)
          .eq("profile_id", session.user.id)
          .single()

        if (membershipError || !teamMembership) {
          // User is not a team member, redirect to team page
          return NextResponse.redirect(new URL(`/teams/${teamId}`, req.url))
        }

        // Allow access if user is a team member
      } catch (error) {
        console.error("Error checking team membership:", error)
        // If there's an error, redirect to teams page
        return NextResponse.redirect(new URL("/teams", req.url))
      }
    }

    // For admin routes, check if user is an admin
    if (isAdminRoute && session) {
      // Special case for quanstewart@hotmail.com
      if (session.user.email === "quanstewart@hotmail.com") {
        return res
      }

      // For other users, check admin status
      try {
        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

        if (!profile?.is_admin) {
          return NextResponse.redirect(new URL("/", req.url))
        }
      } catch (error) {
        // If there's an error, redirect to home
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    // Update user's online status if they're logged in
    if (session?.user?.id) {
      try {
        await supabase
          .from("profiles")
          .update({
            online_status: "online",
            last_seen_at: new Date().toISOString(),
          })
          .eq("id", session.user.id)
      } catch (error) {
        // Ignore errors updating online status
        console.error("Error updating online status:", error)
      }
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // In case of error, allow the request to continue
    return res
  }
}

// Specify which routes this middleware should run for
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes that don't need auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/public).*)",
  ],
}
