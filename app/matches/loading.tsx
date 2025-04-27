export default function MatchesLoading() {
  return (
    <div className="container max-w-screen-xl mx-auto py-16 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
        <div className="h-10 w-40 bg-muted animate-pulse rounded"></div>
      </div>

      <div className="h-10 w-full max-w-md bg-muted animate-pulse rounded mb-8"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-muted animate-pulse rounded-lg h-64"></div>
        ))}
      </div>
    </div>
  )
}
