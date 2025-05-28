"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Brain, BookOpen, Award, TrendingUp, Plus } from "lucide-react"
import ChatInterface from "@/components/chat-interface"
import { YouTubeRecommendations } from "@/components/youtube-recommendations"
import { EducationalContent } from "@/components/educational-content"
import { useUserProgress, useAchievements } from "@/hooks/use-live-data"
import { useAuth } from "@/hooks/use-auth"

export default function AIMentorPage() {
  const { user } = useAuth()
  const userId = user?.id || ""

  const { progress, isLoading: progressLoading } = useUserProgress(userId, 30)
  const { achievements, isLoading: achievementsLoading } = useAchievements(userId)

  const [currentTopic, setCurrentTopic] = useState("web development")
  const [userLevel, setUserLevel] = useState("beginner")

  const systemPrompt = `You are an AI Mentor for lifelong learning. Your role is to:
- Assess the user's current knowledge and learning goals
- Create personalized learning paths based on their interests and objectives
- Provide guidance, motivation, and support throughout their learning journey
- Suggest resources, techniques, and strategies for effective learning
- Help users overcome learning obstacles and stay motivated
- Adapt your teaching style to match the user's preferred learning methods

Current topic focus: ${currentTopic}
User level: ${userLevel}

Be encouraging, patient, and insightful. Ask thoughtful questions to understand their goals and provide actionable advice.`

  // Process live data
  const learningGoals = progress?.filter((p) => p.metricName === "learning_goals") || []
  const weeklyProgress = progress?.filter((p) => p.metricName === "weekly_progress") || []
  const recentAchievements = achievements?.slice(0, 3) || []

  const milestones = [
    { title: "Set Learning Goals", date: "Completed", completed: learningGoals.length > 0 },
    {
      title: "First Study Session",
      date: weeklyProgress.length > 0 ? "Completed" : "In progress",
      completed: weeklyProgress.length > 0,
    },
    { title: "Weekly Goal Achievement", date: "Upcoming", completed: false },
  ]

  const resources = [
    { type: "video", title: "Getting Started with Learning", duration: "15 min" },
    { type: "article", title: "Effective Study Techniques", readTime: "8 min" },
    { type: "quiz", title: "Learning Style Assessment", questions: 10 },
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
                {progressLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-2 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : learningGoals.length > 0 ? (
                  learningGoals.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{goal.metricName}</span>
                        <Badge variant="secondary">{Math.round(Number(goal.metricValue))}%</Badge>
                      </div>
                      <Progress value={Number(goal.metricValue)} className="h-2" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-3">No learning goals set yet</p>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Goal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center - AI Mentor Chat */}
          <div className="col-span-6">
            <Tabs defaultValue="chat" className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat">AI Mentor</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="recommendations">Videos</TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-4 h-[calc(100%-3rem)]">
                <Card className="h-full flex flex-col">
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
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">Topic: {currentTopic}</Badge>
                          <Badge variant="outline">Level: {userLevel}</Badge>
                        </div>
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
              </TabsContent>

              <TabsContent value="resources" className="mt-4">
                <EducationalContent topic={currentTopic} userId={userId} maxResults={5} />
              </TabsContent>

              <TabsContent value="recommendations" className="mt-4">
                <YouTubeRecommendations
                  topic={currentTopic}
                  learningMode="ai-mentor"
                  userLevel={userLevel}
                  userId={userId}
                  maxResults={6}
                />
              </TabsContent>
            </Tabs>
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

            {/* Recent Achievements */}
            {!achievementsLoading && recentAchievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-600" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentAchievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded">
                      <Award className="h-4 w-4 text-yellow-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{achievement.achievement.name}</p>
                        <p className="text-xs text-gray-500">{new Date(achievement.earnedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Quick Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    {resource.type === "video" && <div className="w-4 h-4 bg-red-500 rounded" />}
                    {resource.type === "article" && <div className="w-4 h-4 bg-blue-500 rounded" />}
                    {resource.type === "quiz" && <div className="w-4 h-4 bg-green-500 rounded" />}
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

            {/* Topic & Level Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Focus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Current Topic</label>
                  <select
                    value={currentTopic}
                    onChange={(e) => setCurrentTopic(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="web development">Web Development</option>
                    <option value="data science">Data Science</option>
                    <option value="machine learning">Machine Learning</option>
                    <option value="programming">Programming</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Level</label>
                  <select
                    value={userLevel}
                    onChange={(e) => setUserLevel(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
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
                {progressLoading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                        <div className="h-2 bg-gray-200 rounded w-20 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : weeklyProgress.length > 0 ? (
                  <div className="space-y-2">
                    {weeklyProgress.slice(0, 4).map((week, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">Day {index + 1}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${Math.min(100, Number(week.metricValue))}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{Math.round(Number(week.metricValue))}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">Start learning to see your progress!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
