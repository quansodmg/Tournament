"use client"

import { CardDescription } from "@/components/ui/card"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import ProfileForm from "@/components/profile/profile-form"

export default function ProfileClientWrapper() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      try {
        // Dynamically import the client
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = await createClient()

        // Check if user is logged in
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw new Error("Failed to get session")
        }

        if (!session) {
          router.push("/auth?redirectedFrom=/profile")
          return
        }

        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError
        }

        // If profile doesn't exist, create it
        if (!profileData) {
          const { ensureProfile } = await import("@/lib/utils/ensure-profile")
          await ensureProfile(session.user.id, undefined, session.user.user_metadata?.full_name)

          // Fetch the newly created profile
          const { data: newProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

          setProfile(newProfile)
        } else {
          setProfile(profileData)
        }
      } catch (err) {
        console.error("Error loading profile:", err)
        setError("Failed to load profile. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  if (loading) {
    return (
      <div className="container max-w-screen-xl mx-auto py-16 px-4 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-screen-xl mx-auto py-16 px-4">
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-red-600">Profile Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-screen-xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <ProfileForm profile={profile} />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Stats Overview</CardTitle>
              <CardDescription>Your gaming performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Tournaments Played</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Matches Played</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Win Rate</p>
                  <p className="text-2xl font-bold">0%</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Earnings</p>
                  <p className="text-2xl font-bold">$0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
