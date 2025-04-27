"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, AlertCircle } from "lucide-react"
import { authService, type AuthProvider } from "@/lib/services/auth-service"
import { authLogger } from "@/lib/utils/auth-logger"

interface AuthFormProps {
  redirectTo?: string
  initialTab?: "login" | "register"
  serverError?: string
}

export default function AuthForm({ redirectTo = "/", initialTab = "login", serverError }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<AuthProvider | null>(null)
  const [error, setError] = useState<string | null>(serverError || null)
  const [message, setMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab)
  const [isTestMode, setIsTestMode] = useState(false)
  const [testLogs, setTestLogs] = useState<string[]>([])

  // Clear error when tab changes
  useEffect(() => {
    setError(null)
    setMessage(null)
  }, [activeTab])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { user, error } = await authService.login({
        email,
        password,
        rememberMe,
      })

      if (error) {
        setError(error)
        setLoading(false)
        return
      }

      if (user) {
        // Successful login - redirect
        router.push(redirectTo)
        router.refresh()
      } else {
        setError("Login failed. Please try again.")
        setLoading(false)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { user, error } = await authService.signup({
        email,
        password,
        username: username || email.split("@")[0],
      })

      if (error) {
        setError(error)
        setLoading(false)
        return
      }

      setMessage("Registration successful! Please check your email to verify your account.")
      setActiveTab("login")
      setLoading(false)
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: AuthProvider) => {
    setSocialLoading(provider)
    setError(null)

    try {
      const { error } = await authService.socialLogin(provider)

      if (error) {
        setError(`${provider} login failed: ${error}`)
        setSocialLoading(null)
      }
      // Redirect happens automatically
    } catch (err) {
      setError(`An unexpected error occurred with ${provider} login.`)
      setSocialLoading(null)
    }
  }

  const handleTestLogin = async () => {
    setIsTestMode(true)
    setTestLogs(["Starting test login process..."])

    // Create a listener for log updates
    const logListener = (logs: any[]) => {
      setTestLogs(
        logs.map((log) => `[${log.timestamp.split("T")[1].split(".")[0]}] [${log.level.toUpperCase()}] ${log.message}`),
      )
    }

    // Start test login
    try {
      await authService.testLogin(email, password)

      // Get logs after test
      const logs = authLogger.getLogs()
      logListener(logs)

      setTestLogs((prev) => [...prev, "Test login process completed."])
    } catch (error) {
      setTestLogs((prev) => [...prev, `Test failed with error: ${error}`])
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">EsportsHub</CardTitle>
        <CardDescription>Sign in to your account or create a new one</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="mt-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="login">
            <form onSubmit={handleSignIn} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="remember-me" className="text-sm">
                  Remember me for 30 days
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin("discord")}
                  disabled={!!socialLoading}
                >
                  {socialLoading === "discord" ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Discord</>}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin("twitch")}
                  disabled={!!socialLoading}
                >
                  {socialLoading === "twitch" ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Twitch</>}
                </Button>
              </div>

              <div className="text-center mt-4">
                <Button
                  variant="link"
                  className="text-sm text-gray-500"
                  onClick={() => router.push("/auth/forgot-password")}
                >
                  Forgot your password?
                </Button>
              </div>

              {process.env.NODE_ENV !== "production" && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button type="button" variant="secondary" className="w-full" onClick={handleTestLogin}>
                    Test Login (Debug)
                  </Button>

                  {isTestMode && testLogs.length > 0 && (
                    <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono h-40 overflow-auto">
                      {testLogs.map((log, i) => (
                        <div key={i} className="whitespace-pre-wrap">
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleSignUp} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-register">Email</Label>
                <Input
                  id="email-register"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-register">Password</Label>
                <Input
                  id="password-register"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                />
                <p className="text-xs text-gray-500">Password must be at least 8 characters</p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin("discord")}
                  disabled={!!socialLoading}
                >
                  {socialLoading === "discord" ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Discord</>}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin("twitch")}
                  disabled={!!socialLoading}
                >
                  {socialLoading === "twitch" ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Twitch</>}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  )
}
