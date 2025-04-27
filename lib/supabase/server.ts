// This file is for server components only
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { cookies } from "next/headers"

/**
 * Creates a Supabase client for server components
 * @returns A Supabase client instance
 */
export function createServerClient() {
  try {
    const cookieStore = cookies()
    return createServerComponentClient<Database>({
      cookies: () => cookieStore,
      options: {
        global: {
          fetch: (url, options) => {
            return fetch(url, {
              ...options,
              // Increase timeout for potentially slow connections
              signal: AbortSignal.timeout(15000), // 15 seconds timeout
            })
          },
        },
      },
    })
  } catch (error) {
    console.error("Error creating server client:", error)
    throw new Error("Failed to initialize database connection")
  }
}

/**
 * Legacy alias for createServerClient
 * @deprecated Use createServerClient instead
 */
export const createServerSupabase = createServerClient

// Export with multiple names for backward compatibility
export { createServerClient as getSupabaseServer }
export { createServerClient as createClient }
