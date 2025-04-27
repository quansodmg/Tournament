import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="p-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
