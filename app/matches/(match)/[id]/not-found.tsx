import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"

export default function MatchNotFound() {
  return (
    <div className="container max-w-screen-md mx-auto py-16 px-4">
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-600">Match Not Found</CardTitle>
          </div>
          <CardDescription>We couldn't find the match you're looking for.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            The match may have been deleted, or you might have followed an incorrect link.
          </p>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button asChild variant="default">
            <Link href="/matches">Browse All Matches</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/matches/schedule">Schedule a Match</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Return to home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
