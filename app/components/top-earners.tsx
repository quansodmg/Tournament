import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const topEarners = [
  { id: 1, name: "Player1", earnings: "$10,000", avatar: "/player1.jpg" },
  { id: 2, name: "Player2", earnings: "$8,500", avatar: "/player2.jpg" },
  { id: 3, name: "Player3", earnings: "$7,200", avatar: "/player3.jpg" },
]

export default function TopEarners() {
  return (
    <section className="py-16 px-6 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Weekly Top Match Earners</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topEarners.map((earner) => (
            <Card key={earner.id} className="bg-card">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={earner.avatar} alt={earner.name} />
                    <AvatarFallback>{earner.name[0]}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-card-foreground">{earner.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground">Earnings: {earner.earnings}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
