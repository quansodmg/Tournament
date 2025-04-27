import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
  getUnreadNotificationsCount,
  createServerNotification,
} from "@/lib/utils/notifications"
import { createClient } from "@/lib/supabase/client"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock the createClient function
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}))

// Mock uuid
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid"),
}))

describe("Notification Utilities", () => {
  let mockSupabase: any

  beforeEach(() => {
    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        count: jest.fn().mockResolvedValue({ count: 5, error: null }),
      }),
    }
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe("markAllNotificationsAsRead", () => {
    it("marks all notifications as read", async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from().update = mockUpdate

      const result = await markAllNotificationsAsRead("test-user-id")

      expect(mockSupabase.from).toHaveBeenCalledWith("notifications")
      expect(mockUpdate).toHaveBeenCalledWith({ is_read: true })
      expect(mockSupabase.from().eq).toHaveBeenCalledWith("profile_id", "test-user-id")
      expect(mockSupabase.from().eq).toHaveBeenCalledWith("is_read", false)
      expect(result).toEqual({ success: true })
    })

    it("throws an error when update fails", async () => {
      mockSupabase.from().update = jest.fn().mockResolvedValue({ error: new Error("Update failed") })

      await expect(markAllNotificationsAsRead("test-user-id")).rejects.toThrow("Update failed")
    })
  })

  describe("markNotificationAsRead", () => {
    it("marks a notification as read", async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from().update = mockUpdate

      const result = await markNotificationAsRead("test-notification-id")

      expect(mockSupabase.from).toHaveBeenCalledWith("notifications")
      expect(mockUpdate).toHaveBeenCalledWith({ is_read: true })
      expect(mockSupabase.from().eq).toHaveBeenCalledWith("id", "test-notification-id")
      expect(result).toEqual({ success: true })
    })
  })

  describe("deleteNotification", () => {
    it("deletes a notification", async () => {
      const mockDelete = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from().delete = mockDelete

      const result = await deleteNotification("test-notification-id")

      expect(mockSupabase.from).toHaveBeenCalledWith("notifications")
      expect(mockDelete).toHaveBeenCalled()
      expect(mockSupabase.from().eq).toHaveBeenCalledWith("id", "test-notification-id")
      expect(result).toEqual({ success: true })
    })
  })

  describe("getUnreadNotificationsCount", () => {
    it("returns the count of unread notifications", async () => {
      const result = await getUnreadNotificationsCount("test-user-id")

      expect(mockSupabase.from).toHaveBeenCalledWith("notifications")
      expect(mockSupabase.from().select).toHaveBeenCalledWith("*", { count: "exact", head: true })
      expect(mockSupabase.from().eq).toHaveBeenCalledWith("profile_id", "test-user-id")
      expect(mockSupabase.from().eq).toHaveBeenCalledWith("is_read", false)
      expect(result).toBe(5)
    })
  })

  describe("createServerNotification", () => {
    it("creates a server notification", async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from().insert = mockInsert

      const notificationData = {
        profileId: "test-user-id",
        title: "Test Notification",
        message: "This is a test notification",
        type: "test",
        referenceId: "test-ref-id",
        referenceType: "test-ref-type",
        actionUrl: "/test",
      }

      const result = await createServerNotification(notificationData)

      expect(mockSupabase.from).toHaveBeenCalledWith("notifications")
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "test-uuid",
          profile_id: "test-user-id",
          title: "Test Notification",
          message: "This is a test notification",
          type: "test",
          reference_id: "test-ref-id",
          reference_type: "test-ref-type",
          action_url: "/test",
          is_read: false,
        }),
      )
      expect(result.success).toBe(true)
    })
  })
})
