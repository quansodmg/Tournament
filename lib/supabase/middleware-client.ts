import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import type { NextRequest, NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

/**
 * Creates a Supabase client for middleware
 * @param req - Next.js request object
 * @param res - Next.js response object
 * @returns A Supabase client instance
 */
export const createMiddlewareSupabase = (req: NextRequest, res: NextResponse) => {
  try {
    const supabase = createMiddlewareClient<Database>({
      req,
      res,
      options: {
        // Add retries for transient network issues
        global: {
          fetch: (url, options) => {
            return fetch(url, {
              ...options,
              // Increase timeout for potentially slow connections
              signal: AbortSignal.timeout(15000), // 15 seconds timeout
            })
          },
        },
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storageKey: "esportshub-auth-token",
          flowType: "pkce",
        },
      },
    })

    return supabase
  } catch (error) {
    console.error("Error creating middleware Supabase client:", error)
    throw error
  }
}

// Export with multiple names for backward compatibility
export { createMiddlewareSupabase as getSupabaseMiddleware }
export { createMiddlewareSupabase as createMiddlewareClient }
