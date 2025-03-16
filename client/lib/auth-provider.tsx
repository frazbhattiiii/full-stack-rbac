"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

type User = {
  id: string
  email: string
  name: string
  type: "admin" | "user"
}

type AuthContextType = {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await api.post("/auth/login", { email, password })

      if (response.data.status === "success") {
        const { token, user } = response.data.data

        // Save to state
        setToken(token)
        setUser(user)

        // Save to localStorage
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))

        // Redirect based on user type
        if (user.type === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/user/dashboard")
        }

        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}!`,
        })
      }
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await api.post("/auth/register", { name, email, password })
  
      // If we get here, it means the request was successful
      toast({
        title: "Registration successful",
        description: "You can now log in with your credentials",
      })
      router.push("/login")
      return response.data
    } catch (error: any) {
      console.error("Signup error:", error)
      
      // Extract the error message from the response
      const errorMessage = error.response?.data[0] || "Email may already be in use"
      
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMessage,
      })
      
      // Re-throw the error so the component can also handle it if needed
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear state
    setUser(null)
    setToken(null)

    // Clear localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    // Redirect to login
    router.push("/login")

    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

