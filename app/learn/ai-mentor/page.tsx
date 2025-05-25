import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Brain, Target, BookOpen, Video, FileText, Award, TrendingUp, Plus } from "lucide-react"
import ChatInterface from "@/components/chat-interface"

export default function AIMentorPage() {
  const systemPrompt = `You are an AI Mentor for lifelong learning. Your role is to:
- Assess the user's current knowledge and learning goals
- Create personalized learning paths based on their interests and objectives
- Provide guidance, motivation, and support throughout their learning journey
- Suggest resources, techniques, and strategies for effective learning
- Help users overcome learning obstacles and stay motivated
- Adapt your teaching style to match the user's preferred learning methods

Be encouraging, patient, and insightful. Ask thoughtful questions to understand their goals and provide actionable advice.`

  const learningGoals = [
    { id: 1, title: "Learn Web Development", progress: 65, status: "active" },
    { id: 2, title: "Improve Finance Literacy", progress: 30, status: "active" },
    { id: 3, title: "Master Data Science", progress: 85, status: "completed" },
    { id: 4, title: "Learn Spanish", progress: 45, status: "active" },
  ]

  const milestones = [
    { title: "Completed HTML/CSS Basics", date: "2 days ago", completed: true },
    { title: "JavaScript Fundamentals", date: "In progress", completed: false },
    { title: "Build First React App", date: "Upcoming", completed: false },
  ]

  const resources = [
    { type: "video", title: "JavaScript ES6 Features", duration: "45 min" },
    { type: "article", title: "React Best Practices Guide", readTime: "12 min" },
    { type: "quiz", title: "CSS Flexbox Challenge", questions: 15 },
  ]

  const weeklyProgress = [
    { week: "Week 1", hours: 8 },
    { week: "Week 2", hours: 12 },
    { week: "Week 3", hours: 15 },
    { week: "Week 4", hours: 10 },
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
              <Brain className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-semibold text-gray-900">AI Mentor</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
          {/* Left Sidebar - Learning Goals */}
          <div className="col-span-3">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Learning Goals</CardTitle>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {learningGoals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{goal.title}</span>
                      <Badge variant={goal.status === "completed" ? "default" : "secondary"}>{goal.progress}%</Badge>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center - AI Mentor Chat */}
          <div className="col-span-6">
            <Card className="h-full flex flex-col">
              {/* Mentor Avatar */}
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder.svg?height=64&width=64" />
                    <AvatarFallback className="bg-purple-100 text-purple-600 text-xl">
                      <Brain className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold">Alex - Your AI Mentor</h2>
                    <p className="text-sm text-gray-600">Ready to guide your learning journey</p>
                  </div>
                </div>
              </CardHeader>

              <div className="flex-1 px-6 pb-6">
                <ChatInterface
                  title=""
                  description=""
                  icon={<></>}
                  systemPrompt={systemPrompt}
                  placeholderMessage="Tell me about your learning goals or ask for guidance..."
                  suggestedQuestions={[
                    "Help me create a learning plan for web development",
                    "I'm struggling with motivation, can you help?",
                    "What's the best way to learn JavaScript?",
                    "How can I track my progress better?",
                  ]}
                />
              </div>
            </Card>
          </div>

          {/* Right Panel - Milestones, Resources, Progress */}
          <div className="col-span-3 space-y-4">
            {/* Learning Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-600" />
                  Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full mt-1 ${milestone.completed ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{milestone.title}</p>
                      <p className="text-xs text-gray-500">{milestone.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    {resource.type === "video" && <Video className="h-4 w-4 text-red-500" />}
                    {resource.type === "article" && <FileText className="h-4 w-4 text-blue-500" />}
                    {resource.type === "quiz" && <Target className="h-4 w-4 text-green-500" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{resource.title}</p>
                      <p className="text-xs text-gray-500">
                        {resource.duration || resource.readTime || `${resource.questions} questions`}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {weeklyProgress.map((week, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{week.week}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(week.hours / 15) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{week.hours}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
