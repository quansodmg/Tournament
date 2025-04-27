"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { authLogger } from "@/lib/utils/auth-logger"
import { authService } from "@/lib/services/auth-service"

export default function AuthDebugPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Get logs
      const authLogs = authLogger.getLogs()
      setLogs(authLogs)

      // Get session info
      try {
        const { session } = await authService.getSession()
        setSessionInfo(session)
      } catch (error) {
        console.error("Error fetching session:", error)
      }

      // Get user info
      try {
        const { user } = await authService.getCurrentUser()
        setUserInfo(user)
      } catch (error) {
        console.error("Error fetching user:", error)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const clearLogs = () => {
    authLogger.clearLogs()
    setLogs([])
  }

  const refreshData = async () => {
    setLoading(true)

    // Get logs
    const authLogs = authLogger.getLogs()
    setLogs(authLogs)

    // Get session info
    try {
      const { session } = await authService.getSession()
      setSessionInfo(session)
    } catch (error) {
      console.error("Error fetching session:", error)
    }

    // Get user info
    try {
      const { user } = await authService.getCurrentUser()
      setUserInfo(user)
    } catch (error) {
      console.error("Error fetching user:", error)
    }

    setLoading(false)
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Auth Debug</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session Info</CardTitle>
            <CardDescription>Current authentication session</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : sessionInfo ? (
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60">
                {JSON.stringify(
                  {
                    user_id: sessionInfo.user?.id,
                    email: sessionInfo.user?.email,
                    expires_at: sessionInfo.expires_at,
                    provider: sessionInfo.user?.app_metadata?.provider,
                  },
                  null,
                  2,
                )}
              </pre>
            ) : (
              <div className="text-red-500">No active session</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Info</CardTitle>
            <CardDescription>Current user profile</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : userInfo ? (
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            ) : (
              <div className="text-red-500">No user logged in</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Auth Logs</CardTitle>
            <CardDescription>Recent authentication activity</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshData} disabled={loading}>
              Refresh
            </Button>
            <Button variant="destructive" onClick={clearLogs} disabled={loading}>
              Clear Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : logs.length > 0 ? (
            <div className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`mb-1 pb-1 border-b border-gray-200 ${
                    log.level === "error"
                      ? "text-red-600"
                      : log.level === "warn"
                        ? "text-amber-600"
                        : log.level === "info"
                          ? "text-blue-600"
                          : ""
                  }`}
                >
                  <span className="font-mono">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{" "}
                  <span className="font-bold">[{log.level.toUpperCase()}]</span> {log.message}
                  {log.data && <pre className="ml-6 mt-1 text-gray-700">{JSON.stringify(log.data, null, 2)}</pre>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No logs available</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
