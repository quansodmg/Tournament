import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import CreateTeamForm from "@/components/teams/create-team-form"
import { createClient } from "@/lib/supabase/client"

// Mock the createClient function
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}))

// Mock the useRouter hook
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

describe("CreateTeamForm Component", () => {
  const mockUserId = "test-user-id"
  let mockSupabase: any

  beforeEach(() => {
    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: "test-team-id", name: "Test Team" },
          error: null,
        }),
      }),
    }
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it("renders the form correctly", () => {
    render(<CreateTeamForm userId={mockUserId} />)

    expect(screen.getByText("Team Details")).toBeInTheDocument()
    expect(screen.getByText("Create a new team to compete in tournaments")).toBeInTheDocument()
    expect(screen.getByLabelText("Team Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Description")).toBeInTheDocument()
    expect(screen.getByLabelText("Team Logo URL")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Create Team" })).toBeInTheDocument()
  })

  it("handles form submission correctly", async () => {
    const mockInsert = jest.fn().mockReturnThis()
    const mockSelect = jest.fn().mockReturnThis()
    const mockSingle = jest.fn().mockResolvedValue({
      data: { id: "test-team-id", name: "Test Team" },
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    })

    render(<CreateTeamForm userId={mockUserId} />)

    // Fill in the form
    await userEvent.type(screen.getByLabelText("Team Name"), "Test Team")
    await userEvent.type(screen.getByLabelText("Description"), "This is a test team")
    await userEvent.type(screen.getByLabelText("Team Logo URL"), "https://example.com/logo.png")

    // Submit the form
    await userEvent.click(screen.getByRole("button", { name: "Create Team" }))

    // Check if the Supabase client was called correctly
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("teams")
      expect(mockInsert).toHaveBeenCalledWith({
        name: "Test Team",
        description: "This is a test team",
        logo_url: "https://example.com/logo.png",
        created_by: mockUserId,
      })
      expect(mockSelect).toHaveBeenCalled()
      expect(mockSingle).toHaveBeenCalled()
    })
  })

  it("displays error message when team creation fails", async () => {
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Team name already exists" },
      }),
    })

    render(<CreateTeamForm userId={mockUserId} />)

    // Fill in the form
    await userEvent.type(screen.getByLabelText("Team Name"), "Existing Team")
    await userEvent.type(screen.getByLabelText("Description"), "This team name already exists")

    // Submit the form
    await userEvent.click(screen.getByRole("button", { name: "Create Team" }))

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText("Team name already exists")).toBeInTheDocument()
    })
  })
})
