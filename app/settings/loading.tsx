import { Loader2 } from "lucide-react"

export default function SettingsLoading() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 text-[#0bb5ff] animate-spin" />
        <p className="text-white">Loading settings...</p>
      </div>
    </div>
  )
}
