"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { LogOut, Settings, User, Shield, Bell, Users, Mail } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import type { Database } from "@/lib/database.types"

type Profile = {
  id: string
  username: string
  avatar_url: string | null
  email?: string
}

// Add this to the navigation items in the site header
const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Games", href: "/games" },
  { name: "Tournaments", href: "/tournaments" },
  { name: "Teams", href: "/teams" },
  { name: "Matches", href: "/matches" },
  { name: "Leaderboard", href: "/leaderboard" }, // Add this new navigation item
]

export function SiteHeader() {
  const pathname = usePathname()
  const [user, setUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [onlineFriendsCount, setOnlineFriendsCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasInvitations, setHasInvitations] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  // Check for team invitations
  const checkTeamInvitations = async (userId: string) => {
    try {
      const { data: invitations, error } = await supabase
        .from("team_invitations")
        .select("id")
        .eq("profile_id", userId)
        .eq("status", "pending")
        .limit(1)

      if (!error && invitations && invitations.length > 0) {
        setHasInvitations(true)
      } else {
        setHasInvitations(false)
      }
    } catch (error) {
      console.error("Error checking team invitations:", error)
    }
  }

  // Check if user is admin
  const checkAdminStatus = async (userId: string, userEmail: string) => {
    try {
      // Special case for your email
      if (userEmail === "quanstewart@hotmail.com") {
        setIsAdmin(true)
        return
      }

      const { data, error } = await supabase.rpc("is_admin", {
        user_id: userId,
      })

      if (error) {
        setIsAdmin(userEmail === "quanstewart@hotmail.com")
        return
      }

      setIsAdmin(data || userEmail === "quanstewart@hotmail.com")
    } catch (error) {
      setIsAdmin(userEmail === "quanstewart@hotmail.com")
    }
  }

  // Set up auth state listener
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setAuthError(null)
        // Get session with error handling
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setAuthError(error.message)
          setIsLoading(false)
          setUser(null)
          return
        }

        const { session } = data

        if (session) {
          try {
            // Get user profile
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("id, username, avatar_url")
              .eq("id", session.user.id)
              .single()

            if (profileError) {
              const fallbackUser = {
                id: session.user.id,
                username: session.user.email?.split("@")[0] || "User",
                avatar_url: null,
                email: session.user.email,
              }
              setUser(fallbackUser)
            } else if (profile) {
              const userWithEmail = {
                ...profile,
                email: session.user.email,
              }
              setUser(userWithEmail)

              // Check admin status
              await checkAdminStatus(profile.id, session.user.email || "")

              // Check team invitations
              await checkTeamInvitations(profile.id)
            }
          } catch (profileError) {
            console.error("Error fetching profile:", profileError)
            // Fallback to basic user info
            if (session?.user) {
              setUser({
                id: session.user.id,
                username: session.user.email?.split("@")[0] || "User",
                avatar_url: null,
                email: session.user.email,
              })
            }
          }
        } else {
          setUser(null)
          setIsAdmin(false)
          setHasInvitations(false)
        }
      } catch (error) {
        console.error("Error in fetchUserData:", error)
        setAuthError(error instanceof Error ? error.message : "Unknown authentication error")
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()

    // Set up auth state listener with error handling
    let subscription: { unsubscribe: () => void } | null = null

    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          setAuthError(null)

          if (session) {
            try {
              // Get user profile
              const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("id, username, avatar_url")
                .eq("id", session.user.id)
                .single()

              if (profileError) {
                const fallbackUser = {
                  id: session.user.id,
                  username: session.user.email?.split("@")[0] || "User",
                  avatar_url: null,
                  email: session.user.email,
                }
                setUser(fallbackUser)
              } else if (profile) {
                const userWithEmail = {
                  ...profile,
                  email: session.user.email,
                }
                setUser(userWithEmail)

                // Check admin status
                await checkAdminStatus(profile.id, session.user.email || "")

                // Check team invitations
                await checkTeamInvitations(profile.id)
              }
            } catch (profileError) {
              console.error("Error fetching profile on auth change:", profileError)
              // Fallback to basic user info
              if (session?.user) {
                setUser({
                  id: session.user.id,
                  username: session.user.email?.split("@")[0] || "User",
                  avatar_url: null,
                  email: session.user.email,
                })
              }
            }
          } else {
            setUser(null)
            setIsAdmin(false)
            setHasInvitations(false)
          }
        } catch (error) {
          console.error("Error in auth state change handler:", error)
          setAuthError(error instanceof Error ? error.message : "Unknown authentication error")
        }
      })

      subscription = data.subscription
    } catch (error) {
      console.error("Error setting up auth state listener:", error)
      setAuthError(error instanceof Error ? error.message : "Unknown authentication error")
    }

    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch (error) {
          console.error("Error unsubscribing from auth state:", error)
        }
      }
    }
  }, [supabase])

  // Fetch online friends count when user changes
  useEffect(() => {
    if (user) {
      const fetchOnlineFriendsCount = async () => {
        try {
          // Get all accepted friendships for the current user
          const { data: friendships, error: friendshipsError } = await supabase
            .from("friendships")
            .select("sender_id, receiver_id")
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .eq("status", "accepted")

          if (friendshipsError) {
            setOnlineFriendsCount(0)
            return
          }

          if (!friendships || friendships.length === 0) {
            setOnlineFriendsCount(0)
            return
          }

          // Extract friend IDs
          const friendIds = friendships.map((friendship) =>
            friendship.sender_id === user.id ? friendship.receiver_id : friendship.sender_id,
          )

          // Count online friends
          const { count, error: countError } = await supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .in("id", friendIds)
            .eq("online_status", "online")

          if (!countError && count !== null) {
            setOnlineFriendsCount(count)
          } else {
            setOnlineFriendsCount(0)
          }
        } catch (error) {
          setOnlineFriendsCount(0)
        }
      }

      fetchOnlineFriendsCount()
    }
  }, [user, supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = "/auth"
    } catch (error) {
      alert("Error signing out. Please try again.")
    }
  }

  // Function to get initials from username
  const getInitials = (username: string) => {
    return username ? username.substring(0, 2).toUpperCase() : "U"
  }

  // Function to handle auth errors
  const handleAuthRetry = () => {
    setAuthError(null)
    setIsLoading(true)
    window.location.reload()
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#101113] border-b border-[#1e2023]">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-[#0bb5ff]">EsportsHub</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-[#0bb5ff] ${
                  pathname?.startsWith(item.href) ? "text-[#0bb5ff]" : "text-gray-400"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {authError ? (
            // Show auth error with retry button
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-400">Auth error</span>
              <Button variant="outline" size="sm" onClick={handleAuthRetry}>
                Retry
              </Button>
            </div>
          ) : isLoading ? (
            // Show loading state
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0bb5ff] border-t-transparent"></div>
              <span className="text-sm text-gray-400">Loading...</span>
            </div>
          ) : user ? (
            <>
              <Link
                href="/friends"
                className={`text-sm font-medium transition-colors hover:text-[#0bb5ff] ${
                  pathname?.startsWith("/friends") ? "text-[#0bb5ff]" : "text-gray-400"
                }`}
              >
                Friends ({onlineFriendsCount} online)
              </Link>
              <NotificationsDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      {user.avatar_url ? (
                        <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
                      ) : (
                        <AvatarFallback className="bg-[#1e2023] text-[#0bb5ff]">
                          {getInitials(user.username)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {hasInvitations && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#101113] border-[#1e2023]" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-300">{user.username}</p>
                      <p className="text-xs leading-none text-gray-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#1e2023]" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="text-gray-300">
                      <User className="mr-2 h-4 w-4" />
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-gray-300">
                      <Users className="mr-2 h-4 w-4" />
                      <Link href="/invitations">Team Invitations</Link>
                      {hasInvitations && <span className="ml-auto h-2 w-2 rounded-full bg-red-500" />}
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-gray-300">
                      <Bell className="mr-2 h-4 w-4" />
                      <Link href="/notifications">Notifications</Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-gray-300">
                      <Mail className="mr-2 h-4 w-4" />
                      <Link href="/messages">Messages</Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-gray-300">
                      <Settings className="mr-2 h-4 w-4" />
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>

                    {isAdmin && (
                      <DropdownMenuItem className="text-gray-300">
                        <Shield className="mr-2 h-4 w-4" />
                        <Link href="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-[#1e2023]" />
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500 focus:bg-[#1e2023]"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
