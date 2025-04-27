import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Friends</h1>
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading friends...</p>
      </div>
    </div>
  )
}
