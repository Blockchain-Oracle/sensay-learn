import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Brain,
  Code,
  Heart,
  MessageSquare,
  Users,
  Accessibility,
  Briefcase,
  BookOpen,
  FlaskConical,
  Globe,
  ArrowLeft,
} from "lucide-react"

const learningModes = [
  {
    id: "ai-mentor",
    title: "AI Mentor for Lifelong Learning",
    description: "Get personalized learning paths and guidance from virtual AI mentors based on your goals.",
    icon: Brain,
    color: "from-purple-500 to-purple-600",
    href: "/learn/ai-mentor",
  },
  {
    id: "coding-tutor",
    title: "Interactive Coding Tutor",
    description: "Learn programming languages through interactive lessons and challenges.",
    icon: Code,
    color: "from-blue-500 to-blue-600",
    href: "/learn/coding-tutor",
  },
  {
    id: "mindfulness-coach",
    title: "Mindfulness & Mental Health Coach",
    description: "Practice stress relief, focus exercises, and emotional well-being.",
    icon: Heart,
    color: "from-green-500 to-green-600",
    href: "/learn/mindfulness-coach",
  },
  {
    id: "debate-coach",
    title: "AI Debate Coach",
    description: "Improve your argumentation skills with real-time coaching on structure and logic.",
    icon: MessageSquare,
    color: "from-red-500 to-red-600",
    href: "/learn/debate-coach",
  },
  {
    id: "historical-figures",
    title: "Historical Figures AI Chat",
    description: "Converse with AI replicas of famous historical figures and learn about their era.",
    icon: Users,
    color: "from-amber-500 to-amber-600",
    href: "/learn/historical-figures",
  },
  {
    id: "adaptive-learning",
    title: "Adaptive Learning for Special Needs",
    description: "Personalized content delivery for various learning challenges and accessibility needs.",
    icon: Accessibility,
    color: "from-teal-500 to-teal-600",
    href: "/learn/adaptive-learning",
  },
  {
    id: "career-simulation",
    title: "Career Simulation Assistant",
    description: "Practice job interviews, workplace scenarios, and professional skills.",
    icon: Briefcase,
    color: "from-indigo-500 to-indigo-600",
    href: "/learn/career-simulation",
  },
  {
    id: "study-buddy",
    title: "AI-Powered Study Buddy",
    description: "Plan study sessions, get topic explanations, and track your progress.",
    icon: BookOpen,
    color: "from-pink-500 to-pink-600",
    href: "/learn/study-buddy",
  },
  {
    id: "science-lab",
    title: "Virtual Science Lab",
    description: "Conduct simulated experiments with interactive AI guidance.",
    icon: FlaskConical,
    color: "from-cyan-500 to-cyan-600",
    href: "/learn/science-lab",
  },
  {
    id: "language-coach",
    title: "Language & Culture Learning Coach",
    description: "Learn foreign languages through immersive, culturally rich conversations.",
    icon: Globe,
    color: "from-violet-500 to-violet-600",
    href: "/learn/language-coach",
  },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">Sensay Learn</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Learning Adventure</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select from 10 specialized AI-powered learning modes designed to help you grow, learn, and achieve your
            goals through personalized conversations.
          </p>
        </div>

        {/* Learning Modes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {learningModes.map((mode) => {
            const IconComponent = mode.icon
            return (
              <Link key={mode.id} href={mode.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-0 shadow-md">
                  <CardHeader className="pb-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${mode.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {mode.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-sm leading-relaxed">
                      {mode.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            New to AI-powered learning? Start with our AI Mentor for personalized guidance.
          </p>
          <Link href="/learn/ai-mentor">
            <Button size="lg">
              Get Started with AI Mentor
              <Brain className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
