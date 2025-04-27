import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import type { Cookie } from "@supabase/auth-helpers-nextjs/dist/types"

// For use in getServerSideProps in the pages directory
export const createPagesServerClient = (context: GetServerSidePropsContext) => {
  return createServerComponentClient<Database>({
    cookies: {
      get: (name: string) => {
        return context.req.cookies[name]
      },
      set: (name: string, value: string, options: Cookie) => {
        context.res.setHeader(
          "Set-Cookie",
          `${name}=${value}; Path=${options.path || "/"}; ${options.httpOnly ? "HttpOnly;" : ""} ${options.sameSite ? `SameSite=${options.sameSite};` : ""} ${options.maxAge ? `Max-Age=${options.maxAge};` : ""} ${options.secure ? "Secure;" : ""}`,
        )
      },
      remove: (name: string, options: Cookie) => {
        context.res.setHeader("Set-Cookie", `${name}=; Path=${options.path || "/"}; HttpOnly; SameSite=Lax; Max-Age=0`)
      },
    },
  })
}

// For use in API routes in the pages directory
export const createPagesApiClient = (req: NextApiRequest, res: NextApiResponse) => {
  return createServerComponentClient<Database>({
    cookies: {
      get: (name: string) => {
        return req.cookies[name]
      },
      set: (name: string, value: string, options: Cookie) => {
        res.setHeader(
          "Set-Cookie",
          `${name}=${value}; Path=${options.path || "/"}; ${options.httpOnly ? "HttpOnly;" : ""} ${options.sameSite ? `SameSite=${options.sameSite};` : ""} ${options.maxAge ? `Max-Age=${options.maxAge};` : ""} ${options.secure ? "Secure;" : ""}`,
        )
      },
      remove: (name: string, options: Cookie) => {
        res.setHeader("Set-Cookie", `${name}=; Path=${options.path || "/"}; HttpOnly; SameSite=Lax; Max-Age=0`)
      },
    },
  })
}
