"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import ProfileSettingsForm from "./profile-settings-form"
import AccountSettingsForm from "./account-settings-form"
import NotificationSettingsForm from "./notification-settings-form"
import AppearanceSettingsForm from "./appearance-settings-form"
import PrivacySettingsForm from "./privacy-settings-form"

export default function UserSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/auth?redirectedFrom=/settings")
          return
        }

        const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        if (error) throw error

        setProfile(data)
      } catch (err) {
        console.error("Error loading profile:", err)
        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router, supabase])

  const handleSaveSuccess = (message: string) => {
    setSuccess(message)
    setError(null)
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null)
    }, 3000)
  }

  const handleSaveError = (message: string) => {
    setError(message)
    setSuccess(null)
  }

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 text-[#0bb5ff] animate-spin" />
          <p className="text-white">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-8 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-2">Customize your EsportsHub experience</p>
        </div>

        {error && (
          <Alert className="bg-red-900/20 border-red-900/50 text-red-400 mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-900/20 border-green-900/50 text-green-400 mb-6">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="bg-[#101113] rounded-xl border border-[#222] overflow-hidden">
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-[#222]">
              <TabsList className="bg-transparent h-auto p-0 flex w-full overflow-x-auto">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-[#151518] data-[state=active]:text-[#0bb5ff] rounded-none border-r border-[#222] px-6 py-3 text-gray-400"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="account"
                  className="data-[state=active]:bg-[#151518] data-[state=active]:text-[#0bb5ff] rounded-none border-r border-[#222] px-6 py-3 text-gray-400"
                >
                  Account
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="data-[state=active]:bg-[#151518] data-[state=active]:text-[#0bb5ff] rounded-none border-r border-[#222] px-6 py-3 text-gray-400"
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="appearance"
                  className="data-[state=active]:bg-[#151518] data-[state=active]:text-[#0bb5ff] rounded-none border-r border-[#222] px-6 py-3 text-gray-400"
                >
                  Appearance
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className="data-[state=active]:bg-[#151518] data-[state=active]:text-[#0bb5ff] rounded-none px-6 py-3 text-gray-400"
                >
                  Privacy
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="profile" className="mt-0">
                <ProfileSettingsForm
                  profile={profile}
                  onSaveSuccess={handleSaveSuccess}
                  onSaveError={handleSaveError}
                />
              </TabsContent>

              <TabsContent value="account" className="mt-0">
                <AccountSettingsForm
                  profile={profile}
                  onSaveSuccess={handleSaveSuccess}
                  onSaveError={handleSaveError}
                />
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <NotificationSettingsForm
                  profile={profile}
                  onSaveSuccess={handleSaveSuccess}
                  onSaveError={handleSaveError}
                />
              </TabsContent>

              <TabsContent value="appearance" className="mt-0">
                <AppearanceSettingsForm
                  profile={profile}
                  onSaveSuccess={handleSaveSuccess}
                  onSaveError={handleSaveError}
                />
              </TabsContent>

              <TabsContent value="privacy" className="mt-0">
                <PrivacySettingsForm
                  profile={profile}
                  onSaveSuccess={handleSaveSuccess}
                  onSaveError={handleSaveError}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
