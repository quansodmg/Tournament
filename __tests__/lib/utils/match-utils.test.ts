import { createMatchWithInvitation, handleMatchForfeit } from "@/lib/utils/match-utils"
import { createServerClient } from "@/lib/supabase/server"
import { addMinutes } from "date-fns"
import { expect, describe, it, jest, beforeEach, afterEach } from "@jest/globals"

// Mock the createServerClient function
jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(),
}))

// Mock date-fns
jest.mock("date-fns", () => ({
  addMinutes: jest.fn((date, minutes) => new Date(date.getTime() + minutes * 60000).toISOString()),
}))

describe("Match Utilities", () => {
  let mockSupabase: any

  beforeEach(() => {
    // Setup mock date
    jest.useFakeTimers().setSystemTime(new Date("2023-01-01T12:00:00Z"))

    // Setup mock Supabase client
    const mockSingle = jest.fn().mockResolvedValue({
      data: { id: "match-id", status: "scheduled" },
      error: null,
    })

    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })

    mockSupabase = {
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({ select: mockSelect }),
        update: jest.fn().mockResolvedValue({ error: null }),
        select: jest
          .fn()
          .mockReturnValue({ eq: jest.fn().mockResolvedValue({ data: { acceptance_status: {} }, error: null }) }),
        eq: jest.fn().mockReturnThis(),
      }),
    }
    ;(createServerClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe("createMatchWithInvitation", () => {
    it("creates a match with invitation successfully", async () => {
      const schedulerId = "scheduler-id"
      const teamId = "team-id"
      const opponentTeamId = "opponent-team-id"
      const matchDetails = {
        startTime: "2023-01-10T15:00:00Z",
        gameId: "game-id",
        matchType: "ranked",
        location: "online",
        isPrivate: false,
        streamUrl: "https://twitch.tv/test",
        matchNotes: "Test match",
      }

      const result = await createMatchWithInvitation(schedulerId, teamId, opponentTeamId, matchDetails)

      expect(result.success).toBe(true)
      expect(result.matchId).toBe("match-id")

      // Check match creation
      expect(mockSupabase.from).toHaveBeenCalledWith("matches")
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        scheduled_by: schedulerId,
        start_time: matchDetails.startTime,
        status: "scheduled",
        location: matchDetails.location,
        match_type: matchDetails.matchType,
        is_private: matchDetails.isPrivate,
        stream_url: matchDetails.streamUrl,
        match_notes: matchDetails.matchNotes,
        acceptance_status: {},
      })

      // Check participant addition
      expect(mockSupabase.from).toHaveBeenCalledWith("match_participants")
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        match_id: "match-id",
        team_id: teamId,
      })

      // Check invitation creation
      expect(mockSupabase.from).toHaveBeenCalledWith("match_invitations")
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        match_id: "match-id",
        team_id: opponentTeamId,
        invited_by: schedulerId,
        acceptance_deadline: addMinutes(new Date(), 15),
      })

      // Check system message
      expect(mockSupabase.from).toHaveBeenCalledWith("match_chats")
    })

    it("returns error when match creation fails", async () => {
      // Mock an error in the database operation
      mockSupabase.from().insert.mockImplementation(() => {
        throw new Error("Database error")
      })

      const result = await createMatchWithInvitation("scheduler-id", "team-id", "opponent-team-id", {
        startTime: "2023-01-10T15:00:00Z",
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe("handleMatchForfeit", () => {
    it("updates match status and adds system message on forfeit", async () => {
      const matchId = "match-id"
      const teamId = "team-id"

      const result = await handleMatchForfeit(matchId, teamId)

      expect(result.success).toBe(true)

      // Check match status update
      expect(mockSupabase.from).toHaveBeenCalledWith("matches")
      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        acceptance_status: { [teamId]: "forfeited" },
      })
      expect(mockSupabase.from().eq).toHaveBeenCalledWith("id", matchId)

      // Check system message
      expect(mockSupabase.from).toHaveBeenCalledWith("match_chats")
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        match_id: matchId,
        profile_id: "00000000-0000-0000-0000-000000000000",
        message: "Team has forfeited the match.",
        is_system: true,
      })
    })
  })
})
