import type { Metadata } from "next"
import { redirect } from "next/navigation"
import SettingsClient from "./client"
import { createServerSupabase } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "User Settings | EsportsHub",
  description: "Customize your profile and account settings",
}

// Add export const dynamic = 'force-dynamic' to prevent prerendering
export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  try {
    // Server-side auth check
    const supabase = await createServerSupabase()

    // Check if supabase is properly initialized
    if (!supabase || !supabase.auth) {
      console.error("Supabase client not properly initialized")
      return <SettingsClient userId={null} />
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      // Redirect to auth page if not logged in
      redirect("/auth?redirectedFrom=/settings")
    }

    return <SettingsClient userId={session.user.id} />
  } catch (error) {
    console.error("Error in settings page:", error)
    // Fallback to client component without userId
    return <SettingsClient userId={null} />
  }
}
