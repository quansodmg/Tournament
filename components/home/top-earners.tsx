import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Player {
  id: string
  profile_id?: string
  total_earnings: number
  profile: {
    username: string
    avatar_url: string | null
  }
  game: {
    name: string
  }
}

interface TopEarnersProps {
  players: Player[]
}

export function TopEarners({ players = [] }: TopEarnersProps) {
  // Use fallback data if no players are provided
  const hasPlayers = players && players.length > 0

  return (
    <section className="py-16 px-6 bg-secondary">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Weekly Top Match Earners</h2>
          <Button variant="outline" asChild>
            <Link href="/leaderboards">View Leaderboards</Link>
          </Button>
        </div>
        {hasPlayers ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {players.map((player) => (
              <Card key={player.id}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={player.profile?.avatar_url || ""} alt={player.profile?.username} />
                      <AvatarFallback>{player.profile?.username?.[0]?.toUpperCase() || "P"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{player.profile?.username || "Player"}</CardTitle>
                      <p className="text-sm text-muted-foreground">{player.game?.name || "Game"}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-lg">Earnings: ${player.total_earnings}</p>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/players/${player.profile_id || "#"}`}>Profile</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Avatar className="h-16 w-16 mb-4">
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold mb-2">No Top Earners Yet</h3>
              <p className="text-muted-foreground text-center">
                Start playing in tournaments to appear on the leaderboard!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}

// Also provide a default export
export default TopEarners
