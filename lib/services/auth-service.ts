import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { authLogger } from "@/lib/utils/auth-logger"
import type { Database } from "@/lib/database.types"

export type AuthProvider = "discord" | "twitch" | "google" | "github"

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignupCredentials {
  email: string
  password: string
  username: string
}

export interface AuthUser {
  id: string
  email?: string
  username?: string
  avatar_url?: string | null
  isAdmin?: boolean
}

class AuthService {
  private supabase = createClientComponentClient<Database>()

  // Initialize the auth service
  constructor() {
    authLogger.info("Auth service initialized")
  }

  // Email/password login
  async login({
    email,
    password,
    rememberMe = false,
  }: LoginCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    authLogger.info("Login attempt", { email, rememberMe })

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Set session expiry based on rememberMe
          expiresIn: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // 30 days or 1 day
        },
      })

      if (error) {
        authLogger.error("Login failed", { error: error.message })
        return { user: null, error: error.message }
      }

      if (!data.user) {
        authLogger.error("Login returned no user")
        return { user: null, error: "No user returned from authentication" }
      }

      authLogger.info("Login successful", { userId: data.user.id })

      // Fetch user profile
      const { data: profile, error: profileError } = await this.supabase
        .from("profiles")
        .select("username, avatar_url, is_admin")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        authLogger.warn("Could not fetch profile after login", { error: profileError.message })
      }

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        username: profile?.username || data.user.email?.split("@")[0] || "User",
        avatar_url: profile?.avatar_url,
        isAdmin: profile?.is_admin || false,
      }

      return { user, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error during login"
      authLogger.error("Login exception", { error: errorMessage })
      return { user: null, error: errorMessage }
    }
  }

  // Social login
  async socialLogin(provider: AuthProvider): Promise<{ error: string | null }> {
    authLogger.info("Social login attempt", { provider })

    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        authLogger.error("Social login failed", { provider, error: error.message })
        return { error: error.message }
      }

      authLogger.info("Social login initiated", { provider })
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error during social login"
      authLogger.error("Social login exception", { provider, error: errorMessage })
      return { error: errorMessage }
    }
  }

  // Sign up
  async signup({
    email,
    password,
    username,
  }: SignupCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    authLogger.info("Signup attempt", { email, username })

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username,
          },
        },
      })

      if (error) {
        authLogger.error("Signup failed", { error: error.message })
        return { user: null, error: error.message }
      }

      if (!data.user) {
        authLogger.error("Signup returned no user")
        return { user: null, error: "No user returned from signup" }
      }

      authLogger.info("Signup successful", { userId: data.user.id })

      // Create profile
      const { error: profileError } = await this.supabase.from("profiles").insert([
        {
          id: data.user.id,
          username: username || email.split("@")[0],
          email: email,
          created_at: new Date().toISOString(),
        },
      ])

      if (profileError) {
        authLogger.error("Profile creation failed", { error: profileError.message })
        return { user: null, error: "Account created but profile setup failed" }
      }

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        username: username || email.split("@")[0],
      }

      return { user, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error during signup"
      authLogger.error("Signup exception", { error: errorMessage })
      return { user: null, error: errorMessage }
    }
  }

  // Logout
  async logout(): Promise<{ error: string | null }> {
    authLogger.info("Logout attempt")

    try {
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        authLogger.error("Logout failed", { error: error.message })
        return { error: error.message }
      }

      authLogger.info("Logout successful")
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error during logout"
      authLogger.error("Logout exception", { error: errorMessage })
      return { error: errorMessage }
    }
  }

  // Get current session
  async getSession() {
    try {
      const { data, error } = await this.supabase.auth.getSession()

      if (error) {
        authLogger.error("Get session failed", { error: error.message })
        return { session: null, error: error.message }
      }

      authLogger.debug("Session retrieved", { hasSession: !!data.session })
      return { session: data.session, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error getting session"
      authLogger.error("Get session exception", { error: errorMessage })
      return { session: null, error: errorMessage }
    }
  }

  // Get current user with profile
  async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    authLogger.debug("Getting current user")

    try {
      const { data, error } = await this.supabase.auth.getUser()

      if (error) {
        authLogger.error("Get user failed", { error: error.message })
        return { user: null, error: error.message }
      }

      if (!data.user) {
        authLogger.debug("No current user found")
        return { user: null, error: null }
      }

      authLogger.debug("User retrieved", { userId: data.user.id })

      // Fetch profile
      const { data: profile, error: profileError } = await this.supabase
        .from("profiles")
        .select("username, avatar_url, is_admin")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        authLogger.warn("Could not fetch profile for current user", { error: profileError.message })
      }

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        username: profile?.username || data.user.email?.split("@")[0] || "User",
        avatar_url: profile?.avatar_url,
        isAdmin: profile?.is_admin || false,
      }

      return { user, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error getting current user"
      authLogger.error("Get current user exception", { error: errorMessage })
      return { user: null, error: errorMessage }
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: string | null }> {
    authLogger.info("Password reset attempt", { email })

    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        authLogger.error("Password reset failed", { error: error.message })
        return { error: error.message }
      }

      authLogger.info("Password reset email sent")
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error during password reset"
      authLogger.error("Password reset exception", { error: errorMessage })
      return { error: errorMessage }
    }
  }

  // Update password
  async updatePassword(password: string): Promise<{ error: string | null }> {
    authLogger.info("Password update attempt")

    try {
      const { error } = await this.supabase.auth.updateUser({ password })

      if (error) {
        authLogger.error("Password update failed", { error: error.message })
        return { error: error.message }
      }

      authLogger.info("Password updated successfully")
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error updating password"
      authLogger.error("Password update exception", { error: errorMessage })
      return { error: errorMessage }
    }
  }

  // Test login (for debugging)
  async testLogin(email: string, password: string): Promise<void> {
    authLogger.info("Test login started", { email })

    try {
      // Step 1: Check if session exists
      authLogger.debug("Step 1: Checking existing session")
      const { session: existingSession, error: sessionError } = await this.getSession()

      if (sessionError) {
        authLogger.warn("Error checking existing session", { error: sessionError })
      } else {
        authLogger.debug("Session check result", { hasSession: !!existingSession })
      }

      // Step 2: Attempt login
      authLogger.debug("Step 2: Attempting login")
      const { user, error: loginError } = await this.login({ email, password })

      if (loginError) {
        authLogger.error("Test login failed", { error: loginError })
        return
      }

      authLogger.info("Test login successful", { userId: user?.id })

      // Step 3: Verify session after login
      authLogger.debug("Step 3: Verifying session after login")
      const { session: newSession, error: newSessionError } = await this.getSession()

      if (newSessionError) {
        authLogger.error("Error verifying session after login", { error: newSessionError })
      } else {
        authLogger.debug("Session after login", {
          hasSession: !!newSession,
          expiresAt: newSession?.expires_at,
        })
      }

      // Step 4: Get user profile
      authLogger.debug("Step 4: Fetching user profile")
      const { user: currentUser, error: userError } = await this.getCurrentUser()

      if (userError) {
        authLogger.error("Error fetching user profile", { error: userError })
      } else {
        authLogger.debug("User profile retrieved", {
          userId: currentUser?.id,
          username: currentUser?.username,
          hasAvatar: !!currentUser?.avatar_url,
          isAdmin: currentUser?.isAdmin,
        })
      }

      authLogger.info("Test login process completed successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error in test login"
      authLogger.error("Test login process failed with exception", { error: errorMessage })
    }
  }
}

// Export a singleton instance
export const authService = new AuthService()
