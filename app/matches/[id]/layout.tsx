import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import FriendsSidebar from "@/components/friends/friends-sidebar"

export default async function MatchLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto">{children}</main>
          <FriendsSidebar />
        </div>
      </div>
    </div>
  )
}
