"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"

// Import the loading skeleton
import StatsPageSkeleton from "./loading"

// Dynamically import the actual stats component
const UserStatsPage = dynamic(() => import("@/components/stats/user-stats-page"), {
  loading: () => <StatsPageSkeleton />,
})

export default function StatsClient({ userId }: { userId: string | null }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(!!userId)
  const [currentUserId, setCurrentUserId] = useState<string | null>(userId)

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
            router.push("/auth?redirectedFrom=/stats")
          } else {
            // User is authenticated, update state
            setIsAuthenticated(true)
            setCurrentUserId(session.user.id)
            setIsLoading(false)
          }
        } catch (error) {
          console.error("Error checking auth status:", error)
          // On error, show the component with null userId
          // The component will handle this case internally
          setIsLoading(false)
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
    return <StatsPageSkeleton />
  }

  // Show stats page with the userId (which might be null)
  return <UserStatsPage userId={currentUserId} />
}
