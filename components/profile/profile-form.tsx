"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

interface ProfileFormProps {
  profile: any
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [username, setUsername] = useState(profile?.username || "")
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [twitterUrl, setTwitterUrl] = useState(profile?.twitter_url || "")
  const [twitterHandle, setTwitterHandle] = useState(profile?.twitter_handle || "")
  const [youtubeUrl, setYoutubeUrl] = useState(profile?.youtube_url || "")
  const [youtubeHandle, setYoutubeHandle] = useState(profile?.youtube_handle || "")
  const [tiktokUrl, setTiktokUrl] = useState(profile?.tiktok_url || "")
  const [tiktokHandle, setTiktokHandle] = useState(profile?.tiktok_handle || "")
  const [kickUrl, setKickUrl] = useState(profile?.kick_url || "")
  const [kickHandle, setKickHandle] = useState(profile?.kick_handle || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
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
          setLoading(false)
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
          twitter_handle: twitterHandle,
          youtube_url: youtubeUrl,
          youtube_handle: youtubeHandle,
          tiktok_url: tiktokUrl,
          tiktok_handle: tiktokHandle,
          kick_url: kickUrl,
          kick_handle: kickHandle,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
      router.refresh()
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl || ""} alt={username} />
              <AvatarFallback>{username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar-url">Profile Picture URL</Label>
              <Input
                id="avatar-url"
                type="text"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input id="full-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter-url">Twitter URL</Label>
            <Input
              id="twitter-url"
              type="text"
              placeholder="https://twitter.com/yourname"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter-handle">Twitter Username</Label>
            <Input
              id="twitter-handle"
              type="text"
              placeholder="yourname"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube URL</Label>
            <Input
              id="youtube-url"
              type="text"
              placeholder="https://youtube.com/yourchannel"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube-handle">YouTube Channel Name</Label>
            <Input
              id="youtube-handle"
              type="text"
              placeholder="Your Channel"
              value={youtubeHandle}
              onChange={(e) => setYoutubeHandle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tiktok-url">TikTok URL</Label>
            <Input
              id="tiktok-url"
              type="text"
              placeholder="https://tiktok.com/@username"
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tiktok-handle">TikTok Username</Label>
            <Input
              id="tiktok-handle"
              type="text"
              placeholder="username"
              value={tiktokHandle}
              onChange={(e) => setTiktokHandle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kick-url">Kick URL</Label>
            <Input
              id="kick-url"
              type="text"
              placeholder="https://kick.com/username"
              value={kickUrl}
              onChange={(e) => setKickUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kick-handle">Kick Username</Label>
            <Input
              id="kick-handle"
              type="text"
              placeholder="username"
              value={kickHandle}
              onChange={(e) => setKickHandle(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
