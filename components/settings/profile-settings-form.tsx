"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageUpload } from "@/components/ui/image-upload"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfileSettingsFormProps {
  profile: any
  onSaveSuccess: (message: string) => void
  onSaveError: (message: string) => void
}

export default function ProfileSettingsForm({ profile, onSaveSuccess, onSaveError }: ProfileSettingsFormProps) {
  const [username, setUsername] = useState(profile?.username || "")
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [twitterUrl, setTwitterUrl] = useState(profile?.twitter_url || "")
  const [twitchUrl, setTwitchUrl] = useState(profile?.twitch_url || "")
  const [youtubeUrl, setYoutubeUrl] = useState(profile?.youtube_url || "")
  const [discordUsername, setDiscordUsername] = useState(profile?.discord_username || "")
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

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
          onSaveError("Username already taken")
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
          discord_username: discordUsername,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      onSaveSuccess("Profile updated successfully!")
    } catch (err) {
      console.error("Error updating profile:", err)
      onSaveError("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl text-white">Profile Information</CardTitle>
        <CardDescription className="text-gray-400">
          Update your profile information visible to other users
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <Label htmlFor="avatar" className="text-gray-300 mb-2 block">
                Profile Picture
              </Label>
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24 border-2 border-[#0bb5ff]">
                  <AvatarImage src={avatarUrl || ""} alt={username} />
                  <AvatarFallback className="bg-[#1a1a1a] text-[#0bb5ff]">
                    {username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <ImageUpload
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  bucketName="profile-images"
                  folderPath="avatars"
                  aspectRatio="1/1"
                  width={256}
                  height={256}
                  className="w-full"
                />
              </div>
            </div>

            <div className="w-full md:w-2/3 space-y-6">
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
                  <p className="text-xs text-gray-500 mt-1">This is your unique username on the platform</p>
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
                  <p className="text-xs text-gray-500 mt-1">Your real name (optional)</p>
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
                <p className="text-xs text-gray-500 mt-1">A brief description about yourself (max 500 characters)</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-3">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div>
                <Label htmlFor="discord-username" className="text-gray-300 mb-1 block">
                  Discord Username
                </Label>
                <Input
                  id="discord-username"
                  type="text"
                  placeholder="username#1234"
                  value={discordUsername}
                  onChange={(e) => setDiscordUsername(e.target.value)}
                  className="bg-[#151518] border-[#222] text-white focus:border-[#0bb5ff] focus:ring-[#0bb5ff]/10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
