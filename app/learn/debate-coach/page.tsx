"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, MessageSquare, Timer, Trophy, Shuffle, Play, Pause, RotateCcw } from "lucide-react"
import ChatInterface from "@/components/chat-interface"

export default function DebateCoachPage() {
  const [selectedTopic, setSelectedTopic] = useState("")
  const [debatePhase, setDebatePhase] = useState<"preparation" | "opening" | "rebuttal" | "closing">("preparation")
  const [timer, setTimer] = useState(180) // 3 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [scores, setScores] = useState({
    structure: 75,
    logic: 68,
    evidence: 82,
    delivery: 70,
  })

  const topics = [
    "Technology in education improves learning outcomes",
    "Remote work is more productive than office work",
    "Social media has a net positive impact on society",
    "Artificial intelligence will create more jobs than it destroys",
    "Climate change is the most pressing global issue",
    "Universal basic income should be implemented globally",
    "Space exploration is worth the investment",
    "Genetic engineering should be allowed in humans",
  ]

  const debatePhases = [
    { id: "preparation", label: "Preparation", duration: 300 },
    { id: "opening", label: "Opening Statement", duration: 180 },
    { id: "rebuttal", label: "Rebuttal", duration: 120 },
    { id: "closing", label: "Closing Argument", duration: 120 },
  ]

  const tips = [
    "Start with a clear thesis statement",
    "Use the PEEL structure: Point, Evidence, Explanation, Link",
    "Address counterarguments proactively",
    "Use credible sources and statistics",
    "Maintain confident body language",
    "Listen carefully to your opponent's arguments",
  ]

  const rebuttals = [
    "That's an interesting point, but have you considered...",
    "While I understand your perspective, the evidence suggests...",
    "Your argument assumes that..., but in reality...",
    "I'd like to challenge that assumption because...",
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1)
      }, 1000)
    } else if (timer === 0) {
      setIsTimerRunning(false)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timer])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const generateRandomTopic = () => {
    const randomTopic = topics[Math.floor(Math.random() * topics.length)]
    setSelectedTopic(randomTopic)
  }

  const resetTimer = () => {
    const currentPhase = debatePhases.find((p) => p.id === debatePhase)
    setTimer(currentPhase?.duration || 180)
    setIsTimerRunning(false)
  }

  const systemPrompt = `You are an AI Debate Coach. The current debate topic is: "${selectedTopic}". The debate phase is: ${debatePhase}. Your role is to:
- Provide real-time coaching on argumentation and debate structure
- Evaluate arguments for logic, evidence, and persuasiveness
- Suggest improvements for delivery and presentation
- Help structure arguments using debate frameworks
- Provide counterargument strategies
- Give constructive feedback on debate performance

Be analytical, constructive, and help build strong argumentation skills.`

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
              <MessageSquare className="h-6 w-6 text-red-600" />
              <span className="text-xl font-semibold text-gray-900">Debate Coach</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Topic Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Debate Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a debate topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic, index) => (
                    <SelectItem key={index} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={generateRandomTopic} variant="outline">
                <Shuffle className="h-4 w-4 mr-2" />
                Random
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-16rem)]">
          {/* Left Panel - Timer and Phase Control */}
          <div className="col-span-3 space-y-4">
            {/* Timer */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Timer className="h-5 w-5 mr-2 text-blue-600" />
                  Speaking Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-4xl font-bold text-blue-600">{formatTime(timer)}</div>
                <div className="flex justify-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    variant={isTimerRunning ? "destructive" : "default"}
                  >
                    {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetTimer}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Debate Phases */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Debate Phases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {debatePhases.map((phase) => (
                  <Button
                    key={phase.id}
                    variant={debatePhase === phase.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => {
                      setDebatePhase(phase.id as any)
                      setTimer(phase.duration)
                      setIsTimerRunning(false)
                    }}
                  >
                    {phase.label}
                    <Badge variant="secondary" className="ml-auto">
                      {Math.floor(phase.duration / 60)}m
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Current Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(scores).map(([category, score]) => (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{category}</span>
                      <span>{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center - Debate Chat */}
          <div className="col-span-6">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Debate Arena</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Phase: {debatePhase}</Badge>
                    {selectedTopic && (
                      <Badge className="bg-red-100 text-red-700 max-w-xs truncate">{selectedTopic}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <div className="flex-1 px-6 pb-6">
                <ChatInterface
                  title=""
                  description=""
                  icon={<></>}
                  systemPrompt={systemPrompt}
                  placeholderMessage="Present your argument or ask for coaching..."
                  suggestedQuestions={[
                    "Help me structure my opening statement",
                    "How can I strengthen this argument?",
                    "What are potential counterarguments?",
                    "Give me feedback on my delivery",
                  ]}
                />
              </div>
            </Card>
          </div>

          {/* Right Panel - Tips and Rebuttals */}
          <div className="col-span-3 space-y-4">
            {/* Debate Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Debate Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tips.map((tip, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                    <p className="text-sm">{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Rebuttal Starters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rebuttal Starters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {rebuttals.map((rebuttal, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <p className="text-sm italic">"{rebuttal}"</p>
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
