"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import { testSupabaseConnection, resetClient } from "@/lib/supabase/client"

export function ConnectionRecovery() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  async function checkConnection() {
    setConnectionStatus("checking")
    try {
      const result = await testSupabaseConnection()
      setConnectionStatus(result.success ? "connected" : "disconnected")
    } catch (error) {
      console.error("Connection check failed:", error)
      setConnectionStatus("disconnected")
    }
  }

  async function handleRetry() {
    setIsRetrying(true)
    try {
      // Reset the client to force a new connection
      resetClient()
      await checkConnection()
    } catch (error) {
      console.error("Retry failed:", error)
    } finally {
      setIsRetrying(false)
    }
  }

  if (connectionStatus === "connected" || connectionStatus === "checking") {
    return null
  }

  return (
    <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md flex items-center justify-between">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
        <span className="text-red-700">Database connection unavailable</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRetry}
        disabled={isRetrying}
        className="bg-white hover:bg-gray-100"
      >
        {isRetrying ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Retrying...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </>
        )}
      </Button>
    </div>
  )
}
