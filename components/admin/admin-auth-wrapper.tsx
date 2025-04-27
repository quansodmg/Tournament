"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { Loader2, AlertCircle, LogIn, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function AdminAuthWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if we're in a preview environment
    const checkPreviewEnvironment = () => {
      const isPreview =
        process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
        window.location.hostname.includes("vercel.app") ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"

      console.log("Environment check:", {
        env: process.env.NEXT_PUBLIC_VERCEL_ENV,
        hostname: window.location.hostname,
        isPreview,
      })

      return isPreview
    }

    const initializeAdmin = async () => {
      try {
        // Check if we're in a preview environment
        const isPreviewing = checkPreviewEnvironment()
        setIsPreview(isPreviewing)

        if (isPreviewing) {
          console.log("Preview environment detected, enabling static admin mode")
          // In preview, just allow access without any authentication
          setIsAdmin(true)
          setIsLoading(false)
          return
        }

        // Get the current session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          console.log("No session found, redirecting to auth")
          router.push("/auth?redirectedFrom=/admin")
          return
        }

        // Check if user is an admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin, email")
          .eq("id", session.user.id)
          .single()

        // Special case for quanstewart@hotmail.com
        const isSpecialAdmin =
          session.user.email === "quanstewart@hotmail.com" || profile?.email === "quanstewart@hotmail.com"

        if (profile?.is_admin || isSpecialAdmin) {
          console.log("Admin access granted")
          setIsAdmin(true)
        } else {
          console.log("Not an admin, redirecting to home")
          router.push("/")
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error in admin initialization:", error)
        setError("An unexpected error occurred. Please try again.")
        setIsLoading(false)
      }
    }

    // Only run in the browser
    if (typeof window !== "undefined") {
      initializeAdmin()
    }
  }, [router, supabase])

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101113]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#0bb5ff]" />
          <p className="mt-4 text-white">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101113]">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-white">Error</h2>
          <p className="mt-2 text-gray-300">{error}</p>
          <div className="mt-6 flex justify-center space-x-4">
            <Button onClick={handleRetry} className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-[#0bb5ff] text-[#0bb5ff] hover:bg-[#0bb5ff]/10"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-[#67b7ff]">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-[#101113] m-4 rounded-lg text-white">
        {isPreview && (
          <div className="mb-6 rounded-md border border-yellow-500/20 bg-yellow-500/10 p-4">
            <p className="text-sm text-yellow-300">
              <strong>Preview Mode:</strong> You are viewing a static preview of the admin panel. Database operations
              are disabled in this environment.
            </p>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
