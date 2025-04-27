import type { Metadata } from "next"
import EnhancedScheduleMatchForm from "@/components/matches/enhanced-schedule-match-form"

export const metadata: Metadata = {
  title: "Schedule a Call of Duty Match",
  description: "Create a new Call of Duty match with competitive rule sets",
}

export default function EnhancedScheduleMatchPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Schedule a Call of Duty Match</h1>
      <EnhancedScheduleMatchForm />
    </div>
  )
}
