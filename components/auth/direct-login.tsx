"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function DirectLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      const supabase = createClient()
      if (!supabase) {
        throw new Error("Could not initialize Supabase client")
      }

      // Clear any existing session first
      await supabase.auth.signOut()

      // Log the attempt
      console.log("Attempting direct login for:", email)
      setDebugInfo("Attempting login...")

      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error("Login successful but no user returned")
      }

      // Log success
      console.log("Login successful for:", data.user.id)
      setDebugInfo(`Login successful! User ID: ${data.user.id.slice(0, 8)}...`)

      // Store session info in localStorage
      localStorage.setItem("directLoginSuccess", "true")
      localStorage.setItem("directLoginTime", new Date().toISOString())
      localStorage.setItem("directLoginUserId", data.user.id)

      // Force a refresh
      router.refresh()

      // Direct navigation to home page
      setTimeout(() => {
        window.location.href = "/"
      }, 1000)
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "An error occurred during login")
      setDebugInfo(`Error: ${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Direct Login</CardTitle>
        <CardDescription>Use this method if normal login is not working</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="direct-email">Email</Label>
            <Input
              id="direct-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="direct-password">Password</Label>
            <Input
              id="direct-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {debugInfo && <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">{debugInfo}</div>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Login Directly
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
