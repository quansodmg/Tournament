import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileLoadingSkeleton() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="container max-w-screen-xl mx-auto py-8 px-4">
        {/* Top section with profile info and stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Profile info */}
          <div className="lg:col-span-1">
            <div className="bg-[#101113] rounded-xl border border-[#222] p-6 h-full">
              <div className="flex flex-col items-center text-center mb-6">
                <Skeleton className="h-24 w-24 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-4 w-28" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-6">
                <div>
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div>
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div>
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            <div className="bg-[#101113] rounded-xl border border-[#222] p-6 mb-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-10 w-32" />
            </div>

            <div className="bg-[#101113] rounded-xl border border-[#222] p-4 mb-6">
              <div className="flex gap-8 border-b border-[#222] pb-3">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-28" />
              </div>
            </div>

            <div className="bg-[#101113] rounded-xl border border-[#222] p-6">
              <Skeleton className="h-6 w-full mb-4" />

              {/* Match cards skeletons */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-[#222] rounded-lg mb-4 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <Skeleton className="h-3 w-32 mb-2" />
                      <Skeleton className="h-5 w-48 mb-2" />
                      <div className="flex items-center gap-2 mt-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-6" />
                      </div>
                      <Skeleton className="h-3 w-20 mt-1 ml-auto" />
                      <Skeleton className="h-8 w-16 mt-2 ml-auto" />
                      <Skeleton className="h-3 w-20 mt-1 ml-auto" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24 mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game stats section skeleton */}
        <div className="bg-[#101113] rounded-xl border border-[#222] p-6 mb-8">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-6 w-48 mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#151518] rounded-lg overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-[#0bb5ff]/10 to-[#0bb5ff]/5 flex items-center justify-center">
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-3 w-10 mb-1" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}
