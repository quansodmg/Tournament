import { Loader2 } from "lucide-react"

export default function AdminCronLoading() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Cron Job Monitor</h1>
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading cron job data...</span>
      </div>
    </div>
  )
}
