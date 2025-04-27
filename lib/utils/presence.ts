import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Store online status in memory since we can't store it in the database
const onlineUsers = new Set<string>()

export async function updatePresence(supabase = createClientComponentClient<Database>()) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    // Instead of updating the database, just store the status in memory
    onlineUsers.add(user.id)

    // Log the status change
    console.log(`User ${user.id} is now online`)

    return true
  } catch (error) {
    console.error("Error in updatePresence:", error)
    return false
  }
}

export async function setOfflineStatus(supabase = createClientComponentClient<Database>()) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    // Remove from the online users set
    onlineUsers.delete(user.id)

    // Log the status change
    console.log(`User ${user.id} is now offline`)

    return true
  } catch (error) {
    console.error("Error in setOfflineStatus:", error)
    return false
  }
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId)
}

export function setupPresenceTracking() {
  const supabase = createClientComponentClient<Database>()

  // Update presence immediately
  updatePresence(supabase)

  // Set up interval to update presence every minute
  const interval = setInterval(() => {
    updatePresence(supabase)
  }, 60000)

  // Set up event listeners for page visibility changes
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      updatePresence(supabase)
    } else {
      setOfflineStatus(supabase)
    }
  }

  document.addEventListener("visibilitychange", handleVisibilityChange)

  // Set up event listener for before unload
  const handleBeforeUnload = () => {
    setOfflineStatus(supabase)
  }

  window.addEventListener("beforeunload", handleBeforeUnload)

  // Return cleanup function
  return () => {
    clearInterval(interval)
    document.removeEventListener("visibilitychange", handleVisibilityChange)
    window.removeEventListener("beforeunload", handleBeforeUnload)
    setOfflineStatus(supabase)
  }
}
