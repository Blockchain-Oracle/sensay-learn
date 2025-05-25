"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  Upload,
  Brain,
  Users,
  Target,
  Moon,
  Sun,
  Plus,
  Share,
  Download,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Circle,
  BarChart3,
} from "lucide-react"
import ChatInterface from "@/components/chat-interface"

export default function StudyBuddyPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60) // 25 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [currentGoal, setCurrentGoal] = useState("Complete Math Chapter 5")

  const studySessions = [
    { id: 1, subject: "Mathematics", topic: "Calculus", duration: 90, date: "2024-01-15", completed: true },
    { id: 2, subject: "Physics", topic: "Quantum Mechanics", duration: 60, date: "2024-01-15", completed: false },
    { id: 3, subject: "Chemistry", topic: "Organic Compounds", duration: 45, date: "2024-01-16", completed: false },
  ]

  const weeklyProgress = [
    { subject: "Mathematics", hoursStudied: 8, targetHours: 10, progress: 80 },
    { subject: "Physics", hoursStudied: 6, targetHours: 8, progress: 75 },
    { subject: "Chemistry", hoursStudied: 4, targetHours: 6, progress: 67 },
  ]

  const recentNotes = [
    { id: 1, title: "Calculus Derivatives", content: "Key formulas and examples...", date: "2024-01-15" },
    { id: 2, title: "Physics Laws", content: "Newton's laws summary...", date: "2024-01-14" },
    { id: 3, title: "Chemistry Bonds", content: "Ionic vs covalent bonds...", date: "2024-01-13" },
  ]

  const studyGoals = [
    { id: 1, title: "Complete Math Chapter 5", progress: 75, deadline: "2024-01-20", priority: "high" },
    { id: 2, title: "Physics Lab Report", progress: 40, deadline: "2024-01-18", priority: "medium" },
    { id: 3, title: "Chemistry Quiz Prep", progress: 90, deadline: "2024-01-16", priority: "high" },
  ]

  const collaborators = [
    { id: 1, name: "Sarah Chen", subject: "Mathematics", status: "online" },
    { id: 2, name: "Mike Johnson", subject: "Physics", status: "offline" },
    { id: 3, name: "Emma Davis", subject: "Chemistry", status: "studying" },
  ]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const systemPrompt = `You are an AI-Powered Study Buddy. Your role is to:
- Help users plan effective study sessions and schedules
- Explain difficult topics and concepts in multiple ways
- Create study guides, summaries, and review materials
- Track learning progress and suggest improvements
- Provide study techniques and memory strategies
- Help with homework and assignment planning
- Offer motivation and accountability for study goals
- Adapt explanations to different learning styles
- Support document analysis and summarization
- Help create concept maps and visual learning aids

Be encouraging, organized, and focus on helping users develop effective study habits and understanding. Current goal: ${currentGoal}`

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <header
        className={`shadow-sm border-b transition-colors duration-300 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
      >
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
                <BookOpen className="h-6 w-6 text-pink-600" />
                <span className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Study Buddy
                </span>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Progress Overview */}
        <Card className={`mb-6 ${darkMode ? "bg-gray-800 border-gray-700" : ""}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Today's Progress</CardTitle>
              <Badge className="bg-pink-100 text-pink-700">Goal: {currentGoal}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>4.5h</div>
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Time Studied</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>3/5</div>
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Goals Completed</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>85%</div>
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Weekly Target</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>7</div>
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Study Streak</div>
              </div>
            </div>
            <Progress value={75} className="mt-4" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-16rem)]">
          {/* Left Panel - Calendar & Timer */}
          <div className="col-span-3 space-y-4">
            {/* Pomodoro Timer */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center ${darkMode ? "text-white" : ""}`}>
                  <Clock className="h-5 w-5 mr-2 text-pink-600" />
                  Pomodoro Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className={`text-4xl font-bold ${darkMode ? "text-white" : "text-pink-600"}`}>
                  {formatTime(pomodoroTime)}
                </div>
                <div className="flex justify-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    variant={isTimerRunning ? "destructive" : "default"}
                  >
                    {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setPomodoroTime(25 * 60)}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                <Select defaultValue="25">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="25">25 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Study Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Study Goals */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center ${darkMode ? "text-white" : ""}`}>
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Study Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {studyGoals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${darkMode ? "text-white" : ""}`}>{goal.title}</span>
                      <Badge variant={goal.priority === "high" ? "destructive" : "secondary"}>{goal.priority}</Badge>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Due: {goal.deadline}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center - Main Content */}
          <div className="col-span-6">
            <Tabs defaultValue="chat" className="h-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="chat">AI Chat</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="concept-map">Concept Map</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-4 h-[calc(100%-3rem)]">
                <Card className={`h-full ${darkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                  <CardHeader>
                    <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Study Assistant</CardTitle>
                  </CardHeader>
                  <div className="flex-1 px-6 pb-6">
                    <ChatInterface
                      title=""
                      description=""
                      icon={<></>}
                      systemPrompt={systemPrompt}
                      placeholderMessage="Ask me about any topic or upload a document for analysis..."
                      suggestedQuestions={[
                        "Help me create a study schedule for my exams",
                        "Explain photosynthesis in simple terms",
                        "Create flashcards for calculus derivatives",
                        "What are the best study techniques for memorization?",
                      ]}
                    />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <Card className={`h-full ${darkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                  <CardHeader>
                    <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Document Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Upload Area */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                    >
                      <Upload className={`h-12 w-12 mx-auto mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                      <p className={`text-lg font-medium mb-2 ${darkMode ? "text-white" : ""}`}>Upload Documents</p>
                      <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        PDF, Word, or text files for AI analysis
                      </p>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>

                    {/* Text Input */}
                    <div>
                      <label className={`text-sm font-medium mb-2 block ${darkMode ? "text-white" : ""}`}>
                        Or paste text directly:
                      </label>
                      <Textarea
                        placeholder="Paste your text here for summarization and analysis..."
                        className="min-h-[120px]"
                      />
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm">
                          <Brain className="h-4 w-4 mr-2" />
                          Summarize
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Create Flashcards
                        </Button>
                      </div>
                    </div>

                    {/* Recent Summaries */}
                    <div>
                      <h4 className={`font-medium mb-3 ${darkMode ? "text-white" : ""}`}>Recent Summaries</h4>
                      <div className="space-y-2">
                        <div
                          className={`p-3 rounded border ${darkMode ? "border-gray-600 bg-gray-700" : "bg-gray-50"}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-medium ${darkMode ? "text-white" : ""}`}>
                              Chapter 5: Calculus
                            </span>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Key concepts: derivatives, limits, continuity...
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="concept-map" className="mt-4">
                <Card className={`h-full ${darkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                  <CardHeader>
                    <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Concept Mapping</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`border rounded-lg p-8 text-center ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                    >
                      <Brain className={`h-16 w-16 mx-auto mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                      <p className={`text-lg font-medium mb-2 ${darkMode ? "text-white" : ""}`}>
                        Visual Concept Mapping
                      </p>
                      <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Create mind maps to organize and connect ideas
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Map
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="mt-4">
                <Card className={`h-full ${darkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                  <CardHeader>
                    <CardTitle className={`text-lg flex items-center ${darkMode ? "text-white" : ""}`}>
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Study Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Weekly Progress */}
                    <div>
                      <h4 className={`font-medium mb-3 ${darkMode ? "text-white" : ""}`}>Weekly Progress</h4>
                      <div className="space-y-3">
                        {weeklyProgress.map((subject, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className={darkMode ? "text-white" : ""}>{subject.subject}</span>
                              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                                {subject.hoursStudied}h / {subject.targetHours}h
                              </span>
                            </div>
                            <Progress value={subject.progress} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Study Patterns */}
                    <div>
                      <h4 className={`font-medium mb-3 ${darkMode ? "text-white" : ""}`}>Study Patterns</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                          <div className={`text-lg font-bold ${darkMode ? "text-white" : "text-blue-600"}`}>
                            9:00 AM
                          </div>
                          <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Peak Focus Time
                          </div>
                        </div>
                        <div className={`p-3 rounded ${darkMode ? "bg-gray-700" : "bg-green-50"}`}>
                          <div className={`text-lg font-bold ${darkMode ? "text-white" : "text-green-600"}`}>
                            45 min
                          </div>
                          <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Avg Session</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Notes & Collaboration */}
          <div className="col-span-3 space-y-4">
            {/* Quick Notes */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Quick Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea placeholder="Jot down quick notes..." className="min-h-[80px]" />
                <Button size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Save Note
                </Button>

                {/* Recent Notes */}
                <div className="space-y-2">
                  {recentNotes.slice(0, 3).map((note) => (
                    <div
                      key={note.id}
                      className={`p-2 rounded border ${darkMode ? "border-gray-600 bg-gray-700" : "bg-gray-50"}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${darkMode ? "text-white" : ""}`}>{note.title}</span>
                        <Button size="sm" variant="ghost">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {note.content.substring(0, 50)}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Study Group */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center ${darkMode ? "text-white" : ""}`}>
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Study Group
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          collaborator.status === "online"
                            ? "bg-green-500"
                            : collaborator.status === "studying"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                        }`}
                      />
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? "text-white" : ""}`}>{collaborator.name}</p>
                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {collaborator.subject}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Friends
                </Button>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {studySessions.map((session) => (
                  <div key={session.id} className="flex items-center space-x-3">
                    {session.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${darkMode ? "text-white" : ""}`}>{session.topic}</p>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {session.subject} • {session.duration}min
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
