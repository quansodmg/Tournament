export default function StaticFallback() {
  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900">
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "url('/esports-arena-showdown.png')", backgroundSize: "cover" }}
          ></div>
        </div>
        <div className="relative flex h-full flex-col items-center justify-center text-center p-6">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">Welcome to EsportsHub</h1>
          <p className="mb-8 max-w-2xl text-lg text-gray-200">
            Join the ultimate competitive gaming platform. Participate in tournaments, find matches, and track your
            stats.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="rounded-md bg-[#0bb5ff] px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600">
              Browse Tournaments
            </button>
            <button className="rounded-md border border-white bg-transparent px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10">
              Find Matches
            </button>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="py-12">
        <div className="container px-4 md:px-6">
          <h2 className="mb-8 text-3xl font-bold text-white">Popular Games</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "League of Legends",
                image: "/vibrant-esports-showdown.png",
                players: "2.4M",
              },
              {
                name: "Counter-Strike 2",
                image: "/tactical-shooter-scene.png",
                players: "1.8M",
              },
              {
                name: "Valorant",
                image: "/urban-team-clash.png",
                players: "1.2M",
              },
            ].map((game, i) => (
              <div key={i} className="group relative overflow-hidden rounded-lg">
                <div className="aspect-video overflow-hidden">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url(${game.image})` }}
                  ></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                  <h3 className="text-xl font-bold text-white">{game.name}</h3>
                  <p className="text-sm text-gray-300">{game.players} active players</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Tournaments */}
      <section className="py-12 bg-[#101113]">
        <div className="container px-4 md:px-6">
          <h2 className="mb-8 text-3xl font-bold text-white">Latest Tournaments</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Summer Championship",
                game: "League of Legends",
                date: "June 15, 2023",
                prize: "$10,000",
              },
              {
                name: "Pro League Season 5",
                game: "Counter-Strike 2",
                date: "July 1, 2023",
                prize: "$25,000",
              },
              {
                name: "Valorant Masters",
                game: "Valorant",
                date: "August 5, 2023",
                prize: "$15,000",
              },
            ].map((tournament, i) => (
              <div key={i} className="rounded-lg border border-[#1e2023] bg-[#141518] p-6">
                <h3 className="mb-2 text-xl font-bold text-white">{tournament.name}</h3>
                <div className="mb-4 flex items-center text-sm text-gray-400">
                  <span className="mr-3">{tournament.game}</span>
                  <span>{tournament.date}</span>
                </div>
                <div className="mb-4 flex items-center">
                  <span className="text-lg font-bold text-[#0bb5ff]">{tournament.prize}</span>
                  <span className="ml-2 text-sm text-gray-400">Prize Pool</span>
                </div>
                <button className="w-full rounded-md bg-[#1e2023] py-2 text-sm font-medium text-white transition-colors hover:bg-[#2a2d32]">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Players */}
      <section className="py-12">
        <div className="container px-4 md:px-6">
          <h2 className="mb-8 text-3xl font-bold text-white">Top Earners</h2>
          <div className="space-y-4">
            {[
              {
                name: "ProGamer123",
                game: "League of Legends",
                earnings: "$500,000",
              },
              {
                name: "EsportsChamp",
                game: "Counter-Strike 2",
                earnings: "$350,000",
              },
              {
                name: "ValorantMaster",
                game: "Valorant",
                earnings: "$275,000",
              },
            ].map((player, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-[#1e2023] bg-[#141518] p-4"
              >
                <div className="flex items-center">
                  <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-[#1e2023] flex items-center justify-center text-[#0bb5ff] font-bold">
                    {player.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{player.name}</h3>
                    <p className="text-sm text-gray-400">{player.game}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#0bb5ff]">{player.earnings}</p>
                  <p className="text-xs text-gray-400">Total Earnings</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
