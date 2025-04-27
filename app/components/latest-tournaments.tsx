import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const latestTournaments = [
  { id: 1, name: "Call of Duty Summer Showdown", date: "2023-07-15", prize: "$100,000" },
  { id: 2, name: "Fortnite Battle Royale", date: "2023-07-20", prize: "$250,000" },
  { id: 3, name: "Rocket League Championship", date: "2023-07-25", prize: "$150,000" },
]

export default function LatestTournaments() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Latest Tournaments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestTournaments.map((tournament) => (
            <Card key={tournament.id}>
              <CardHeader>
                <CardTitle>{tournament.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Date: {tournament.date}</p>
                <p>Prize Pool: {tournament.prize}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
