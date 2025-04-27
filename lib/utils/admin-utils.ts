import { createServerClient } from "@/lib/supabase/server"

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createServerClient()

  const { data, error } = await supabase.rpc("is_admin", {
    user_id: userId,
  })

  if (error) {
    console.error("Error checking admin status:", error)
    return false
  }

  return data || false
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const supabase = createServerClient()

  const { data, error } = await supabase.rpc("is_super_admin", {
    user_id: userId,
  })

  if (error) {
    console.error("Error checking super admin status:", error)
    return false
  }

  return data || false
}
