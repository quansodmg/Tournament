"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

type Profile = {
  id: string
  username: string
  avatar_url: string | null
  email?: string
}

type AuthContextType = {
  user: Profile | null
  isLoading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authDebug, setAuthDebug] = useState<any>({})
  const supabase = createClientComponentClient<Database>()

  // Check if user is admin
  const checkAdminStatus = async (userId: string, userEmail: string) => {
    try {
      console.log("Checking admin status for:", userId, userEmail)

      // Special case for your email
      if (userEmail === "quanstewart@hotmail.com") {
        console.log("Special case admin detected")
        setIsAdmin(true)
        return
      }

      const { data, error } = await supabase.rpc("is_admin", {
        user_id: userId,
      })

      if (error) {
        console.error("Error checking admin status:", error)
        // Still set as admin if it's your email
        const isSpecialAdmin = userEmail === "quanstewart@hotmail.com"
        console.log("Setting admin status after error:", isSpecialAdmin)
        setIsAdmin(isSpecialAdmin)
        return
      }

      const adminStatus = data || userEmail === "quanstewart@hotmail.com"
      console.log("Admin status determined:", adminStatus)
      setIsAdmin(adminStatus)
    } catch (error) {
      console.error("Error in checkAdminStatus:", error)
      // Fallback to email check
      const isSpecialAdmin = userEmail === "quanstewart@hotmail.com"
      console.log("Setting admin status after exception:", isSpecialAdmin)
      setIsAdmin(isSpecialAdmin)
    }
  }

  useEffect(() => {
    console.log("AuthProvider mounted")
    let isMounted = true

    const fetchUser = async () => {
      try {
        console.log("Fetching user in AuthProvider")
        // Get current session with error handling
        let session = null
        try {
          const { data, error: sessionError } = await supabase.auth.getSession()
          if (sessionError) {
            console.error("Session error in AuthProvider:", sessionError)
            // Update debug info
            setAuthDebug((prev) => ({
              ...prev,
              sessionError: sessionError.message,
              timestamp: new Date().toISOString(),
            }))
          } else {
            session = data.session
          }
        } catch (sessionErr) {
          console.error("Exception getting session in AuthProvider:", sessionErr)
          // Update debug info
          setAuthDebug((prev) => ({
            ...prev,
            sessionException: sessionErr instanceof Error ? sessionErr.message : String(sessionErr),
            timestamp: new Date().toISOString(),
          }))
        }

        console.log("Session check result in AuthProvider:", session ? "Session exists" : "No session")

        // Update debug info
        const debugInfo = {
          hasSession: !!session,
          timestamp: new Date().toISOString(),
        }
        setAuthDebug(debugInfo)

        // Log debug info
        console.log("Auth context debug info:", debugInfo)

        if (!isMounted) return

        if (session) {
          try {
            console.log("Session found in AuthProvider, fetching profile")
            // Get user profile
            const { data: profile, error } = await supabase
              .from("profiles")
              .select("id, username, avatar_url")
              .eq("id", session.user.id)
              .single()

            if (!isMounted) return

            if (error) {
              console.error("Error fetching profile in AuthProvider:", error)
              // Set minimal user info from session
              const fallbackUser = {
                id: session.user.id,
                username: session.user.email?.split("@")[0] || "User",
                avatar_url: null,
                email: session.user.email,
              }
              console.log("Using fallback user info in AuthProvider:", fallbackUser)
              setUser(fallbackUser)

              // Update debug info
              setAuthDebug((prev) => ({
                ...prev,
                profileError: error.message,
                fallbackUser,
              }))
            } else if (profile) {
              const userWithEmail = {
                ...profile,
                email: session.user.email,
              }
              console.log("Profile found in AuthProvider:", userWithEmail)
              setUser(userWithEmail)

              // Update debug info
              setAuthDebug((prev) => ({
                ...prev,
                profile: userWithEmail,
              }))

              // Check admin status
              await checkAdminStatus(profile.id, session.user.email || "")
            }
          } catch (error) {
            console.error("Error handling auth in AuthProvider:", error)
            // Set minimal user info from session as fallback
            if (isMounted && session) {
              const fallbackUser = {
                id: session.user.id,
                username: session.user.email?.split("@")[0] || "User",
                avatar_url: null,
                email: session.user.email,
              }
              console.log("Using fallback user info after error in AuthProvider:", fallbackUser)
              setUser(fallbackUser)

              // Update debug info
              setAuthDebug((prev) => ({
                ...prev,
                profileFetchError: error instanceof Error ? error.message : "Unknown error",
                fallbackUser,
              }))
            }
          }
        } else {
          console.log("No session found in AuthProvider, setting user to null")
          setUser(null)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error("Error in fetchUser in AuthProvider:", error)

        // Update debug info
        setAuthDebug((prev) => ({
          ...prev,
          sessionCheckError: error instanceof Error ? error.message : "Unknown error",
        }))
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchUser()

    // Set up auth state listener with error handling
    let subscription: { unsubscribe: () => void } | null = null

    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed in AuthProvider:", event)

        // Update debug info
        setAuthDebug((prev) => ({
          ...prev,
          authEvent: event,
          eventTimestamp: new Date().toISOString(),
          hasSession: !!session,
        }))

        if (!isMounted) return

        if (event === "SIGNED_OUT") {
          console.log("User signed out in AuthProvider")
          setUser(null)
          setIsAdmin(false)
        } else if (session) {
          try {
            console.log("Session found after auth change in AuthProvider, fetching profile")
            // Get user profile
            const { data: profile, error } = await supabase
              .from("profiles")
              .select("id, username, avatar_url")
              .eq("id", session.user.id)
              .single()

            if (!isMounted) return

            if (error) {
              console.error("Error fetching profile after auth change in AuthProvider:", error)
              // Set minimal user info from session
              const fallbackUser = {
                id: session.user.id,
                username: session.user.email?.split("@")[0] || "User",
                avatar_url: null,
                email: session.user.email,
              }
              console.log("Using fallback user info after auth change in AuthProvider:", fallbackUser)
              setUser(fallbackUser)

              // Update debug info
              setAuthDebug((prev) => ({
                ...prev,
                profileErrorAfterEvent: error.message,
                fallbackUserAfterEvent: fallbackUser,
              }))
            } else if (profile) {
              const userWithEmail = {
                ...profile,
                email: session.user.email,
              }
              console.log("Profile found after auth change in AuthProvider:", userWithEmail)
              setUser(userWithEmail)

              // Update debug info
              setAuthDebug((prev) => ({
                ...prev,
                profileAfterEvent: userWithEmail,
              }))

              // Check admin status
              await checkAdminStatus(profile.id, session.user.email || "")
            }
          } catch (error) {
            console.error("Error handling auth change in AuthProvider:", error)
            // Set minimal user info from session as fallback
            if (isMounted && session) {
              const fallbackUser = {
                id: session.user.id,
                username: session.user.email?.split("@")[0] || "User",
                avatar_url: null,
                email: session.user.email,
              }
              console.log("Using fallback user info after auth change error in AuthProvider:", fallbackUser)
              setUser(fallbackUser)

              // Update debug info
              setAuthDebug((prev) => ({
                ...prev,
                profileFetchErrorAfterEvent: error instanceof Error ? error.message : "Unknown error",
                fallbackUserAfterEvent: fallbackUser,
              }))
            }
          }
        }
      })

      subscription = data.subscription
    } catch (error) {
      console.error("Error setting up auth state listener:", error)
      setAuthDebug((prev) => ({
        ...prev,
        authListenerError: error instanceof Error ? error.message : String(error),
      }))
    }

    return () => {
      console.log("AuthProvider unmounting")
      isMounted = false
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch (error) {
          console.error("Error unsubscribing from auth state:", error)
        }
      }
    }
  }, [supabase])

  // Store auth state in localStorage for debugging
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (user) {
          localStorage.setItem(
            "authUser",
            JSON.stringify({
              id: user.id,
              username: user.username,
              email: user.email,
            }),
          )
          localStorage.setItem("authLoading", "false")
          localStorage.setItem("authTimestamp", new Date().toISOString())
        } else {
          localStorage.setItem("authUser", "null")
          localStorage.setItem("authLoading", isLoading.toString())
          localStorage.setItem("authTimestamp", new Date().toISOString())
        }
      } catch (error) {
        console.error("Error storing auth state in localStorage:", error)
      }
    }
  }, [user, isLoading])

  const signOut = async () => {
    console.log("Sign out called from AuthContext")
    try {
      await supabase.auth.signOut()
      console.log("Sign out successful from AuthContext")
      window.location.href = "/auth"
    } catch (error) {
      console.error("Error signing out from AuthContext:", error)
      alert("Error signing out. Please try again.")
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, signOut }}>
      {children}

      {/* Debug info - hidden in production */}
      <div className="hidden">
        <pre>{JSON.stringify(authDebug, null, 2)}</pre>
      </div>
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  return context
}
