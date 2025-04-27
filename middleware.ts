import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname

  // Special case handling for /matches/schedule to prevent it from being caught by the dynamic route
  if (pathname === "/matches/schedule") {
    return NextResponse.redirect(new URL("/matches/create", request.url))
  }

  // Handle auth with Supabase
  try {
    const supabase = createMiddlewareClient({ req: request, res: response })

    // Handle auth redirects
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protected routes that require authentication
    const protectedRoutes = ["/profile", "/settings", "/matches/create", "/tournaments/create", "/teams/create"]

    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    if (isProtectedRoute && !session) {
      const redirectUrl = new URL("/auth", request.url)
      redirectUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Admin routes protection
    if (pathname.startsWith("/admin")) {
      if (!session) {
        const redirectUrl = new URL("/auth", request.url)
        redirectUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Check if user is admin
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

      if (!profile || profile.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }
    }
  } catch (error) {
    console.error("Middleware error:", error)
    // Continue with the request even if there's an error with auth
  }

  return response
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    "/profile/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/matches/create",
    "/matches/schedule",
    "/tournaments/create",
    "/teams/create",
  ],
}
