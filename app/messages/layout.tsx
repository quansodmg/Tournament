import type React from "react"

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Custom layout without the sidebar, full height minus header
  return <div className="h-[calc(100vh-4rem)]">{children}</div>
}
