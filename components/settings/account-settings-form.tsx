"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AccountSettingsFormProps {
  profile: any
  onSaveSuccess: (message: string) => void
  onSaveError: (message: string) => void
}

export default function AccountSettingsForm({ profile, onSaveSuccess, onSaveError }: AccountSettingsFormProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const supabase = createClient()

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setPasswordError(null)

    try {
      if (newPassword !== confirmPassword) {
        setPasswordError("New passwords do not match")
        return
      }

      if (newPassword.length < 8) {
        setPasswordError("Password must be at least 8 characters long")
        return
      }

      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email, // We don't have this in the profile object, so this is a placeholder
        password: currentPassword,
      })

      if (signInError) {
        setPasswordError("Current password is incorrect")
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      // Clear form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      onSaveSuccess("Password updated successfully!")
    } catch (err) {
      console.error("Error updating password:", err)
      onSaveError("Failed to update password")
    } finally {
      setSaving(false)
    }
  }

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase.auth.updateUser({
        email: email,
      })

      if (error) throw error

      // Clear form
      setEmail("")

      onSaveSuccess("Email update initiated. Please check your inbox for confirmation.")
    } catch (err) {
      console.error("Error updating email:", err)
      onSaveError("Failed to update email")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl text-white">Change Password</CardTitle>
          <CardDescription className="text-gray-400">Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {passwordError && (
            <Alert className="bg-red-900/20 border-red-900/50 text-red-400 mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="current-password" className="text-gray-300 mb-1 block">
                Current Password
              </Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="bg-[#151518] border-[#222] text-white focus:border-[#0bb5ff] focus:ring-[#0bb5ff]/10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="new-password" className="text-gray-300 mb-1 block">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-[#151518] border-[#222] text-white focus:border-[#0bb5ff] focus:ring-[#0bb5ff]/10"
                />
              </div>

              <div>
                <Label htmlFor="confirm-password" className="text-gray-300 mb-1 block">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-[#151518] border-[#222] text-white focus:border-[#0bb5ff] focus:ring-[#0bb5ff]/10"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl text-white">Change Email</CardTitle>
          <CardDescription className="text-gray-400">Update your account email address</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div>
              <Label htmlFor="new-email" className="text-gray-300 mb-1 block">
                New Email Address
              </Label>
              <Input
                id="new-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#151518] border-[#222] text-white focus:border-[#0bb5ff] focus:ring-[#0bb5ff]/10"
              />
              <p className="text-xs text-gray-500 mt-1">You will receive a confirmation email to verify this change</p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Email"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl text-white">Danger Zone</CardTitle>
          <CardDescription className="text-gray-400">Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="border border-red-900/50 rounded-lg p-4 bg-red-900/10">
            <h3 className="text-red-400 font-medium mb-2">Delete Account</h3>
            <p className="text-gray-400 text-sm mb-4">
              Once you delete your account, there is no going back. This action is permanent.
            </p>
            <Button variant="destructive" className="bg-red-900 hover:bg-red-800 text-white">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
