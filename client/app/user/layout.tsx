"use client"

import type React from "react"

import { UserSidebar } from "@/components/user/sidebar"
import { ProtectedRoute } from "@/lib/protected-route"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <div className="flex min-h-screen bg-muted/20">
        <UserSidebar />
        <div className="flex-1 md:ml-64">
          <main className="p-4 md:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

