"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Save,
  ArrowLeft,
  Loader2,
  Calendar,
  Trash2,
  Smile,
  Frown,
  Zap,
  TrendingUp,
  Heart,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { format } from "date-fns"
import Link from "next/link"

interface JournalEntry {
  id: string
  title: string
  content: string
  date: string
  sentiment?: string
}

export default function EditEntryPage() {
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { token, theme } = useAuth()
  const router = useRouter()
  const params = useParams()
  const entryId = params.id as string

  useEffect(() => {
    if (!token) {
      router.push("/login")
      return
    }

    if (entryId) {
      fetchEntry()
    }
  }, [token, router, entryId])

  const fetchEntry = async () => {
    try {
      const response = await fetch(`http://localhost:8080/journal/id/${entryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setEntry(data)
        setTitle(data.title)
        setContent(data.content)
      } else {
        setError("Entry not found or you don't have permission to view it")
      }
    } catch (error) {
      setError("Error loading entry")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSaving(true)

    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and content")
      setIsSaving(false)
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/journal/id/${entryId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        setError("Failed to update entry. Please try again.")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/journal/id/${entryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        setError("Failed to delete entry. Please try again.")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
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

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
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

  const getPageBackground = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case "happy":
        return "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/20 dark:to-teal-950/20"
      case "sad":
        return "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20"
      case "angry":
        return "bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 dark:from-red-950/20 dark:via-pink-950/20 dark:to-rose-950/20"
      case "anxious":
        return "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/20 dark:via-yellow-950/20 dark:to-orange-950/20"
      default:
        return "bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading entry...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md animate-scale-in">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Save className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Entry Updated!</h2>
            <p className="text-gray-600 dark:text-gray-400">Your journal entry has been updated successfully.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md animate-fade-in">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Entry Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The entry you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${getPageBackground(entry.sentiment)} transition-all duration-500`}>
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">Edit Entry</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Edit Your Entry</CardTitle>
                <div className="flex items-center space-x-3">
                  {entry.sentiment && (
                    <Badge className={`${getSentimentColor(entry.sentiment)} flex items-center gap-1 animate-pulse`}>
                      {getSentimentIcon(entry.sentiment)}
                      {entry.sentiment}
                    </Badge>
                  )}
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(entry.date), "PPP")}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="animate-slide-up">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <Input
                    id="title"
                    placeholder="Give your entry a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg h-12 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-right">{title.length}/100 characters</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Content
                  </label>
                  <Textarea
                    id="content"
                    placeholder="What's on your mind today?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[400px] text-base leading-relaxed resize-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    maxLength={5000}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                    {content.length}/5000 characters
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Changes will be saved with current timestamp
                  </div>
                  <div className="flex space-x-3">
                    <Link href="/dashboard">
                      <Button
                        variant="outline"
                        type="button"
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={isSaving || !title.trim() || !content.trim()}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Update Entry
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
