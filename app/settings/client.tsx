"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"

// Import the loading skeleton
import SettingsPageSkeleton from "./loading"

// Dynamically import the actual settings component
const UserSettingsPage = dynamic(() => import("@/components/settings/user-settings-page"), {
  loading: () => <SettingsPageSkeleton />,
})

export default function SettingsClient({ userId }: { userId: string | null }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(!!userId)

  useEffect(() => {
    // If userId is null, we need to check auth status on the client
    if (!userId) {
      const checkAuth = async () => {
        try {
          const supabase = createBrowserClient()
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (!session) {
            // Not authenticated, redirect to login
            router.push("/auth?redirectedFrom=/settings")
          } else {
            // User is authenticated, update state
            setIsAuthenticated(true)
            setIsLoading(false)
          }
        } catch (error) {
          console.error("Error checking auth status:", error)
          // On error, redirect to login
          router.push("/auth?redirectedFrom=/settings")
        }
      }

      checkAuth()
    } else {
      // We already have userId, so we're authenticated
      setIsLoading(false)
    }
  }, [userId, router])

  // Show loading state
  if (isLoading) {
    return <SettingsPageSkeleton />
  }

  // Show settings page if authenticated
  if (isAuthenticated) {
    return <UserSettingsPage userId={userId} />
  }

  // This should not be reached due to redirects, but as a fallback
  return <SettingsPageSkeleton />
}
