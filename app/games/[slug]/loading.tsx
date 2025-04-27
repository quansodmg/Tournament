import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <Skeleton className="aspect-video w-full rounded-lg" />
        </div>

        <div className="w-full md:w-2/3">
          <Skeleton className="h-10 w-2/3 mb-4" />

          <div className="flex gap-2 mb-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-28" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>

          <Skeleton className="h-24 w-full mb-6" />

          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      <Skeleton className="h-10 w-48 mt-12 mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-32" />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-12 h-12 rounded-full mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>

                <Skeleton className="h-6 w-8" />

                <div className="flex flex-col items-center">
                  <Skeleton className="w-12 h-12 rounded-full mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>

              <Skeleton className="h-8 w-full mt-4" />
            </div>
          ))}
      </div>
    </div>
  )
}
