import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GamepadIcon as GameController, Search, Users } from "lucide-react"

// Make this a static page with no server-side data dependencies
export default function MatchFinderPage() {
  return (
    <div className="container max-w-screen-xl mx-auto py-16 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Match Finder</h1>
        <Button asChild>
          <Link href="/auth?redirect=/match-finder/create">Create Match</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search matches..." className="pl-8" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Game</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Games" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Games</SelectItem>
                    {/* Games will be loaded client-side */}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Skill Level</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Skill</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="pro">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Platform</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Platform</SelectItem>
                    <SelectItem value="pc">PC</SelectItem>
                    <SelectItem value="playstation">PlayStation</SelectItem>
                    <SelectItem value="xbox">Xbox</SelectItem>
                    <SelectItem value="switch">Nintendo Switch</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">Apply Filters</Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="players">
            <TabsList className="mb-6">
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>

            <TabsContent value="players">
              <div className="text-center py-12">
                <GameController className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Match Finder Coming Soon</h2>
                <p className="text-muted-foreground mb-6">
                  We&apos;re working on implementing the match finder feature. Check back soon!
                </p>
                <Button asChild>
                  <Link href="/auth">Sign In to Get Notified</Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="teams">
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Team Match Finder Coming Soon</h2>
                <p className="text-muted-foreground mb-6">
                  We&apos;re working on implementing the team match finder feature. Check back soon!
                </p>
                <Button asChild>
                  <Link href="/auth">Sign In to Get Notified</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
