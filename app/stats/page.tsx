import type { Metadata } from "next"
import { redirect } from "next/navigation"
import StatsClient from "./client"
import { createServerSupabase } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Your Gaming Stats | EsportsHub",
  description: "View your gaming performance statistics",
}

// Add export const dynamic = 'force-dynamic' to prevent prerendering
export const dynamic = "force-dynamic"

export default async function StatsPage() {
  try {
    // Server-side auth check
    const supabase = await createServerSupabase()

    // Check if supabase is properly initialized
    if (!supabase || !supabase.auth) {
      console.error("Supabase client not properly initialized")
      return <StatsClient userId={null} />
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      // Redirect to auth page if not logged in
      redirect("/auth?redirectedFrom=/stats")
    }

    return <StatsClient userId={session.user.id} />
  } catch (error) {
    console.error("Error in stats page:", error)
    // Fallback to client component without userId
    return <StatsClient userId={null} />
  }
}
