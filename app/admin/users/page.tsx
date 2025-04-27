// Add these lines at the top of the file to prevent static rendering
export const dynamic = "force-dynamic"
export const revalidate = 0 // Disable cache completely

import { createServerClient } from "@/lib/supabase/server"
import UserList from "@/components/admin/user-list"

export default async function AdminUsersPage() {
  try {
    // Properly await the Supabase client creation
    const supabase = await createServerClient()

    if (!supabase || typeof supabase.from !== "function") {
      throw new Error("Invalid Supabase client: 'from' method is not available")
    }

    // Get all users with error handling
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (usersError) {
      console.error("Error fetching users:", usersError)
      throw new Error("Failed to fetch users")
    }

    // Get admin status for each user
    const { data: admins, error: adminsError } = await supabase.from("admins").select("id, is_super_admin")

    if (adminsError) {
      console.error("Error fetching admins:", adminsError)
      // Continue without admin data
    }

    // Merge admin status with user data
    const usersWithAdminStatus = (users || []).map((user) => {
      const adminData = admins?.find((admin) => admin.id === user.id)
      return {
        ...user,
        isAdmin: !!adminData,
        isSuperAdmin: adminData?.is_super_admin || false,
      }
    })

    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">User Management</h1>
        <UserList users={usersWithAdminStatus} currentPage={1} totalPages={1} />
      </div>
    )
  } catch (error) {
    console.error("Error in AdminUsersPage:", error)
    throw error // This will be caught by the error boundary
  }
}
