"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Accessibility, Type, Mic, Eye, Volume2, Repeat, Zap, ImageIcon } from "lucide-react"
import ChatInterface from "@/components/chat-interface"

export default function AdaptiveLearningPage() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [learningStyle, setLearningStyle] = useState("")
  const [fontSize, setFontSize] = useState([16])
  const [highContrast, setHighContrast] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [readingSpeed, setReadingSpeed] = useState("normal")

  const learningStyles = [
    {
      id: "visual",
      title: "Visual Learner",
      description: "I learn best with images, diagrams, and visual aids",
      icon: Eye,
      color: "bg-blue-100 text-blue-600 border-blue-200",
    },
    {
      id: "auditory",
      title: "Auditory Learner",
      description: "I prefer listening and verbal explanations",
      icon: Volume2,
      color: "bg-green-100 text-green-600 border-green-200",
    },
    {
      id: "kinesthetic",
      title: "Kinesthetic Learner",
      description: "I learn through hands-on activities and movement",
      icon: Zap,
      color: "bg-purple-100 text-purple-600 border-purple-200",
    },
    {
      id: "reading",
      title: "Reading/Writing Learner",
      description: "I prefer text-based learning and note-taking",
      icon: Type,
      color: "bg-orange-100 text-orange-600 border-orange-200",
    },
  ]

  const feedbackOptions = [
    { id: "too-fast", label: "Too Fast", icon: Zap },
    { id: "repeat", label: "Repeat That", icon: Repeat },
    { id: "show-visual", label: "Show Visual", icon: ImageIcon },
    { id: "simplify", label: "Simplify", icon: Type },
  ]

  const systemPrompt = `You are an Adaptive Learning specialist for Special Needs. The user's learning style is: ${learningStyle}. Their preferences: font size ${fontSize[0]}px, high contrast: ${highContrast}, voice enabled: ${voiceEnabled}, reading speed: ${readingSpeed}. 

Adapt your responses based on their learning style:
- Visual: Use descriptions of images, diagrams, and visual metaphors
- Auditory: Focus on verbal explanations and sound-based learning
- Kinesthetic: Suggest hands-on activities and movement-based learning
- Reading/Writing: Provide text-based explanations and encourage note-taking

Your role is to:
- Personalize content delivery for various learning challenges and disabilities
- Adapt explanation styles for different cognitive abilities and learning preferences
- Provide multi-sensory learning approaches when appropriate
- Support learners with ADHD, dyslexia, autism, and other learning differences
- Break down complex information into manageable, accessible chunks
- Offer alternative ways to understand and process information
- Be patient, encouraging, and celebrate small victories

Always be inclusive, respectful, and focus on individual strengths and capabilities.`

  const handleFeedback = (feedbackType: string) => {
    // In a real implementation, this would adjust the AI's response style
    console.log(`User feedback: ${feedbackType}`)
  }

  if (!hasCompletedOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Accessibility className="h-6 w-6 text-teal-600" />
                <span className="text-xl font-semibold text-gray-900">Adaptive Learning</span>
              </div>
            </div>
          </div>
        </header>

        {/* Onboarding */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">Let's Personalize Your Learning Experience</h1>
            <p className="text-base md:text-lg text-gray-600 mb-8 md:mb-12">
              Help us understand how you learn best so we can adapt our teaching style to your needs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
              {learningStyles.map((style) => {
                const IconComponent = style.icon
                return (
                  <Card
                    key={style.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      learningStyle === style.id ? "ring-2 ring-teal-500 bg-teal-50" : "hover:-translate-y-1"
                    }`}
                    onClick={() => setLearningStyle(style.id)}
                  >
                    <CardHeader className="text-center">
                      <div
                        className={`w-12 h-12 md:w-16 md:h-16 rounded-lg ${style.color} flex items-center justify-center mx-auto mb-3 md:mb-4`}
                      >
                        <IconComponent className="h-6 w-6 md:h-8 md:w-8" />
                      </div>
                      <CardTitle className="text-lg md:text-xl">{style.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{style.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {learningStyle && (
              <div className="space-y-6 md:space-y-8">
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="text-xl">Additional Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Reading Speed</label>
                      <Select value={readingSpeed} onValueChange={setReadingSpeed}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="slow">Slow - Take your time</SelectItem>
                          <SelectItem value="normal">Normal - Standard pace</SelectItem>
                          <SelectItem value="fast">Fast - Quick explanations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Voice Assistance</p>
                        <p className="text-xs text-gray-600">Enable text-to-speech</p>
                      </div>
                      <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">High Contrast Mode</p>
                        <p className="text-xs text-gray-600">Easier to read text</p>
                      </div>
                      <Switch checked={highContrast} onCheckedChange={setHighContrast} />
                    </div>
                  </CardContent>
                </Card>

                <Button size="lg" onClick={() => setHasCompletedOnboarding(true)} className="px-6 md:px-8 py-2 md:py-3">
                  Start Learning
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${highContrast ? "bg-black text-white" : "bg-gray-50"}`}>
      {/* Header */}
      <header className={`${highContrast ? "bg-gray-900 border-gray-700" : "bg-white"} shadow-sm border-b sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Accessibility className="h-6 w-6 text-teal-600" />
                <span className="text-xl font-semibold">Adaptive Learning</span>
              </div>
            </div>

            <Badge className="bg-teal-100 text-teal-700 hidden sm:flex">
              {learningStyles.find((s) => s.id === learningStyle)?.title}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6">
          {/* Mobile Accessibility Badge - only shown on mobile */}
          <div className="lg:hidden w-full mb-2">
            <Badge className="bg-teal-100 text-teal-700">
              {learningStyles.find((s) => s.id === learningStyle)?.title}
            </Badge>
          </div>
          
          {/* Left Panel - Accessibility Tools */}
          <div className="w-full lg:col-span-3 order-2 lg:order-1">
            <Card className={highContrast ? "bg-gray-900 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className="text-lg">Accessibility Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Font Size */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Font Size: {fontSize[0]}px</label>
                  <Slider value={fontSize} onValueChange={setFontSize} max={24} min={12} step={1} className="w-full" />
                </div>

                {/* Voice Controls */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Voice Assistance</p>
                    <p className="text-xs text-gray-600">Text-to-speech</p>
                  </div>
                  <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                </div>

                {/* High Contrast */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">High Contrast</p>
                    <p className="text-xs text-gray-600">Better visibility</p>
                  </div>
                  <Switch checked={highContrast} onCheckedChange={setHighContrast} />
                </div>

                {/* Reading Speed */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Reading Speed</label>
                  <Select value={readingSpeed} onValueChange={setReadingSpeed}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Voice Input */}
                <Button variant="outline" className="w-full">
                  <Mic className="h-4 w-4 mr-2" />
                  Voice Input
                </Button>

                {/* Reset Preferences */}
                <Button variant="outline" onClick={() => setHasCompletedOnboarding(false)} className="w-full">
                  Change Learning Style
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Center - Adaptive Chat */}
          <div className="w-full lg:col-span-6 order-1 lg:order-2">
            <Card className={highContrast ? "bg-gray-900 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className="text-lg">Personalized Learning Assistant</CardTitle>
                <p className="text-sm text-gray-600">
                  Content adapted for {learningStyles.find((s) => s.id === learningStyle)?.title.toLowerCase()}
                </p>
              </CardHeader>

              <div className="flex-1 px-4 md:px-6 pb-6" style={{ fontSize: `${fontSize[0]}px` }}>
                <ChatInterface
                  title=""
                  description=""
                  icon={<></>}
                  systemPrompt={systemPrompt}
                  placeholderMessage="Tell me what you'd like to learn about..."
                  suggestedQuestions={[
                    "I have ADHD and struggle with focus, can you help?",
                    "How can I learn math with dyslexia?",
                    "I need visual learning strategies",
                    "Help me break down complex topics",
                  ]}
                />
              </div>
            </Card>
          </div>

          {/* Right Panel - Feedback Bar */}
          <div className="w-full lg:col-span-3 order-3">
            <Card className={highContrast ? "bg-gray-900 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className="text-lg">Learning Feedback</CardTitle>
                <p className="text-sm text-gray-600">Help us adapt to your needs</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-col sm:space-y-2 lg:space-y-3">
                  {feedbackOptions.map((option) => {
                    const IconComponent = option.icon
                    return (
                      <Button
                        key={option.id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleFeedback(option.id)}
                      >
                        <IconComponent className="h-4 w-4 mr-2" />
                        {option.label}
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Learning Progress */}
            <Card className={`mt-4 ${highContrast ? "bg-gray-900 border-gray-700" : ""}`}>
              <CardHeader>
                <CardTitle className="text-lg">Today's Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Concepts Learned</span>
                    <span>3/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Time Spent</span>
                    <span>25 min</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "83%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
