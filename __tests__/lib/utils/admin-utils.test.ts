import { isAdmin, isSuperAdmin } from "@/lib/utils/admin-utils"
import { createServerClient } from "@/lib/supabase/server"
import { describe, beforeEach, it, jest, expect } from "@jest/globals"

// Mock the createServerClient function
jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(),
}))

describe("Admin Utilities", () => {
  let mockSupabase: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
  })

  describe("isAdmin", () => {
    it("returns true when user is an admin", async () => {
      // Setup mock Supabase client
      mockSupabase = {
        rpc: jest.fn().mockResolvedValue({ data: true, error: null }),
      }
      ;(createServerClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await isAdmin("admin-user-id")

      expect(mockSupabase.rpc).toHaveBeenCalledWith("is_admin", {
        user_id: "admin-user-id",
      })
      expect(result).toBe(true)
    })

    it("returns false when user is not an admin", async () => {
      // Setup mock Supabase client
      mockSupabase = {
        rpc: jest.fn().mockResolvedValue({ data: false, error: null }),
      }
      ;(createServerClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await isAdmin("regular-user-id")

      expect(result).toBe(false)
    })

    it("returns false when there is an error", async () => {
      // Setup mock Supabase client
      mockSupabase = {
        rpc: jest.fn().mockResolvedValue({ data: null, error: new Error("Database error") }),
      }
      ;(createServerClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await isAdmin("user-id")

      expect(result).toBe(false)
    })
  })

  describe("isSuperAdmin", () => {
    it("returns true when user is a super admin", async () => {
      // Setup mock Supabase client
      mockSupabase = {
        rpc: jest.fn().mockResolvedValue({ data: true, error: null }),
      }
      ;(createServerClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await isSuperAdmin("super-admin-user-id")

      expect(mockSupabase.rpc).toHaveBeenCalledWith("is_super_admin", {
        user_id: "super-admin-user-id",
      })
      expect(result).toBe(true)
    })

    it("returns false when user is not a super admin", async () => {
      // Setup mock Supabase client
      mockSupabase = {
        rpc: jest.fn().mockResolvedValue({ data: false, error: null }),
      }
      ;(createServerClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await isSuperAdmin("regular-admin-id")

      expect(result).toBe(false)
    })
  })
})
