import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ArrowLeft, Calendar, Edit, Trash2 } from "lucide-react"

export default function DemoPage() {
  const demoEntries = [
    {
      id: "1",
      title: "Morning Reflections",
      content:
        "Started the day with a peaceful walk in the park. The fresh air and morning sunlight really helped clear my mind. I've been thinking about how important it is to take these quiet moments for myself...",
      date: "2024-01-15T08:30:00Z",
      sentiment: "Happy",
    },
    {
      id: "2",
      title: "Work Challenges",
      content:
        "Had a difficult meeting today with the client. Feeling a bit overwhelmed with all the feedback and changes they want. Need to remember that this is part of the process and every challenge is an opportunity to grow...",
      date: "2024-01-14T18:45:00Z",
      sentiment: "Anxious",
    },
    {
      id: "3",
      title: "Weekend Plans",
      content:
        "Looking forward to the weekend! Planning to visit the art museum with Sarah and then try that new restaurant downtown. It's been too long since we've had quality time together...",
      date: "2024-01-13T20:15:00Z",
      sentiment: "Happy",
    },
  ]

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "happy":
        return "bg-green-100 text-green-800"
      case "sad":
        return "bg-blue-100 text-blue-800"
      case "angry":
        return "bg-red-100 text-red-800"
      case "anxious":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">JournalApp Demo</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Demo Notice */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Interactive Demo</h1>
          <p className="text-blue-800 mb-4">
            This is a preview of what your journal dashboard would look like. Sign up to start creating your own
            entries!
          </p>
          <Link href="/signup">
            <Button className="bg-blue-600 hover:bg-blue-700">Start Journaling Free</Button>
          </Link>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Demo User!</h2>
          <div className="flex items-center text-gray-600 bg-blue-50 p-3 rounded-lg">
            <span>Hi Demo User, Weather feels like 72°F in your area. Perfect day for journaling!</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">24</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">8</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Writing Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">12 days</div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Entries */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Entries</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoEntries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">{entry.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(entry.date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getSentimentColor(entry.sentiment)}>{entry.sentiment}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 line-clamp-3 mb-4">{entry.content}</p>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" disabled>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" disabled className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to start your own journal?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Create your account and start capturing your thoughts, tracking your mood, and discovering insights about
            yourself.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
