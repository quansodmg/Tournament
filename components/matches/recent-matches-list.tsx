import { Card, CardContent } from "@/components/ui/card"
import { History } from "lucide-react"
import MatchCard from "./match-card"

interface RecentMatchesListProps {
  matches: any[]
  loading: boolean
}

export default function RecentMatchesList({ matches, loading }: RecentMatchesListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <History className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Recent Matches</h3>
          <p className="text-muted-foreground text-center">There are no completed matches to display.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  )
}
