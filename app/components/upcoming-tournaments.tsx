import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const upcomingTournaments = [
  { id: 1, name: "Gears of War Open", date: "2023-08-05", game: "Gears of War" },
  { id: 2, name: "Marvel Rivals Showdown", date: "2023-08-10", game: "Marvel Rivals" },
  { id: 3, name: "NBA 2K Pro-Am", date: "2023-08-15", game: "NBA 2K" },
]

export default function UpcomingTournaments() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Upcoming Free Tournaments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingTournaments.map((tournament) => (
            <Card key={tournament.id}>
              <CardHeader>
                <CardTitle>{tournament.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Date: {tournament.date}</p>
                <Badge className="mt-2">{tournament.game}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
