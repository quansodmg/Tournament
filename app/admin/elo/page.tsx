import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminEloManager from "@/components/admin/elo/admin-elo-manager"

export const metadata = {
  title: "ELO Rating Management | Admin",
  description: "Manage ELO ratings for players and teams",
}

export default async function AdminEloPage() {
  const supabase = await createServerClient()

  // Check if user is authenticated and is an admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth?next=/admin/elo")
  }

  // Check if user is admin
  const { data: isAdmin } = await supabase.rpc("is_admin", {
    user_id: session.user.id,
  })

  if (!isAdmin) {
    redirect("/")
  }

  // Get games for filtering
  const { data: games } = await supabase.from("games").select("id, name, logo_url").order("name")

  // Get ELO stats
  const { data: stats } = await supabase.rpc("get_elo_stats")

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">ELO Rating Management</h1>

      <AdminEloManager games={games || []} stats={stats || {}} />
    </div>
  )
}
