import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JournalApp - Your Digital Journal",
  description:
    "Capture your thoughts, track your mood, and discover insights about yourself with our intelligent journaling platform.",
  keywords: "journal, diary, mood tracking, personal growth, writing, reflection",
  authors: [{ name: "JournalApp Team" }],
  openGraph: {
    title: "JournalApp - Your Digital Journal",
    description: "Capture your thoughts, track your mood, and discover insights about yourself.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "JournalApp - Your Digital Journal",
    description: "Capture your thoughts, track your mood, and discover insights about yourself.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
