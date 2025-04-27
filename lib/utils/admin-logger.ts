import { createClient } from "@/lib/supabase/client"

type ActivityType = "user" | "team" | "tournament" | "game" | "match" | "setting" | "system"

interface LogActivityProps {
  adminId: string
  type: ActivityType
  description: string
  entityId?: string
  entityType?: string
  metadata?: Record<string, any>
}

export async function logAdminActivity({
  adminId,
  type,
  description,
  entityId,
  entityType,
  metadata,
}: LogActivityProps) {
  try {
    const supabase = await createClient()

    await supabase.from("admin_activity_log").insert({
      admin_id: adminId,
      type,
      description,
      entity_id: entityId,
      entity_type: entityType,
      metadata,
      ip_address: null, // In a real app, you might get this from the request
    })

    return true
  } catch (error) {
    console.error("Failed to log admin activity:", error)
    return false
  }
}
