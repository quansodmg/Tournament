import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("profile_id", userId)
    .eq("is_read", false)

  if (error) {
    console.error("Error marking notifications as read:", error)
    throw error
  }

  return { success: true }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

  if (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }

  return { success: true }
}

export async function deleteNotification(notificationId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("notifications").delete().eq("id", notificationId)

  if (error) {
    console.error("Error deleting notification:", error)
    throw error
  }

  return { success: true }
}

export async function getUnreadNotificationsCount(userId: string) {
  const supabase = createClient()

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", userId)
    .eq("is_read", false)

  if (error) {
    console.error("Error getting unread notifications count:", error)
    throw error
  }

  return count || 0
}

export async function createServerNotification({
  profileId,
  title,
  message,
  type,
  referenceId,
  referenceType,
  actionUrl,
}: {
  profileId: string
  title: string
  message: string
  type: string
  referenceId: string
  referenceType: string
  actionUrl: string
}) {
  const supabase = createClient()

  const notification = {
    id: uuidv4(),
    profile_id: profileId,
    title,
    message,
    type,
    reference_id: referenceId,
    reference_type: referenceType,
    action_url: actionUrl,
    is_read: false,
    created_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("notifications").insert(notification)

  if (error) {
    console.error("Error creating notification:", error)
    throw error
  }

  return { success: true, notification }
}

export async function createTeamNotification({
  teamId,
  title,
  message,
  type,
  referenceId,
  referenceType,
  actionUrl,
  excludeProfileId,
}: {
  teamId: string
  title: string
  message: string
  type: string
  referenceId: string
  referenceType: string
  actionUrl: string
  excludeProfileId?: string
}) {
  const supabase = createClient()

  // Get all team members
  let query = supabase.from("team_members").select("profile_id").eq("team_id", teamId)

  // Exclude a specific profile if provided
  if (excludeProfileId) {
    query = query.neq("profile_id", excludeProfileId)
  }

  const { data: members, error: membersError } = await query

  if (membersError) {
    console.error("Error fetching team members:", membersError)
    throw membersError
  }

  // Create notifications for each team member
  const notifications = members.map((member) => ({
    id: uuidv4(),
    profile_id: member.profile_id,
    title,
    message,
    type,
    reference_id: referenceId,
    reference_type: referenceType,
    action_url: actionUrl,
    is_read: false,
    created_at: new Date().toISOString(),
  }))

  if (notifications.length > 0) {
    const { error } = await supabase.from("notifications").insert(notifications)

    if (error) {
      console.error("Error creating team notifications:", error)
      throw error
    }
  }

  return { success: true, count: notifications.length }
}
