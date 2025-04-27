import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Trophy, Users } from "lucide-react"
import Link from "next/link"

interface Tournament {
  id: string
  name: string
  slug: string
  start_date: string
  prize_pool: number
  game: {
    name: string
  }
  team_size: number
}

interface LatestTournamentsProps {
  tournaments: Tournament[]
}

export function LatestTournaments({ tournaments = [] }: LatestTournamentsProps) {
  // Use fallback data if no tournaments are provided
  const hasTournaments = tournaments && tournaments.length > 0

  return (
    <section className="py-16 px-6">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Latest Tournaments</h2>
          <Button variant="outline" asChild>
            <Link href="/tournaments">View All</Link>
          </Button>
        </div>
        {hasTournaments ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tournaments.map((tournament) => {
              const startDate = new Date(tournament.start_date)
              const formattedDate = startDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })

              return (
                <Card key={tournament.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{tournament.name}</CardTitle>
                      <Badge>{tournament.game?.name || "Game"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 opacity-70" />
                        <span>Date: {formattedDate}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Trophy className="mr-2 h-4 w-4 opacity-70" />
                        <span>Prize Pool: ${tournament.prize_pool}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 opacity-70" />
                        <span>{tournament.team_size} Players Per Team</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/tournaments/${tournament.slug}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Tournaments Yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                There are no tournaments available at the moment.
              </p>
              <Button asChild>
                <Link href="/tournaments/create">Create Tournament</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}

// Also provide a default export
export default LatestTournaments
