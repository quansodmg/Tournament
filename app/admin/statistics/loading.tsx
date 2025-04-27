import { Skeleton } from "@/components/ui/skeleton"

export default function AdminStatisticsLoading() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Statistics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <Skeleton className="h-10 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-96 mb-4" />

        <div className="bg-white rounded-lg shadow p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    </div>
  )
}
