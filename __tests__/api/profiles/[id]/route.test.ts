import { GET, PATCH } from "@/app/api/profiles/[id]/route"
import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock the createServerClient function
jest.mock("@/lib/supabase", () => ({
  createServerClient: jest.fn(),
}))

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}))

describe("Profile API Routes", () => {
  let mockSupabase: any

  beforeEach(() => {
    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      }),
    }
    ;(createServerClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(NextResponse.json as jest.Mock).mockImplementation((data, options) => ({ data, options }))
  })

  describe("GET", () => {
    it("returns profile data when found", async () => {
      const mockProfileData = { id: "test-user-id", username: "testuser" }
      mockSupabase.from().single.mockResolvedValue({ data: mockProfileData, error: null })

      const request = {} as Request
      const result = await GET(request, { params: { id: "test-user-id" } })

      expect(mockSupabase.from).toHaveBeenCalledWith("profiles")
      expect(mockSupabase.from().select).toHaveBeenCalledWith("*")
      expect(mockSupabase.from().eq).toHaveBeenCalledWith("id", "test-user-id")
      expect(result.data).toEqual(mockProfileData)
    })

    it("returns error when profile not found", async () => {
      mockSupabase.from().single.mockResolvedValue({ data: null, error: { message: "Profile not found" } })

      const request = {} as Request
      const result = await GET(request, { params: { id: "non-existent-id" } })

      expect(result.data).toEqual({ error: "Profile not found" })
      expect(result.options).toEqual({ status: 500 })
    })
  })

  describe("PATCH", () => {
    it("updates profile when user is authorized", async () => {
      // Mock authenticated session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: "test-user-id" } } },
      })

      const mockProfileData = { username: "updated-username" }
      mockSupabase.from().single.mockResolvedValue({ data: mockProfileData, error: null })

      const request = {
        json: jest.fn().mockResolvedValue(mockProfileData),
      } as unknown as Request

      const result = await PATCH(request, { params: { id: "test-user-id" } })

      expect(mockSupabase.from).toHaveBeenCalledWith("profiles")
      expect(mockSupabase.from().update).toHaveBeenCalledWith(mockProfileData)
      expect(mockSupabase.from().eq).toHaveBeenCalledWith("id", "test-user-id")
      expect(result.data).toEqual(mockProfileData)
    })

    it("returns unauthorized when user is not authorized", async () => {
      // Mock authenticated session with different user
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: "different-user-id" } } },
      })

      // Mock admin check
      mockSupabase.from().single.mockResolvedValue({ data: null, error: null })

      const request = {
        json: jest.fn().mockResolvedValue({ username: "hacker" }),
      } as unknown as Request

      const result = await PATCH(request, { params: { id: "test-user-id" } })

      expect(result.data).toEqual({ error: "Unauthorized" })
      expect(result.options).toEqual({ status: 401 })
    })
  })
})
