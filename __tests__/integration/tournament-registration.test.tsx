import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import TournamentRegistration from "@/components/tournaments/tournament-registration"
import { createClient } from "@/lib/supabase/client"

// Mock the createClient function
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}))

// Mock the useRouter hook
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    refresh: jest.fn(),
  })),
}))

describe("TournamentRegistration Integration", () => {
  const mockUserId = "test-user-id"
  const mockTournament = {
    id: "test-tournament-id",
    name: "Test Tournament",
    team_size: 5,
  }

  let mockSupabase: any

  beforeEach(() => {
    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
      }),
    }
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it("loads user teams and allows individual registration", async () => {
    // Mock team data
    mockSupabase.from().select.mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [
          {
            team: {
              id: "team-1",
              name: "Team Alpha",
              team_members: [{ count: 5 }],
            },
          },
        ],
        error: null,
      }),
    })

    // Mock registration
    mockSupabase.from().insert.mockResolvedValue({ error: null })

    render(<TournamentRegistration tournament={mockTournament} userId={mockUserId} />)

    // Wait for teams to load
    await waitFor(() => {
      expect(screen.getByLabelText(/register as individual/i)).toBeInTheDocument()
    })

    // Select individual registration
    await userEvent.click(screen.getByLabelText(/register as individual/i))

    // Submit registration
    await userEvent.click(screen.getByRole("button", { name: /register for tournament/i }))

    // Check if registration was submitted correctly
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("tournament_registrations")
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        tournament_id: mockTournament.id,
        profile_id: mockUserId,
      })
    })
  })

  it("allows team registration when teams are available", async () => {
    // Mock team data
    mockSupabase.from().select.mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [
          {
            team: {
              id: "team-1",
              name: "Team Alpha",
              team_members: [{ count: 5 }],
            },
          },
          {
            team: {
              id: "team-2",
              name: "Team Beta",
              team_members: [{ count: 6 }],
            },
          },
        ],
        error: null,
      }),
    })

    // Mock registration
    mockSupabase.from().insert.mockResolvedValue({ error: null })

    render(<TournamentRegistration tournament={mockTournament} userId={mockUserId} />)

    // Wait for teams to load
    await waitFor(() => {
      expect(screen.getByLabelText(/register with team/i)).toBeInTheDocument()
    })

    // Select team registration
    await userEvent.click(screen.getByLabelText(/register with team/i))

    // Select a team
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.click(screen.getByRole("option", { name: /team beta/i }))

    // Submit registration
    await userEvent.click(screen.getByRole("button", { name: /register for tournament/i }))

    // Check if registration was submitted correctly
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("tournament_registrations")
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        tournament_id: mockTournament.id,
        team_id: "team-2",
      })
    })
  })

  it("shows error message when registration fails", async () => {
    // Mock team data
    mockSupabase.from().select.mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    })

    // Mock registration failure
    mockSupabase.from().insert.mockResolvedValue({
      error: { message: "You are already registered for this tournament" },
    })

    render(<TournamentRegistration tournament={mockTournament} userId={mockUserId} />)

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByLabelText(/register as individual/i)).toBeInTheDocument()
    })

    // Submit registration
    await userEvent.click(screen.getByRole("button", { name: /register for tournament/i }))

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText("You are already registered for this tournament")).toBeInTheDocument()
    })
  })
})
