import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FriendList } from "@/components/friends/friend-list"
import { FriendRequests } from "@/components/friends/friend-requests"
import { UserSearch } from "@/components/friends/user-search"

export const metadata: Metadata = {
  title: "Friends | EsportsHub",
  description: "Manage your friends and connections on EsportsHub",
}

export default function FriendsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Friends</h1>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="friends">My Friends</TabsTrigger>
          <TabsTrigger value="requests">Friend Requests</TabsTrigger>
          <TabsTrigger value="add">Add Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <Card>
            <CardHeader>
              <CardTitle>My Friends</CardTitle>
              <CardDescription>View and manage your friends list</CardDescription>
            </CardHeader>
            <CardContent>
              <FriendList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Friend Requests</CardTitle>
              <CardDescription>Manage your incoming and outgoing friend requests</CardDescription>
            </CardHeader>
            <CardContent>
              <FriendRequests />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add Friends</CardTitle>
              <CardDescription>Search for users and send friend requests</CardDescription>
            </CardHeader>
            <CardContent>
              <UserSearch />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
