import { createServerClient } from "@/lib/supabase/server"
import AdminCronMonitor from "@/components/admin/cron/admin-cron-monitor"
import ManualTriggerButton from "@/components/admin/cron/manual-trigger-button"

export default async function AdminCronPage() {
  let cronLogs = []
  let errorMessage = null

  try {
    const supabase = await createServerClient()

    // Get the latest cron job logs
    const { data, error } = await supabase
      .from("cron_job_logs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error fetching cron logs:", error)
      errorMessage = error.message
    } else {
      cronLogs = data || []
    }
  } catch (err) {
    console.error("Exception in AdminCronPage:", err)
    errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cron Job Monitor</h1>
        <ManualTriggerButton />
      </div>

      <AdminCronMonitor initialLogs={cronLogs} error={errorMessage} />
    </div>
  )
}
