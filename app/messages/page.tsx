"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Search, Phone, Video, MoreHorizontal, Paperclip, Smile, ArrowLeft } from "lucide-react"

// Mock data for conversations
const conversations = [
  {
    id: 1,
    name: "Team Liquid",
    avatar: "/team-liquid-logo.png",
    lastMessage: "Let's practice tonight at 8PM",
    time: "10:30 AM",
    unread: 2,
    isTeam: true,
    online: true,
  },
  {
    id: 2,
    name: "Alex Johnson",
    avatar: "/mystical-forest-spirit.png",
    lastMessage: "Good game yesterday!",
    time: "Yesterday",
    unread: 0,
    isTeam: false,
    online: true,
  },
  {
    id: 3,
    name: "Sarah Williams",
    avatar: "/bioluminescent-forest.png",
    lastMessage: "Are you joining the tournament?",
    time: "Yesterday",
    unread: 1,
    isTeam: false,
    online: false,
  },
  {
    id: 4,
    name: "Copenhagen Wolves",
    avatar: "/abstract-geometric-logo.png",
    lastMessage: "Match scheduled for Friday",
    time: "Monday",
    unread: 0,
    isTeam: true,
    online: true,
  },
]

// Mock data for messages
const messages = [
  {
    id: 1,
    senderId: "user",
    content: "Hey team, are we ready for tonight's practice?",
    time: "10:15 AM",
  },
  {
    id: 2,
    senderId: "other",
    senderName: "Mike",
    content: "Yes, I'll be online at 8PM sharp",
    time: "10:20 AM",
  },
  {
    id: 3,
    senderId: "other",
    senderName: "Jessica",
    content: "Me too, I've been practicing the new strategy",
    time: "10:25 AM",
  },
  {
    id: 4,
    senderId: "user",
    content: "Great! Let's practice tonight at 8PM",
    time: "10:30 AM",
  },
]

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState(conversations[0])
  const [messageInput, setMessageInput] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const filteredConversations = conversations.filter((conversation) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return conversation.unread > 0
    if (activeTab === "teams") return conversation.isTeam
    return true
  })

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim()) return

    // In a real app, you would send this message to your backend
    console.log("Sending message:", messageInput)
    setMessageInput("")
  }

  return (
    <div className="flex flex-col h-full">
      {/* Back Button */}
      <div className="bg-[#0a0a0a] p-3 border-b border-[#222] flex items-center">
        <Link href="/">
          <Button variant="ghost" size="sm" className="flex items-center text-[#0bb5ff] hover:bg-[#101113]/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </Link>
      </div>

      {/* Messages Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 border-r border-[#222] bg-[#0a0a0a] flex flex-col">
          <div className="p-4 border-b border-[#222]">
            <h2 className="text-xl font-bold mb-2">Messages</h2>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations" className="pl-8 bg-[#101113] border-[#222]" />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <div className="px-4 pt-2">
              <TabsList className="w-full bg-[#101113]">
                <TabsTrigger value="all" className="flex-1">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex-1">
                  Unread
                </TabsTrigger>
                <TabsTrigger value="teams" className="flex-1">
                  Teams
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0 flex-1 overflow-y-auto">
              <div className="space-y-1 p-2">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      activeConversation.id === conversation.id ? "bg-[#101113]" : "hover:bg-[#101113]/50"
                    }`}
                    onClick={() => setActiveConversation(conversation)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <img src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                      </Avatar>
                      {conversation.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#0a0a0a]"></span>
                      )}
                    </div>
                    <div className="ml-3 flex-1 text-left">
                      <div className="flex justify-between">
                        <span className="font-medium">{conversation.name}</span>
                        <span className="text-xs text-muted-foreground">{conversation.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground truncate max-w-[120px]">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unread > 0 && (
                          <span className="bg-[#0bb5ff] text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a]">
          {/* Chat Header */}
          <div className="p-4 border-b border-[#222] flex justify-between items-center">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <img src={activeConversation.avatar || "/placeholder.svg"} alt={activeConversation.name} />
              </Avatar>
              <div>
                <h3 className="font-bold">{activeConversation.name}</h3>
                <p className="text-xs text-muted-foreground">{activeConversation.online ? "Online" : "Offline"}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.senderId === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.senderId === "user" ? "bg-[#0bb5ff] text-white" : "bg-[#101113] text-white"
                  }`}
                >
                  {message.senderId !== "user" && (
                    <p className="text-xs font-medium text-[#0bb5ff] mb-1">{message.senderName}</p>
                  )}
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-70 text-right">{message.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-[#222] flex items-center space-x-2">
            <Button type="button" variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-[#101113] border-[#222]"
            />
            <Button type="button" variant="ghost" size="icon">
              <Smile className="h-5 w-5" />
            </Button>
            <Button type="submit" size="icon" disabled={!messageInput.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
