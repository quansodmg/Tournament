"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Send } from "lucide-react"
import { format } from "date-fns"

interface MatchChatProps {
  matchId: string
  userId: string
  userProfile: any
  initialMessages: any[]
}

export default function MatchChat({ matchId, userId, userProfile, initialMessages }: MatchChatProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<any[]>(initialMessages || [])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Set up real-time subscription
    const channel = supabase
      .channel(`match_chat:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "match_chats",
          filter: `match_id=eq.${matchId}`,
        },
        async (payload) => {
          // Fetch the complete message with profile info
          const { data } = await supabase
            .from("match_chats")
            .select(`
              *,
              profile:profile_id(*)
            `)
            .eq("id", payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => [...prev, data])
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    try {
      setSending(true)

      const { error } = await supabase.from("match_chats").insert({
        match_id: matchId,
        profile_id: userId,
        message: newMessage.trim(),
        is_system: false,
      })

      if (error) throw error

      setNewMessage("")
    } catch (err) {
      console.error("Error sending message:", err)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="pb-3">
        <CardTitle>Match Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto pb-0">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.is_system ? "justify-center" : "items-start"}`}>
                {!message.is_system && (
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={message.profile?.avatar_url || ""} alt={message.profile?.username} />
                    <AvatarFallback>{message.profile?.username?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`${
                    message.is_system ? "bg-muted text-center py-1 px-3 rounded-md text-sm w-full" : "flex-1"
                  }`}
                >
                  {!message.is_system && (
                    <div className="flex items-center">
                      <p className="font-medium text-sm">{message.profile?.username || "Unknown"}</p>
                      <span className="text-xs text-muted-foreground ml-2">
                        {format(new Date(message.created_at), "h:mm a")}
                      </span>
                    </div>
                  )}
                  <p className={`${message.is_system ? "text-muted-foreground" : "mt-1"}`}>{message.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
