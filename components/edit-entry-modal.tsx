"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Save,
  Loader2,
  Calendar,
  Trash2,
  Smile,
  Frown,
  Zap,
  TrendingUp,
  Heart,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { format } from "date-fns"
import { Skeleton } from "@/components/skeleton"

interface JournalEntry {
  id: string | number
  title: string
  content: string
  date: string
  sentiment?: string
}

interface EditEntryModalProps {
  entryId: string | null
  isOpen: boolean
  onClose: () => void
  onEntryUpdated: () => void
  onEntryDeleted: () => void
}

export function EditEntryModal({ entryId, isOpen, onClose, onEntryUpdated, onEntryDeleted }: EditEntryModalProps) {
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    if (isOpen && entryId && token) {
      fetchEntry()
    } else if (!isOpen) {
      // Reset state when modal closes
      setEntry(null)
      setTitle("")
      setContent("")
      setError("")
      setSuccess(false)
    }
  }, [isOpen, entryId, token])

  const fetchEntry = async () => {
    if (!entryId || !token) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`http://localhost:8080/journal/id/${entryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const entryData = await response.json()
        setEntry(entryData)
        setTitle(entryData.title)
        setContent(entryData.content)
      } else {
        throw new Error("Entry not found or you don't have permission to view it")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load entry")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entryId || !token) return

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
          onEntryUpdated()
          onClose()
        }, 1500)
      } else {
        throw new Error("Failed to update entry. Please try again.")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update entry")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!entryId || !token) return

    setIsDeleting(true)
    setError("")

    try {
      const response = await fetch(`http://localhost:8080/journal/id/${entryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        onEntryDeleted()
        setShowDeleteDialog(false)
        onClose()
      } else {
        throw new Error("Failed to delete entry. Please try again.")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete entry")
    } finally {
      setIsDeleting(false)
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Edit Entry</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Make changes to your journal entry
                </DialogDescription>
              </div>
              <div className="flex items-center space-x-3">
                {entry?.sentiment && (
                  <Badge className={`${getSentimentColor(entry.sentiment)} flex items-center gap-1`}>
                    {getSentimentIcon(entry.sentiment)}
                    {entry.sentiment}
                  </Badge>
                )}
                {entry && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(entry.date), "PPP")}
                  </div>
                )}
              </div>
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          ) : success ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Entry Updated!</h3>
              <p className="text-gray-600 dark:text-gray-400">Your journal entry has been updated successfully.</p>
            </div>
          ) : entry ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
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
                  className="text-lg h-12 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                  className="min-h-[300px] text-base leading-relaxed resize-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">{content.length}/5000 characters</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Entry
                </Button>

                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
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
          ) : (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Entry Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The entry you are looking for does not exist or you do not have permission to view it.
              </p>
              <Button onClick={onClose}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Delete Entry
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone and will permanently remove your
              journal entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Entry
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
