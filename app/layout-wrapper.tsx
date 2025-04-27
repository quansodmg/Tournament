"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import SiteHeader from "@/components/layout/site-header"
import MainLayout from "@/components/layout/main-layout"
import { setupPresenceTracking } from "@/lib/utils/presence"
import { useAuth } from "@/contexts/auth-context"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  console.log("LayoutWrapper rendering")
  const pathname = usePathname()
  console.log("Current pathname:", pathname)
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Paths that should not have the main layout
  const noLayoutPaths = ["/auth", "/auth/forgot-password", "/auth/reset-password", "/auth/verify", "/auth/callback"]

  // Check if current path should have layout
  const shouldHaveLayout = !noLayoutPaths.some((path) => pathname?.startsWith(path))
  console.log("Should have layout:", shouldHaveLayout)

  useEffect(() => {
    console.log("LayoutWrapper useEffect running")
    setMounted(true)

    // Set up presence tracking when the app loads
    try {
      console.log("Setting up presence tracking")
      const cleanup = setupPresenceTracking()
      console.log("Presence tracking setup complete")

      // Clean up when the component unmounts
      return cleanup
    } catch (error) {
      console.error("Error setting up presence tracking:", error)
      return () => {}
    }
  }, [])

  // Log auth state changes
  useEffect(() => {
    console.log("Auth state in LayoutWrapper:", user ? `Logged in as ${user.username}` : "Not logged in")
    console.log("Auth loading state:", isLoading)
  }, [user, isLoading])

  if (!mounted) {
    console.log("LayoutWrapper not mounted yet, returning null")
    return null
  }

  console.log("LayoutWrapper fully mounted, rendering content")

  if (!shouldHaveLayout) {
    console.log("Rendering without layout")
    return children
  }

  console.log("Rendering with full layout")
  return (
    <>
      <SiteHeader />
      <MainLayout showFriendsSidebar={!!user}>{children}</MainLayout>
    </>
  )
}
