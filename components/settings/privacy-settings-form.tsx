"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PrivacySettingsFormProps {
  profile: any
  onSaveSuccess: (message: string) => void
  onSaveError: (message: string) => void
}

export default function PrivacySettingsForm({ profile, onSaveSuccess, onSaveError }: PrivacySettingsFormProps) {
  const [profileVisibility, setProfileVisibility] = useState(profile?.profile_visibility || "public")
  const [showOnlineStatus, setShowOnlineStatus] = useState(profile?.show_online_status ?? true)
  const [showActivity, setShowActivity] = useState(profile?.show_activity ?? true)
  const [allowFriendRequests, setAllowFriendRequests] = useState(profile?.allow_friend_requests ?? true)
  const [allowTeamInvites, setAllowTeamInvites] = useState(profile?.allow_team_invites ?? true)
  const [allowDirectMessages, setAllowDirectMessages] = useState(profile?.allow_direct_messages || "everyone")
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (!profile) throw new Error("Profile not found")

      const { error } = await supabase
        .from("profiles")
        .update({
          profile_visibility: profileVisibility,
          show_online_status: showOnlineStatus,
          show_activity: showActivity,
          allow_friend_requests: allowFriendRequests,
          allow_team_invites: allowTeamInvites,
          allow_direct_messages: allowDirectMessages,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      onSaveSuccess("Privacy settings updated successfully!")
    } catch (err) {
      console.error("Error updating privacy settings:", err)
      onSaveError("Failed to update privacy settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl text-white">Privacy Settings</CardTitle>
        <CardDescription className="text-gray-400">Control your privacy and visibility on EsportsHub</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="profile-visibility" className="text-gray-300 mb-1 block">
                Profile Visibility
              </Label>
              <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                <SelectTrigger
                  id="profile-visibility"
                  className="bg-[#151518] border-[#222] text-white focus:border-[#0bb5ff] focus:ring-[#0bb5ff]/10"
                >
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent className="bg-[#151518] border-[#222] text-white">
                  <SelectItem value="public">Public - Anyone can view your profile</SelectItem>
                  <SelectItem value="friends">Friends Only - Only friends can view your profile</SelectItem>
                  <SelectItem value="private">Private - Only you can view your profile</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Control who can see your profile information</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="online-status" className="text-gray-300">
                  Show Online Status
                </Label>
                <p className="text-xs text-gray-500">Allow others to see when you're online</p>
              </div>
              <Switch
                id="online-status"
                checked={showOnlineStatus}
                onCheckedChange={setShowOnlineStatus}
                className="data-[state=checked]:bg-[#0bb5ff]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-activity" className="text-gray-300">
                  Show Activity
                </Label>
                <p className="text-xs text-gray-500">Allow others to see your recent activity</p>
              </div>
              <Switch
                id="show-activity"
                checked={showActivity}
                onCheckedChange={setShowActivity}
                className="data-[state=checked]:bg-[#0bb5ff]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-medium">Communication Privacy</h3>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="friend-requests" className="text-gray-300">
                  Allow Friend Requests
                </Label>
                <p className="text-xs text-gray-500">Allow others to send you friend requests</p>
              </div>
              <Switch
                id="friend-requests"
                checked={allowFriendRequests}
                onCheckedChange={setAllowFriendRequests}
                className="data-[state=checked]:bg-[#0bb5ff]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="team-invites" className="text-gray-300">
                  Allow Team Invites
                </Label>
                <p className="text-xs text-gray-500">Allow others to invite you to teams</p>
              </div>
              <Switch
                id="team-invites"
                checked={allowTeamInvites}
                onCheckedChange={setAllowTeamInvites}
                className="data-[state=checked]:bg-[#0bb5ff]"
              />
            </div>

            <div>
              <Label htmlFor="direct-messages" className="text-gray-300 mb-1 block">
                Direct Messages
              </Label>
              <Select value={allowDirectMessages} onValueChange={setAllowDirectMessages}>
                <SelectTrigger
                  id="direct-messages"
                  className="bg-[#151518] border-[#222] text-white focus:border-[#0bb5ff] focus:ring-[#0bb5ff]/10"
                >
                  <SelectValue placeholder="Select who can message you" />
                </SelectTrigger>
                <SelectContent className="bg-[#151518] border-[#222] text-white">
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="team">Team Members Only</SelectItem>
                  <SelectItem value="none">No One</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Control who can send you direct messages</p>
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
                "Save Privacy Settings"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
