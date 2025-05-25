import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Sparkles, Users, Target } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">Sensay Learn</span>
          </div>
          <Link href="/dashboard">
            <Button>Get Started</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Learning for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Everyone</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Experience personalized, interactive education through conversation. From coding to mindfulness, from
            history to science - learn anything with your AI-powered learning companion.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Learning Now
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <Target className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Personalized Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                AI adapts to your learning style, pace, and goals for maximum effectiveness.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Interactive Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Learn through natural dialogue with specialized AI tutors and mentors.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <Brain className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>Comprehensive Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                From technical skills to personal development - explore 10 specialized learning modes.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of learners already using AI to achieve their goals.
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              Explore Learning Modes
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; 2024 Sensay Learn. Empowering minds through AI.</p>
        </div>
      </footer>
    </div>
  )
}
