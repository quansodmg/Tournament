import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock, Settings } from "lucide-react"
import Link from "next/link"

interface MatchSetupStatusProps {
  match: any
}

export default function MatchSetupStatus({ match }: MatchSetupStatusProps) {
  // Check if setup is complete
  const isSetupComplete = match.setup_completed_at !== null

  // Check if maps are selected
  const hasMaps = match.match_settings?.selected_maps && match.match_settings.selected_maps.length > 0

  // Check if rules are set
  const hasRules = match.match_settings?.rules !== null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Match Setup Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center">
                <span className="font-medium">Teams Joined</span>
              </div>
              <Badge variant="outline" className="ml-2">
                {match.participants.length} / 2
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center">
                <span className="font-medium">Maps Selected</span>
              </div>
              {hasMaps ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center">
                <span className="font-medium">Setup Complete</span>
              </div>
              {isSetupComplete ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 text-amber-500" />
              )}
            </div>
          </div>

          {!isSetupComplete && (
            <div className="flex justify-center mt-4">
              <Button asChild>
                <Link href={`/matches/${match.id}/setup`}>Complete Setup</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
