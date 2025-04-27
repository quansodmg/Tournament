"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export default function DebugPage() {
  const { user, isLoading } = useAuth()
  const [sessionData, setSessionData] = useState<any>(null)
  const [localStorageData, setLocalStorageData] = useState<any>({})
  const [cookieData, setCookieData] = useState<string[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Fetch session data
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      setSessionData({ data, error: error?.message })
    }

    fetchSession()

    // Get localStorage data
    if (typeof window !== "undefined") {
      const lsData: Record<string, any> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          try {
            const value = localStorage.getItem(key)
            lsData[key] = value ? JSON.parse(value) : value
          } catch (e) {
            lsData[key] = localStorage.getItem(key)
          }
        }
      }
      setLocalStorageData(lsData)
    }

    // Get cookie names (can't read values for security reasons)
    if (typeof document !== "undefined") {
      setCookieData(document.cookie.split(";").map((c) => c.trim()))
    }
  }, [supabase])

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      setSessionData({ data, error: error?.message })
      alert("Session refreshed")
    } catch (e) {
      console.error("Error refreshing session:", e)
      alert("Error refreshing session")
    }
  }

  const clearLocalStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.clear()
      setLocalStorageData({})
      alert("Local storage cleared")
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>

      <div className="grid gap-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Auth Context State</h2>
          <div className="bg-gray-900 p-3 rounded overflow-auto max-h-60">
            <pre className="text-xs text-gray-300">{JSON.stringify({ user, isLoading }, null, 2)}</pre>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Session Data</h2>
          <div className="bg-gray-900 p-3 rounded overflow-auto max-h-60">
            <pre className="text-xs text-gray-300">{JSON.stringify(sessionData, null, 2)}</pre>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Local Storage Data</h2>
          <div className="bg-gray-900 p-3 rounded overflow-auto max-h-60">
            <pre className="text-xs text-gray-300">{JSON.stringify(localStorageData, null, 2)}</pre>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Cookie Names</h2>
          <div className="bg-gray-900 p-3 rounded overflow-auto max-h-60">
            <pre className="text-xs text-gray-300">{JSON.stringify(cookieData, null, 2)}</pre>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <Button onClick={refreshSession}>Refresh Session</Button>
        <Button variant="destructive" onClick={clearLocalStorage}>
          Clear Local Storage
        </Button>
      </div>
    </div>
  )
}
