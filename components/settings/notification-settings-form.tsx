"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface NotificationSettingsFormProps {
  profile: any
  onSaveSuccess: (message: string) => void
  onSaveError: (message: string) => void
}

export default function NotificationSettingsForm({
  profile,
  onSaveSuccess,
  onSaveError,
}: NotificationSettingsFormProps) {
  const [emailNotifications, setEmailNotifications] = useState(profile?.email_notifications ?? true)
  const [pushNotifications, setPushNotifications] = useState(profile?.push_notifications ?? true)
  const [tournamentUpdates, setTournamentUpdates] = useState(profile?.tournament_notifications ?? true)
  const [matchReminders, setMatchReminders] = useState(profile?.match_notifications ?? true)
  const [teamInvites, setTeamInvites] = useState(profile?.team_notifications ?? true)
  const [friendRequests, setFriendRequests] = useState(profile?.friend_notifications ?? true)
  const [directMessages, setDirectMessages] = useState(profile?.message_notifications ?? true)
  const [marketingEmails, setMarketingEmails] = useState(profile?.marketing_notifications ?? false)
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
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
          tournament_notifications: tournamentUpdates,
          match_notifications: matchReminders,
          team_notifications: teamInvites,
          friend_notifications: friendRequests,
          message_notifications: directMessages,
          marketing_notifications: marketingEmails,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      onSaveSuccess("Notification preferences updated successfully!")
    } catch (err) {
      console.error("Error updating notification settings:", err)
      onSaveError("Failed to update notification settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl text-white">Notification Preferences</CardTitle>
        <CardDescription className="text-gray-400">
          Control which notifications you receive and how you receive them
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-white font-medium">Notification Channels</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="text-gray-300">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  className="data-[state=checked]:bg-[#0bb5ff]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications" className="text-gray-300">
                    Push Notifications
                  </Label>
                  <p className="text-xs text-gray-500">Receive notifications on your device</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                  className="data-[state=checked]:bg-[#0bb5ff]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-medium">Notification Types</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="tournament-updates" className="text-gray-300">
                    Tournament Updates
                  </Label>
                  <p className="text-xs text-gray-500">Updates about tournaments you've registered for</p>
                </div>
                <Switch
                  id="tournament-updates"
                  checked={tournamentUpdates}
                  onCheckedChange={setTournamentUpdates}
                  className="data-[state=checked]:bg-[#0bb5ff]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="match-reminders" className="text-gray-300">
                    Match Reminders
                  </Label>
                  <p className="text-xs text-gray-500">Reminders about upcoming matches</p>
                </div>
                <Switch
                  id="match-reminders"
                  checked={matchReminders}
                  onCheckedChange={setMatchReminders}
                  className="data-[state=checked]:bg-[#0bb5ff]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="team-invites" className="text-gray-300">
                    Team Invitations
                  </Label>
                  <p className="text-xs text-gray-500">Notifications when you're invited to join a team</p>
                </div>
                <Switch
                  id="team-invites"
                  checked={teamInvites}
                  onCheckedChange={setTeamInvites}
                  className="data-[state=checked]:bg-[#0bb5ff]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="friend-requests" className="text-gray-300">
                    Friend Requests
                  </Label>
                  <p className="text-xs text-gray-500">Notifications for new friend requests</p>
                </div>
                <Switch
                  id="friend-requests"
                  checked={friendRequests}
                  onCheckedChange={setFriendRequests}
                  className="data-[state=checked]:bg-[#0bb5ff]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="direct-messages" className="text-gray-300">
                    Direct Messages
                  </Label>
                  <p className="text-xs text-gray-500">Notifications for new direct messages</p>
                </div>
                <Switch
                  id="direct-messages"
                  checked={directMessages}
                  onCheckedChange={setDirectMessages}
                  className="data-[state=checked]:bg-[#0bb5ff]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-medium">Marketing Communications</h3>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing-emails" className="text-gray-300">
                  Marketing Emails
                </Label>
                <p className="text-xs text-gray-500">Receive updates about new features and promotions</p>
              </div>
              <Switch
                id="marketing-emails"
                checked={marketingEmails}
                onCheckedChange={setMarketingEmails}
                className="data-[state=checked]:bg-[#0bb5ff]"
              />
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
                "Save Preferences"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
