/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Trash2,
  Edit,
  LogOut,
  User,
  Cloud,
  Moon,
  Sun,
  TrendingUp,
  Heart,
  Smile,
  Frown,
  Zap,
  SortDesc,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { ErrorBoundary } from "@/components/error-boundary"
import { DashboardSkeleton } from "@/components/skeleton"
import { EditEntryModal } from "@/components/edit-entry-modal"

import { baseUrl } from "@/lib/api"

interface JournalEntry {
  id: string | number
  title: string
  content: string
  date: string
  sentiment?: string | null
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [greeting, setGreeting] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "title">("date")
  const [filterSentiment, setFilterSentiment] = useState<string>("")
  const [error, setError] = useState("")
  const [isOnline, setIsOnline] = useState(true)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const { user, token, logout, theme, toggleTheme } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.push("/login")
      return
    }

    fetchData()

    // Online/offline detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [token, router])

  const fetchData = async () => {
    if (!token) return

    setIsLoading(true)
    setError("")

    try {
      // Fetch entries
      const entriesResponse = await fetch("https://the-journal-9iyg.onrender.com/journal", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json()
        // Ensure IDs are strings and handle the response properly with null safety
        const processedEntries = (entriesData || []).map((entry:any) => ({
          ...entry,
          id: String(entry.id), // Convert ID to string
          title: entry.title || "", // Ensure title is never null/undefined
          content: entry.content || "", // Ensure content is never null/undefined
          date: entry.date || new Date().toISOString(), // Ensure date is never null/undefined
        }))
        setEntries(processedEntries)
      } else {
        throw new Error("Failed to fetch entries")
      }

      // Fetch greeting
      try {
        const greetingResponse = await fetch("https://the-journal-9iyg.onrender.com/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (greetingResponse.ok) {
          const greetingData = await greetingResponse.text()
          setGreeting(greetingData)
        }
      } catch (greetingError) {
        // Greeting is optional, don't fail the whole request
        console.log("Could not fetch greeting:", greetingError)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    fetchData()
  }

  const handleEntryUpdated = () => {
    fetchData()
  }

  const handleEntryDeleted = () => {
    fetchData()
  }

  const deleteEntry = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    try {
      const response = await fetch(`https://the-journal-9iyg.onrender.com/journal/id/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      console.log(response)
      if (response.ok) {
        setEntries(entries.filter((entry) => entry.id !== id))
      } else {
        throw new Error("Failed to delete entry")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete entry")
    }
  }

  const getSentimentColor = (sentiment?: string | null) => {
    if (!sentiment) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    
    switch (sentiment.toLowerCase()) {
      case "happy":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
      case "sad":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "angry":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "anxious":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getSentimentIcon = (sentiment?: string | null) => {
    if (!sentiment) return <Heart className="h-4 w-4" />
    
    switch (sentiment.toLowerCase()) {
      case "happy":
        return <Smile className="h-4 w-4" />
      case "sad":
        return <Frown className="h-4 w-4" />
      case "angry":
        return <Zap className="h-4 w-4" />
      case "anxious":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Heart className="h-4 w-4" />
    }
  }

  const getCardBackground = (sentiment?: string | null) => {
    if (!sentiment) return "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900 border-gray-200 dark:border-gray-700"
    
    switch (sentiment.toLowerCase()) {
      case "happy":
        return "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800"
      case "sad":
        return "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800"
      case "angry":
        return "bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800"
      case "anxious":
        return "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800"
      default:
        return "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900 border-gray-200 dark:border-gray-700"
    }
  }

  // Filter and sort entries - Fixed null safety for all fields
  const filteredAndSortedEntries = entries
    .filter((entry) => {
      // Ensure title and content are never null/undefined before calling toLowerCase
      const title = entry.title || ""
      const content = entry.content || ""
      const searchTermLower = searchTerm.toLowerCase()
      
      const matchesSearch =
        title.toLowerCase().includes(searchTermLower) ||
        content.toLowerCase().includes(searchTermLower)
      
      // Handle null/undefined sentiment properly
      const matchesSentiment = !filterSentiment || 
        (entry.sentiment && entry.sentiment.toLowerCase() === filterSentiment.toLowerCase())
      
      return matchesSearch && matchesSentiment
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      // Ensure titles are never null before comparing
      const titleA = a.title || ""
      const titleB = b.title || ""
      return titleA.localeCompare(titleB)
    })

  // Calculate sentiment stats - Fixed null safety
  const sentimentStats = entries.reduce(
    (acc, entry) => {
      const sentiment = entry.sentiment?.toLowerCase() || "neutral"
      acc[sentiment] = (acc[sentiment] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">JournalApp</span>
                </div>
              </div>
            </div>
          </header>
          <DashboardSkeleton />
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium">
            <WifiOff className="inline h-4 w-4 mr-2" />
            You are offline. Some features may not be available.
          </div>
        )}

        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2 group">
                  <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">JournalApp</span>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={handleRetry} className="ml-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {user}! ✨
            </h1>
            {greeting && (
              <div className="flex items-center text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 animate-slide-up">
                <Cloud className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
                <p className="text-sm">{greeting}</p>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Total Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{entries.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                  {
                    entries.filter((entry) => {
                      const entryDate = new Date(entry.date)
                      const now = new Date()
                      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear()
                    }).length
                  }
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400 flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Happy Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {sentimentStats.happy || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Writing Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">7 days</div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8 animate-slide-up">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search your thoughts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={filterSentiment}
                onChange={(e) => setFilterSentiment(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="">All Moods</option>
                <option value="happy">😊 Happy</option>
                <option value="sad">😢 Sad</option>
                <option value="angry">😠 Angry</option>
                <option value="anxious">😰 Anxious</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === "date" ? "title" : "date")}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <SortDesc className="h-4 w-4 mr-2" />
                {sortBy === "date" ? "Date" : "Title"}
              </Button>
            </div>

            <Link href="/write">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </Link>
          </div>

          {/* Entries Grid */}
          {filteredAndSortedEntries.length === 0 ? (
            <Card className="text-center py-16 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 animate-fade-in">
              <CardContent>
                <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm || filterSentiment ? "No entries found" : "No entries yet"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {searchTerm || filterSentiment
                    ? "Try adjusting your search terms or filters"
                    : "Start your journaling journey by writing your first entry. Capture your thoughts, feelings, and experiences."}
                </p>
                {!searchTerm && !filterSentiment && (
                  <Link href="/write">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="h-4 w-4 mr-2" />
                      Write Your First Entry
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedEntries.map((entry, index) => (
                <Card
                  key={entry.id}
                  className={`${getCardBackground(entry.sentiment)} hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up cursor-pointer`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setEditingEntryId(String(entry.id))}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                          {entry.title || "Untitled"}
                        </CardTitle>
                        <CardDescription className="flex items-center text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                        </CardDescription>
                      </div>
                      {entry.sentiment && (
                        <Badge
                          className={`${getSentimentColor(entry.sentiment)} flex items-center gap-1 animate-pulse`}
                        >
                          {getSentimentIcon(entry.sentiment)}
                          {entry.sentiment}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                      {entry.content || "No content"}
                    </p>
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingEntryId(String(entry.id))
                        }}
                        className="hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-105"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteEntry(entry.id)
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-105"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Edit Entry Modal */}
        <EditEntryModal
          entryId={editingEntryId}
          isOpen={!!editingEntryId}
          onClose={() => setEditingEntryId(null)}
          onEntryUpdated={handleEntryUpdated}
          onEntryDeleted={handleEntryDeleted}
        />
      </div>
    </ErrorBoundary>
  )
}