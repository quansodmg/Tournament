import { createClient } from "@/lib/supabase/client"
import { createServerClient } from "@/lib/supabase/server"
import { createMiddlewareClient } from "@/lib/supabase/middleware-client"

// Only export the client creation functions
export { createClient, createServerClient, createMiddlewareClient }

// Remove the re-export from utils to prevent circular dependencies
// export * from "@/lib/supabase/utils"
