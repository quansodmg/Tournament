import { getSupabaseClient } from "./client"

/**
 * Debug utility to check the Supabase client
 * This can be used to diagnose issues with the Supabase client
 */
export async function debugSupabaseClient() {
  try {
    console.group("Supabase Client Debug")

    // Get the client
    const client = await getSupabaseClient()

    // Check if client exists
    console.log("Client exists:", !!client)

    // Check client type
    console.log("Client type:", typeof client)

    // Check if client has auth
    console.log("Has auth:", !!client?.auth)

    // Check if client has from
    console.log("Has from:", typeof client?.from === "function")

    // Check if client has storage
    console.log("Has storage:", !!client?.storage)

    // Check if client has rpc
    console.log("Has rpc:", typeof client?.rpc === "function")

    // List available methods
    console.log("Available methods:", Object.keys(client || {}))

    console.groupEnd()

    return {
      success: true,
      hasClient: !!client,
      hasAuth: !!client?.auth,
      hasFrom: typeof client?.from === "function",
      hasStorage: !!client?.storage,
      hasRpc: typeof client?.rpc === "function",
    }
  } catch (error) {
    console.error("Error debugging Supabase client:", error)
    return {
      success: false,
      error,
    }
  }
}
