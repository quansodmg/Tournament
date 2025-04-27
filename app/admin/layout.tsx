import type React from "react"
import AdminAuthWrapper from "@/components/admin/admin-auth-wrapper"

export const metadata = {
  title: "Admin Dashboard | Esports Gaming Platform",
  description: "Admin dashboard for managing the esports gaming platform",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminAuthWrapper>{children}</AdminAuthWrapper>
}
