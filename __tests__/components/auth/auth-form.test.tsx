import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AuthForm from "@/components/auth/auth-form"
import { getSupabaseClient } from "@/lib/supabase/client"

// Mock the getSupabaseClient function
jest.mock("@/lib/supabase/client", () => ({
  getSupabaseClient: jest.fn().mockResolvedValue({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: { id: "test-user-id" } }, error: null }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
}))

describe("AuthForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders sign in form by default", async () => {
    render(<AuthForm />)

    // Wait for the component to initialize
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /sign in/i })).toHaveAttribute("aria-selected", "true")
    })

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("switches to sign up form when tab is clicked", async () => {
    render(<AuthForm />)

    // Wait for the component to initialize
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /sign up/i })).toBeInTheDocument()
    })

    // Click the sign up tab
    await userEvent.click(screen.getByRole("tab", { name: /sign up/i }))

    expect(screen.getByRole("tab", { name: /sign up/i })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument()
  })

  it("handles sign in submission", async () => {
    const mockSignIn = jest.fn().mockResolvedValue({ data: {}, error: null })
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        signInWithPassword: mockSignIn,
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }
    ;(getSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

    render(<AuthForm />)

    // Wait for the component to initialize
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    // Fill in the form
    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com")
    await userEvent.type(screen.getByLabelText(/password/i), "password123")

    // Submit the form
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }))

    // Check if signInWithPassword was called with correct arguments
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      })
    })
  })

  it("displays error message when sign in fails", async () => {
    const mockSignIn = jest.fn().mockResolvedValue({
      data: null,
      error: { message: "Invalid login credentials" },
    })

    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        signInWithPassword: mockSignIn,
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }
    ;(getSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

    render(<AuthForm />)

    // Wait for the component to initialize
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    // Fill in the form
    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com")
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpassword")

    // Submit the form
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }))

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText("Invalid login credentials")).toBeInTheDocument()
    })
  })
})
