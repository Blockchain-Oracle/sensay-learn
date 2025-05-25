"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Heart, Smile, Frown, Meh, Zap, Moon, Volume2, VolumeX } from "lucide-react"
import ChatInterface from "@/components/chat-interface"

export default function MindfulnessCoachPage() {
  const [selectedMood, setSelectedMood] = useState("")
  const [completedExercises, setCompletedExercises] = useState<number[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)

  const moods = [
    { id: "happy", label: "Happy", icon: Smile, color: "bg-green-100 text-green-600 border-green-200" },
    { id: "stressed", label: "Stressed", icon: Zap, color: "bg-red-100 text-red-600 border-red-200" },
    { id: "tired", label: "Tired", icon: Moon, color: "bg-blue-100 text-blue-600 border-blue-200" },
    { id: "neutral", label: "Neutral", icon: Meh, color: "bg-gray-100 text-gray-600 border-gray-200" },
    { id: "anxious", label: "Anxious", icon: Frown, color: "bg-orange-100 text-orange-600 border-orange-200" },
  ]

  const exercises = [
    {
      id: 1,
      title: "4-7-8 Breathing",
      duration: "5 min",
      category: "Breathing",
      description: "Inhale for 4, hold for 7, exhale for 8",
    },
    {
      id: 2,
      title: "Body Scan Meditation",
      duration: "10 min",
      category: "Meditation",
      description: "Progressive relaxation from head to toe",
    },
    {
      id: 3,
      title: "Gratitude Journaling",
      duration: "8 min",
      category: "Journaling",
      description: "Write down 3 things you're grateful for",
    },
    {
      id: 4,
      title: "Mindful Walking",
      duration: "15 min",
      category: "Movement",
      description: "Focus on each step and breath",
    },
    {
      id: 5,
      title: "Progressive Muscle Relaxation",
      duration: "12 min",
      category: "Relaxation",
      description: "Tense and release muscle groups",
    },
    {
      id: 6,
      title: "Loving-Kindness Meditation",
      duration: "7 min",
      category: "Meditation",
      description: "Send compassion to yourself and others",
    },
  ]

  const systemPrompt = `You are a Mindfulness & Mental Health Coach. Based on the user's selected mood (${selectedMood || "not selected"}), provide personalized guidance. Your role is to:
- Guide users through stress relief and relaxation techniques
- Provide mindfulness exercises and meditation guidance
- Help users develop emotional awareness and regulation skills
- Offer coping strategies for anxiety, stress, and difficult emotions
- Teach breathing exercises and grounding techniques
- Support mental well-being through positive psychology approaches
- Adapt guidance based on the user's current emotional state

Be compassionate, non-judgmental, and supportive. Always encourage professional help when needed.`

  const toggleExercise = (exerciseId: number) => {
    setCompletedExercises((prev) =>
      prev.includes(exerciseId) ? prev.filter((id) => id !== exerciseId) : [...prev, exerciseId],
    )
  }

  const getMoodBasedSuggestions = () => {
    switch (selectedMood) {
      case "stressed":
        return [
          "Guide me through a breathing exercise",
          "I need help calming down",
          "What's a quick stress relief technique?",
        ]
      case "tired":
        return [
          "Help me with gentle energizing exercises",
          "I'm exhausted, what can help?",
          "Guide me through a body scan",
        ]
      case "anxious":
        return ["I'm feeling anxious, can you help?", "Teach me grounding techniques", "Help me with worry management"]
      default:
        return ["How are you feeling today?", "Guide me through a mindfulness exercise", "Help me practice gratitude"]
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Floating animation elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur shadow-sm border-b relative z-10">
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
                <Heart className="h-6 w-6 text-green-600" />
                <span className="text-xl font-semibold text-gray-900">Mindfulness Coach</span>
              </div>
            </div>

            {/* Sound Toggle */}
            <Button variant="outline" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Mood Selector */}
        <Card className="mb-6 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">How are you feeling today?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {moods.map((mood) => {
                const IconComponent = mood.icon
                return (
                  <Button
                    key={mood.id}
                    variant={selectedMood === mood.id ? "default" : "outline"}
                    className={`${mood.color} ${selectedMood === mood.id ? "ring-2 ring-green-500" : ""}`}
                    onClick={() => setSelectedMood(mood.id)}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {mood.label}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-16rem)]">
          {/* Left Panel - Exercises */}
          <div className="col-span-4">
            <Card className="h-full bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Mindfulness Exercises</CardTitle>
                <p className="text-sm text-gray-600">
                  {completedExercises.length} of {exercises.length} completed today
                </p>
              </CardHeader>
              <CardContent className="space-y-3 overflow-y-auto">
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-start space-x-3 p-3 hover:bg-green-50 rounded border">
                    <Checkbox
                      checked={completedExercises.includes(exercise.id)}
                      onCheckedChange={() => toggleExercise(exercise.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium">{exercise.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {exercise.duration}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{exercise.description}</p>
                      <Badge variant="secondary" className="text-xs">
                        {exercise.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center - AI Chat */}
          <div className="col-span-8">
            <Card className="h-full bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Your Mindfulness Guide</CardTitle>
                    {selectedMood && (
                      <p className="text-sm text-gray-600">
                        Personalized guidance for when you're feeling {selectedMood}
                      </p>
                    )}
                  </div>
                  {selectedMood && (
                    <Badge className="bg-green-100 text-green-700">
                      Mood: {moods.find((m) => m.id === selectedMood)?.label}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <div className="flex-1 px-6 pb-6">
                <ChatInterface
                  title=""
                  description=""
                  icon={<></>}
                  systemPrompt={systemPrompt}
                  placeholderMessage="Tell me how you're feeling or ask for guidance..."
                  suggestedQuestions={getMoodBasedSuggestions()}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Breathing Animation Overlay */}
        {selectedMood === "stressed" && (
          <div className="fixed bottom-8 right-8 z-20">
            <div className="relative">
              <div className="w-20 h-20 bg-green-400 rounded-full opacity-30 animate-ping"></div>
              <div className="absolute inset-0 w-20 h-20 bg-green-500 rounded-full opacity-50 animate-pulse"></div>
              <div className="absolute inset-2 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                Breathe
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
