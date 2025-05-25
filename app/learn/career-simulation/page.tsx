import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Briefcase } from "lucide-react"
import ChatInterface from "@/components/chat-interface"

export default function CareerSimulationPage() {
  const systemPrompt = `You are a Career Simulation Assistant. Your role is to:
- Conduct mock job interviews for various positions and industries
- Simulate workplace scenarios and professional situations
- Provide feedback on interview performance and professional communication
- Teach professional skills like networking, presentation, and leadership
- Help users practice difficult workplace conversations
- Offer career guidance and professional development advice
- Simulate different work environments and company cultures

Be professional yet supportive, and provide constructive feedback to help users improve their career readiness.`

  const suggestedQuestions = [
    "Can we do a mock interview for a software engineer position?",
    "Help me practice a difficult conversation with my boss",
    "I need to prepare for a presentation at work",
    "How do I handle workplace conflict professionally?",
    "Practice networking conversation skills with me",
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-semibold text-gray-900">Career Simulation</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <ChatInterface
          title="Career Simulation Assistant"
          description="Practice job interviews, workplace scenarios, and professional skills in a safe, supportive environment."
          icon={<Briefcase className="h-6 w-6 text-indigo-600" />}
          systemPrompt={systemPrompt}
          placeholderMessage="What career scenario would you like to practice?"
          suggestedQuestions={suggestedQuestions}
        />
      </main>
    </div>
  )
}
