"use client"

import type React from "react"

import { AdminSidebar } from "@/components/admin/sidebar"
import { ProtectedRoute } from "@/lib/protected-route"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex min-h-screen bg-muted/20">
        <AdminSidebar />
        <div className="flex-1 md:ml-64">
          <main className="p-4 md:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

