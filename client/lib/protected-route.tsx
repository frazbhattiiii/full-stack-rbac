"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"

type ProtectedRouteProps = {
  children: React.ReactNode
  allowedRoles?: Array<"admin" | "user">
}

export function ProtectedRoute({ children, allowedRoles = ["admin", "user"] }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (!isLoading && user && !allowedRoles.includes(user.type)) {
      // Redirect to appropriate dashboard if user doesn't have permission
      if (user.type === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/user/dashboard")
      }
    }
  }, [user, isLoading, router, allowedRoles])

  // Show nothing while checking authentication
  if (isLoading || !user) {
    return null
  }

  // If user is authenticated and has permission, show the children
  if (user && allowedRoles.includes(user.type)) {
    return <>{children}</>
  }

  // Default case - should not reach here due to redirects
  return null
}

