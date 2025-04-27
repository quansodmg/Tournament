import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Create a singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null
let lastConnectionAttempt = 0
const CONNECTION_RETRY_DELAY = 10000 // 10 seconds

// Simple in-memory cache for query results
const queryCache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

export function createClient() {
  if (typeof window === "undefined") {
    // Server-side - create a new client each time
    return createClientComponentClient<Database>()
  }

  // Client-side - use singleton pattern with retry logic
  const now = Date.now()

  // If we recently tried to create a client and failed, don't try again too soon
  if (!supabaseClient && now - lastConnectionAttempt < CONNECTION_RETRY_DELAY) {
    console.log("Skipping Supabase client creation - too soon after last attempt")
    throw new Error("Database connection unavailable. Please try again later.")
  }

  if (!supabaseClient) {
    try {
      console.log("Creating new Supabase client instance")
      lastConnectionAttempt = now
      supabaseClient = createClientComponentClient<Database>({
        options: {
          // Add retries for transient network issues
          global: {
            fetch: (url, options) => {
              // Create a controller to handle timeouts
              const controller = new AbortController()
              const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

              return fetch(url, {
                ...options,
                signal: controller.signal,
              }).finally(() => {
                clearTimeout(timeoutId)
              })
            },
          },
        },
      })
    } catch (err) {
      console.error("Error creating Supabase client:", err)
      throw new Error(`Failed to initialize Supabase client: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return supabaseClient
}

// Reset the client (useful for recovery after errors)
export function resetClient() {
  supabaseClient = null
  console.log("Supabase client has been reset")
}

// Add the missing exports that are being referenced elsewhere in the codebase
export const getSupabaseClient = createClient

export function createBrowserClient() {
  return createClient()
}

// Add a function to check if the client is working properly
export async function testSupabaseConnection() {
  try {
    const client = createClient()
    // Removed timeout method
    const { data, error } = await client.from("games").select("count").limit(1)

    if (error) {
      console.error("Supabase connection test failed:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err) {
    console.error("Error testing Supabase connection:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// Add a cached query function to prevent repeated identical queries
export async function cachedQuery(table: string, query: () => Promise<any>, cacheKey?: string) {
  const key = cacheKey || `${table}-default`
  const now = Date.now()

  // Check if we have a valid cached result
  if (queryCache[key] && now - queryCache[key].timestamp < CACHE_TTL) {
    console.log(`Using cached data for ${key}`)
    return queryCache[key].data
  }

  // Otherwise, execute the query and cache the result
  try {
    console.log(`Fetching fresh data for ${key}`)
    const result = await query()

    // Cache the result
    queryCache[key] = {
      data: result,
      timestamp: now,
    }

    return result
  } catch (error) {
    console.error(`Error in cachedQuery for ${key}:`, error)
    throw error
  }
}

// Clear the cache for testing or when needed
export function clearQueryCache() {
  Object.keys(queryCache).forEach((key) => delete queryCache[key])
}
