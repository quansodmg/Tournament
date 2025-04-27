// This file can be safely imported anywhere (App Router or Pages Router)
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

export const createSafeClient = () => {
  return createClientComponentClient<Database>()
}
