"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: string | null
  token: string | null
  login: (token: string, username: string) => void
  logout: () => void
  isLoading: boolean
  theme: "light" | "dark"
  toggleTheme: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const router = useRouter()

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    const storedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light"

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    }

    setTheme(storedTheme)
    document.documentElement.classList.toggle("dark", storedTheme === "dark")

    setIsLoading(false)
  }, [])

  const login = (newToken: string, username: string) => {
    setToken(newToken)
    setUser(username)
    localStorage.setItem("token", newToken)
    localStorage.setItem("user", username)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
