import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminEditGameLoading() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/games">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Link>
        </Button>
      </div>

      <Skeleton className="h-10 w-64 mb-8" />

      <div className="max-w-3xl">
        <div className="bg-white rounded-lg border shadow-sm p-6 text-black">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-64" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-32 w-full" />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-48 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>

            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
