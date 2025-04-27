import type { Database } from "@/lib/database.types"
import { formatDistanceToNow } from "date-fns"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export default function RecentUsersTable({ users }: { users: Profile[] }) {
  return (
    <div className="overflow-x-auto text-black">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-2">Username</th>
            <th className="text-left py-3 px-2">Full Name</th>
            <th className="text-left py-3 px-2">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-4 text-center text-muted-foreground">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2">{user.username}</td>
                <td className="py-3 px-2">{user.full_name || "—"}</td>
                <td className="py-3 px-2">{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
