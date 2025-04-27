"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ProfileEditForm() {
  const [profile, setProfile] = useState<any>(null)
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [twitterUrl, setTwitterUrl] = useState("")
  const [twitchUrl, setTwitchUrl] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/auth?redirectedFrom=/profile/edit")
          return
        }

        const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        if (error) throw error

        setProfile(data)
        setUsername(data?.username || "")
        setFullName(data?.full_name || "")
        setBio(data?.bio || "")
        setAvatarUrl(data?.avatar_url || "")
        setTwitterUrl(data?.twitter_url || "")
        setTwitchUrl(data?.twitch_url || "")
        setYoutubeUrl(data?.youtube_url || "")
      } catch (err) {
        console.error("Error loading profile:", err)
        setError("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      if (!profile) throw new Error("Profile not found")

      // Check if username is already taken (if changed)
      if (username !== profile.username) {
        const { data: existingUsers } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", username)
          .neq("id", profile.id)
          .single()

        if (existingUsers) {
          setError("Username already taken")
          setSaving(false)
          return
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          full_name: fullName,
          bio,
          avatar_url: avatarUrl,
          twitter_url: twitterUrl,
          twitch_url: twitchUrl,
          youtube_url: youtubeUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push("/profile")
      }, 1500)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 text-[#0bb5ff] animate-spin" />
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="container max-w-screen-xl mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button asChild variant="ghost" className="text-gray-400 hover:text-white hover:bg-[#151518]">
              <Link href="/profile">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Link>
            </Button>
          </div>

          <div className="bg-[#101113] rounded-xl border border-[#222] p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

            {error && (
              <Alert className="bg-red-900/20 border-red-900/50 text-red-400 mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-900/20 border-green-900/50 text-green-400 mb-6">
                <AlertDescription>Profile updated successfully! Redirecting...</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 border-2 border-[#0bb5ff] mb-2">
                    <AvatarImage src={avatarUrl || ""} alt={username} />
                    <AvatarFallback className="bg-[#1a1a1a] text-[#0bb5ff]">
                      {username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-gray-400">Profile Picture</p>
                </div>

                <div className="flex-1">
                  <Label htmlFor="avatar-url" className="text-gray-300 mb-1 block">
                    Avatar URL
                  </Label>
                  <Input
                    id="avatar-url"
                    type="text"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="bg-[#151518] border-[#222] text-white focus:border-[#0bb5ff] focus:ring-[#0bb5ff]/10"
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter a URL to an image for your profile picture</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="username" className="text-gray-300 mb-1 block">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-[#151518] border-[#222] text-white focus:border-[#0bb5ff] focus:ring-[#0bb5ff]/10"
                  />
                </div>

                <div>
                  <Label htmlFor="full-name" className="text-gray-300 mb-1 block">
                    Full Name
                  </Label>
                  <Input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-[#151518] border-[#222] text-white focus:border-[#0bb5ff] focus:ring-[#0bb5ff]/10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="text-gray-300 mb-1 block">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="bg-[#151518] border-[#222] text-white focus:border-[#0bb5ff] focus:ring-[#0bb5ff]/10"
                />
              </div>

              <div>
                <h3 className="text-white font-medium mb-3">Social Media Links</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="twitter-url" className="text-gray-300 mb-1 block">
                      Twitter URL
                    </Label>
                    <Input
                      id="twitter-url"
                      type="text"
                      placeholder="https://twitter.com/yourname"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      className="bg-[#151518] border-[#222] text-white focus:border-[#0bb5ff] focus:ring-[#0bb5ff]/10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitch-url" className="text-gray-300 mb-1 block">
                      Twitch URL
                    </Label>
                    <Input
                      id="twitch-url"
                      type="text"
                      placeholder="https://twitch.tv/yourname"
                      value={twitchUrl}
                      onChange={(e) => setTwitchUrl(e.target.value)}
                      className="bg-[#151518] border-[#222] text-white focus:border-[#0bb5ff] focus:ring-[#0bb5ff]/10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="youtube-url" className="text-gray-300 mb-1 block">
                      YouTube URL
                    </Label>
                    <Input
                      id="youtube-url"
                      type="text"
                      placeholder="https://youtube.com/yourchannel"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="bg-[#151518] border-[#222] text-white focus:border-[#0bb5ff] focus:ring-[#0bb5ff]/10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/profile")}
                  className="border-[#222] text-gray-300 hover:bg-[#151518] hover:text-white"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
