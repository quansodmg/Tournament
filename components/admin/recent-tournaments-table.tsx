import type { Database } from "@/lib/database.types"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"

type Tournament = Database["public"]["Tables"]["tournaments"]["Row"]

export default function RecentTournamentsTable({ tournaments }: { tournaments: Tournament[] }) {
  return (
    <div className="overflow-x-auto text-black">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-2">Name</th>
            <th className="text-left py-3 px-2">Status</th>
            <th className="text-left py-3 px-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {tournaments.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-4 text-center text-muted-foreground">
                No tournaments found
              </td>
            </tr>
          ) : (
            tournaments.map((tournament) => (
              <tr key={tournament.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2">{tournament.name}</td>
                <td className="py-3 px-2">
                  <Badge
                    variant={
                      tournament.status === "upcoming"
                        ? "outline"
                        : tournament.status === "active"
                          ? "default"
                          : tournament.status === "completed"
                            ? "secondary"
                            : "outline"
                    }
                  >
                    {tournament.status}
                  </Badge>
                </td>
                <td className="py-3 px-2">
                  {formatDistanceToNow(new Date(tournament.created_at), { addSuffix: true })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
