"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Loader2, User, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    userName: "",
    Password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { user, token, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.push("/login")
      return
    }

    setFormData((prev) => ({
      ...prev,
      userName: user || "",
    }))
  }, [token, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    if (!formData.userName.trim()) {
      setError("Username is required")
      setIsLoading(false)
      return
    }

    if (formData.Password && formData.Password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const updateData: any = {
        userName: formData.userName.trim(),
      }

      if (formData.Password) {
        updateData.Password = formData.Password
      }

      const response = await fetch("https://the-journal-9iyg.onrender.com/user", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        setSuccess("Profile updated successfully!")
        setFormData((prev) => ({ ...prev, Password: "" }))
      } else {
        setError("Failed to update profile. Please try again.")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone and will delete all your journal entries.",
      )
    ) {
      return
    }

    if (!confirm("This will permanently delete your account and all data. Are you absolutely sure?")) {
      return
    }

    try {
      const response = await fetch("https://the-journal-9iyg.onrender.com/user", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        logout()
        router.push("/")
      } else {
        setError("Failed to delete account. Please try again.")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
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
                <User className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Profile Settings</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">Account Settings</CardTitle>
              <CardDescription>Update your account information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="userName">Username</Label>
                  <Input
                    id="userName"
                    name="userName"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.userName}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Password">New Password (optional)</Label>
                  <Input
                    id="Password"
                    name="Password"
                    type="password"
                    placeholder="Enter new password to change it"
                    value={formData.Password}
                    onChange={handleChange}
                    className="h-11"
                  />
                  <p className="text-sm text-gray-500">Leave blank to keep your current password</p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="shadow-lg border-0 mt-8 border-red-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Delete Account</h3>
                <p className="text-red-700 text-sm mb-4">
                  Once you delete your account, there is no going back. This will permanently delete your account and
                  all your journal entries.
                </p>
                <Button
                  variant="outline"
                  onClick={handleDeleteAccount}
                  className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
