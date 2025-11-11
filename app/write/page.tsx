"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Save, ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function WritePage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.push("/login")
    }
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and content")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("https://the-journal-9iyg.onrender.com/journal", {
        method: "POST",
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
        setError("Failed to save entry. Please try again.")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Save className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Entry Saved!</h2>
            <p className="text-gray-600">Your journal entry has been saved successfully.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">New Entry</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">Write Your Thoughts</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <Input
                    id="title"
                    placeholder="Give your entry a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg h-12"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 text-right">{title.length}/100 characters</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <Textarea
                    id="content"
                    placeholder="What's on your mind today? Write about your thoughts, feelings, experiences..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[400px] text-base leading-relaxed resize-none"
                    maxLength={5000}
                  />
                  <p className="text-xs text-gray-500 text-right">{content.length}/5000 characters</p>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-500">Your entry will be automatically analyzed for sentiment</div>
                  <div className="flex space-x-3">
                    <Link href="/dashboard">
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading || !title.trim() || !content.trim()}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Entry
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
