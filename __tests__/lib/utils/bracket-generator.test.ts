import { generateTournamentBracket } from "@/lib/utils/bracket-generator"
import { createClient } from "@/lib/supabase/client"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock the createClient function
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}))

describe("Bracket Generator", () => {
  let mockSupabase: any

  beforeEach(() => {
    // Setup mock Supabase client with chained methods
    const mockSingle = jest.fn().mockResolvedValue({ data: { id: "match-id" }, error: null })
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = jest.fn().mockReturnValue({ select: mockSelect })

    mockSupabase = {
      from: jest.fn().mockReturnValue({
        insert: mockInsert,
        update: jest.fn().mockResolvedValue({ error: null }),
        select: mockSelect,
      }),
    }
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it("generates a single elimination bracket correctly", async () => {
    const options = {
      tournamentId: "test-tournament",
      participantIds: ["team1", "team2", "team3", "team4"],
      isTeamTournament: true,
      bracketType: "single_elimination" as const,
    }

    const result = await generateTournamentBracket(options)

    expect(result.success).toBe(true)
    expect(mockSupabase.from).toHaveBeenCalledWith("matches")
    expect(mockSupabase.from).toHaveBeenCalledWith("match_participants")
    expect(mockSupabase.from).toHaveBeenCalledWith("tournaments")
  })

  it("handles byes correctly when participant count is not a power of 2", async () => {
    const options = {
      tournamentId: "test-tournament",
      participantIds: ["team1", "team2", "team3"], // Only 3 teams
      isTeamTournament: true,
      bracketType: "single_elimination" as const,
    }

    const result = await generateTournamentBracket(options)

    expect(result.success).toBe(true)
    // Should still create a bracket for 4 participants (with one bye)
    expect(mockSupabase.from).toHaveBeenCalledWith("matches")
  })

  it("returns error when bracket generation fails", async () => {
    // Mock an error in the database operation
    mockSupabase.from().insert.mockImplementation(() => {
      throw new Error("Database error")
    })

    const options = {
      tournamentId: "test-tournament",
      participantIds: ["team1", "team2"],
      isTeamTournament: true,
      bracketType: "single_elimination" as const,
    }

    const result = await generateTournamentBracket(options)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
