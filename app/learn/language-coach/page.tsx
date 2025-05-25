"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Globe,
  Mic,
  Volume2,
  BookOpen,
  Users,
  Trophy,
  Flag,
  Star,
  Play,
  Plus,
  Heart,
  MessageCircle,
  Headphones,
  Moon,
  Sun,
  Save,
  Share,
} from "lucide-react"
import ChatInterface from "@/components/chat-interface"

export default function LanguageCoachPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("spanish")
  const [formalMode, setFormalMode] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [currentScenario, setCurrentScenario] = useState("")

  const languages = [
    { code: "spanish", name: "Spanish", flag: "🇪🇸", level: "Intermediate" },
    { code: "french", name: "French", flag: "🇫🇷", level: "Beginner" },
    { code: "german", name: "German", flag: "🇩🇪", level: "Beginner" },
    { code: "italian", name: "Italian", flag: "🇮🇹", level: "Advanced" },
    { code: "portuguese", name: "Portuguese", flag: "🇵🇹", level: "Beginner" },
    { code: "japanese", name: "Japanese", flag: "🇯🇵", level: "Beginner" },
    { code: "mandarin", name: "Mandarin", flag: "🇨🇳", level: "Intermediate" },
    { code: "arabic", name: "Arabic", flag: "🇸🇦", level: "Beginner" },
  ]

  const conversationScenarios = [
    {
      id: "restaurant",
      title: "Ordering at a Restaurant",
      difficulty: "Beginner",
      description: "Practice ordering food and drinks",
      phrases: ["I would like...", "Could I have...", "The check, please"],
    },
    {
      id: "hotel",
      title: "Hotel Check-in",
      difficulty: "Intermediate",
      description: "Check into a hotel and ask about amenities",
      phrases: ["I have a reservation", "What time is breakfast?", "Could you call a taxi?"],
    },
    {
      id: "shopping",
      title: "Shopping for Clothes",
      difficulty: "Beginner",
      description: "Buy clothes and ask about sizes",
      phrases: ["How much does this cost?", "Do you have this in size...?", "Can I try this on?"],
    },
    {
      id: "business",
      title: "Business Meeting",
      difficulty: "Advanced",
      description: "Professional conversation and presentations",
      phrases: ["Let me present...", "What are your thoughts on...?", "I'd like to schedule..."],
    },
  ]

  const vocabularyWords = [
    { word: "Hola", translation: "Hello", mastered: true, category: "Greetings" },
    { word: "Gracias", translation: "Thank you", mastered: true, category: "Politeness" },
    { word: "Restaurante", translation: "Restaurant", mastered: false, category: "Places" },
    { word: "Comida", translation: "Food", mastered: false, category: "Food" },
    { word: "Agua", translation: "Water", mastered: true, category: "Drinks" },
  ]

  const culturalInsights = [
    {
      title: "Spanish Meal Times",
      content: "In Spain, lunch is typically eaten between 2-4 PM, and dinner is served very late, often after 9 PM.",
      category: "Customs",
    },
    {
      title: "Formal vs Informal Address",
      content: "Use 'tú' for informal situations and 'usted' for formal or respectful address.",
      category: "Language",
    },
    {
      title: "Siesta Tradition",
      content: "Many Spanish businesses close for a few hours in the afternoon for the traditional siesta.",
      category: "Lifestyle",
    },
  ]

  const weeklyProgress = [
    { skill: "Speaking", progress: 75, target: 80 },
    { skill: "Listening", progress: 68, target: 75 },
    { skill: "Reading", progress: 82, target: 85 },
    { skill: "Writing", progress: 60, target: 70 },
  ]

  const currentLanguage = languages.find((lang) => lang.code === selectedLanguage)

  const systemPrompt = `You are a Language & Culture Learning Coach for ${currentLanguage?.name}. The user's current level is ${currentLanguage?.level}. Formal mode is ${formalMode ? "enabled" : "disabled"}. Current scenario: ${currentScenario || "general conversation"}. Your role is to:

- Teach ${currentLanguage?.name} through immersive, culturally rich conversations
- Explain grammar, vocabulary, and pronunciation in context
- Share cultural insights, customs, and etiquette
- Teach slang, idioms, and colloquial expressions appropriate to the formality level
- Provide conversation practice for real-world scenarios
- Adapt to different proficiency levels from beginner to advanced
- Make language learning engaging through cultural stories and context
- Help with pronunciation tips and language learning strategies
- Provide personalized feedback on grammar, vocabulary, and usage

Be patient, culturally sensitive, and make language learning fun and practical. Use ${formalMode ? "formal" : "informal"} language patterns.`

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
                <Globe className="h-6 w-6 text-violet-600" />
                <span className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Language Coach
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {lang.level}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Dark Mode Toggle */}
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                <Moon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Language Progress Bar */}
        <Card className={`mb-6 ${darkMode ? "bg-gray-800 border-gray-700" : ""}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{currentLanguage?.flag}</span>
                <div>
                  <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>
                    {currentLanguage?.name} Learning Progress
                  </CardTitle>
                  <Badge className="bg-violet-100 text-violet-700">{currentLanguage?.level}</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>127</div>
                  <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Words Learned</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>15</div>
                  <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Day Streak</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {weeklyProgress.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={darkMode ? "text-white" : ""}>{skill.skill}</span>
                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>{skill.progress}%</span>
                  </div>
                  <Progress value={skill.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-16rem)]">
          {/* Left Panel - Scenarios & Settings */}
          <div className="col-span-3 space-y-4">
            {/* Conversation Scenarios */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center ${darkMode ? "text-white" : ""}`}>
                  <MessageCircle className="h-5 w-5 mr-2 text-violet-600" />
                  Practice Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {conversationScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`p-3 rounded border cursor-pointer transition-colors ${
                      currentScenario === scenario.id
                        ? "border-violet-500 bg-violet-50"
                        : darkMode
                          ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                          : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setCurrentScenario(scenario.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${darkMode ? "text-white" : ""}`}>{scenario.title}</span>
                      <Badge
                        variant={
                          scenario.difficulty === "Beginner"
                            ? "default"
                            : scenario.difficulty === "Intermediate"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {scenario.difficulty}
                      </Badge>
                    </div>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{scenario.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Language Settings */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? "text-white" : ""}`}>Formal Mode</p>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Use formal language patterns
                    </p>
                  </div>
                  <Switch checked={formalMode} onCheckedChange={setFormalMode} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? "text-white" : ""}`}>Voice Feedback</p>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Pronunciation assistance
                    </p>
                  </div>
                  <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                </div>

                <Button className="w-full" size="sm">
                  <Mic className="h-4 w-4 mr-2" />
                  Voice Practice
                </Button>
              </CardContent>
            </Card>

            {/* Quick Phrases */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Quick Phrases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentScenario &&
                  conversationScenarios
                    .find((s) => s.id === currentScenario)
                    ?.phrases.map((phrase, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded cursor-pointer transition-colors ${
                          darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${darkMode ? "text-white" : ""}`}>{phrase}</span>
                          <Button size="sm" variant="ghost">
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
              </CardContent>
            </Card>
          </div>

          {/* Center - Main Content */}
          <div className="col-span-6">
            <Tabs defaultValue="conversation" className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
                <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
                <TabsTrigger value="culture">Culture</TabsTrigger>
              </TabsList>

              <TabsContent value="conversation" className="mt-4 h-[calc(100%-3rem)]">
                <Card className={`h-full ${darkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>
                        Language Practice Chat
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {currentScenario && (
                          <Badge className="bg-violet-100 text-violet-700">
                            {conversationScenarios.find((s) => s.id === currentScenario)?.title}
                          </Badge>
                        )}
                        <Badge variant={formalMode ? "default" : "secondary"}>
                          {formalMode ? "Formal" : "Informal"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <div className="flex-1 px-6 pb-6">
                    <ChatInterface
                      title=""
                      description=""
                      icon={<></>}
                      systemPrompt={systemPrompt}
                      placeholderMessage={`Practice ${currentLanguage?.name} conversation...`}
                      suggestedQuestions={[
                        "Help me practice ordering food in Spanish",
                        "Correct my pronunciation",
                        "Teach me common greetings",
                        "What's the difference between formal and informal?",
                      ]}
                    />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="vocabulary" className="mt-4">
                <Card className={`h-full ${darkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className={`text-lg flex items-center ${darkMode ? "text-white" : ""}`}>
                        <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                        Vocabulary Builder
                      </CardTitle>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Word
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Search */}
                    <Input placeholder="Search vocabulary..." />

                    {/* Vocabulary List */}
                    <div className="space-y-3">
                      {vocabularyWords.map((word, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded border ${darkMode ? "border-gray-600 bg-gray-700" : "bg-gray-50"}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className={`text-lg font-medium ${darkMode ? "text-white" : ""}`}>{word.word}</span>
                              {word.mastered && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                            </div>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost">
                                <Volume2 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {word.translation}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {word.category}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Flashcard Practice */}
                    <div className="pt-4 border-t">
                      <Button className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Start Flashcard Practice
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="culture" className="mt-4">
                <Card className={`h-full ${darkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                  <CardHeader>
                    <CardTitle className={`text-lg flex items-center ${darkMode ? "text-white" : ""}`}>
                      <Flag className="h-5 w-5 mr-2 text-red-600" />
                      Cultural Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {culturalInsights.map((insight, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded border ${darkMode ? "border-gray-600 bg-gray-700" : "bg-blue-50 border-blue-200"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-medium ${darkMode ? "text-white" : ""}`}>{insight.title}</h4>
                          <Badge variant="outline">{insight.category}</Badge>
                        </div>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-700"}`}>{insight.content}</p>
                      </div>
                    ))}

                    {/* Cultural Videos/Articles Placeholder */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                    >
                      <Globe className={`h-12 w-12 mx-auto mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                      <p className={`text-lg font-medium mb-2 ${darkMode ? "text-white" : ""}`}>
                        Cultural Immersion Content
                      </p>
                      <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Videos, articles, and interactive activities
                      </p>
                      <Button>Explore Culture</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Progress & Tools */}
          <div className="col-span-3 space-y-4">
            {/* Pronunciation Practice */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center ${darkMode ? "text-white" : ""}`}>
                  <Headphones className="h-5 w-5 mr-2 text-green-600" />
                  Pronunciation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`p-3 rounded ${darkMode ? "bg-gray-700" : "bg-green-50"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${darkMode ? "text-white" : ""}`}>"¿Cómo está usted?"</span>
                    <Button size="sm" variant="ghost">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>KOH-moh ehs-TAH oos-TEHD</p>
                </div>

                <Button className="w-full" size="sm">
                  <Mic className="h-4 w-4 mr-2" />
                  Record & Compare
                </Button>

                <div className="text-center">
                  <div className={`text-lg font-bold ${darkMode ? "text-white" : "text-green-600"}`}>85%</div>
                  <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Pronunciation Accuracy
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Streak */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center ${darkMode ? "text-white" : ""}`}>
                  <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                  Learning Streak
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <div className={`text-3xl font-bold ${darkMode ? "text-white" : "text-yellow-600"}`}>15</div>
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Days in a row!</div>
                <Progress value={75} className="h-2" />
                <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  5 more days to reach your goal
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Save className="h-4 w-4 mr-2" />
                  Save Conversation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share className="h-4 w-4 mr-2" />
                  Share Progress
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Study Guide
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Find Language Partner
                </Button>
              </CardContent>
            </Card>

            {/* Daily Goal */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Daily Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? "text-white" : ""}>Practice Time</span>
                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>18/30 min</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  <div className={`text-xs text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    12 minutes left to reach your daily goal
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
