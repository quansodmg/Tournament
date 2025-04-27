import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function LeaderboardLoading() {
  return (
    <div className="container max-w-screen-xl mx-auto py-16 px-4">
      <Skeleton className="h-10 w-48 mb-8" />

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-6 w-6 rounded-full mr-3" />
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
