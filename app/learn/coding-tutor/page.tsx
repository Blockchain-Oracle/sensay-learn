"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Code, Play, Send, CheckCircle, Circle, Lightbulb, MessageSquare } from "lucide-react"

export default function CodingTutorPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const [code, setCode] = useState(
    `// Welcome to JavaScript!\nfunction greetUser(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greetUser("World"));`,
  )
  const [output, setOutput] = useState("")

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "solidity", label: "Solidity" },
    { value: "rust", label: "Rust" },
    { value: "go", label: "Go" },
  ]

  const lessons = [
    { id: 1, title: "Variables and Data Types", completed: true, difficulty: "Beginner" },
    { id: 2, title: "Functions and Scope", completed: true, difficulty: "Beginner" },
    { id: 3, title: "Arrays and Objects", completed: false, difficulty: "Intermediate" },
    { id: 4, title: "Async Programming", completed: false, difficulty: "Advanced" },
    { id: 5, title: "Error Handling", completed: false, difficulty: "Intermediate" },
  ]

  const challenges = [
    { id: 1, title: "FizzBuzz Challenge", difficulty: "Easy", points: 100 },
    { id: 2, title: "Palindrome Checker", difficulty: "Medium", points: 200 },
    { id: 3, title: "Binary Tree Traversal", difficulty: "Hard", points: 500 },
  ]

  const hints = [
    "Remember to use const for variables that won't change",
    "Template literals use backticks and ${} for interpolation",
    "Don't forget to handle edge cases in your functions",
  ]

  const runCode = () => {
    try {
      // Simulate code execution
      setOutput("Hello, World!\n> Code executed successfully!")
    } catch (error) {
      setOutput(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
                <Code className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-semibold text-gray-900">Coding Tutor</span>
              </div>
            </div>

            {/* Language Selector */}
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
          {/* Left Panel - Lessons and Challenges */}
          <div className="col-span-3">
            <Tabs defaultValue="lessons" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
                <TabsTrigger value="challenges">Challenges</TabsTrigger>
              </TabsList>

              <TabsContent value="lessons" className="mt-4">
                <Card className="h-[calc(100vh-12rem)]">
                  <CardHeader>
                    <CardTitle className="text-lg">JavaScript Lessons</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        {lesson.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{lesson.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {lesson.difficulty}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="challenges" className="mt-4">
                <Card className="h-[calc(100vh-12rem)]">
                  <CardHeader>
                    <CardTitle className="text-lg">Coding Challenges</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{challenge.title}</p>
                          <Badge
                            variant={
                              challenge.difficulty === "Easy"
                                ? "default"
                                : challenge.difficulty === "Medium"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{challenge.points} points</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Center - Code Editor and AI Explanation */}
          <div className="col-span-6 space-y-4">
            {/* AI Explanation Area */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Functions in JavaScript:</strong> Functions are reusable blocks of code that perform
                    specific tasks. In this example, we're creating a function called `greetUser` that takes a parameter
                    `name` and returns a greeting message using template literals.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card className="flex-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Code Editor</CardTitle>
                  <div className="flex space-x-2">
                    <Button onClick={runCode} size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                    <Button variant="outline" size="sm">
                      Submit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="font-mono text-sm min-h-[200px] resize-none"
                  placeholder="Write your code here..."
                />

                {/* Output */}
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm min-h-[100px]">
                  <div className="text-gray-500 mb-2">Output:</div>
                  <pre>{output || "Click 'Run' to execute your code"}</pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Hints and Settings */}
          <div className="col-span-3 space-y-4">
            {/* Explanation Mode Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Advanced Mode</p>
                    <p className="text-xs text-gray-600">More detailed explanations</p>
                  </div>
                  <Switch checked={isAdvancedMode} onCheckedChange={setIsAdvancedMode} />
                </div>
              </CardContent>
            </Card>

            {/* Hints */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                  Hints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hints.map((hint, index) => (
                  <div key={index} className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                    <p className="text-sm">{hint}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Chat-based Help */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Ask for Help
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-gray-100 p-3 rounded">
                    <p className="text-sm">Need help with this concept? Ask me anything!</p>
                  </div>
                  <div className="flex space-x-2">
                    <Textarea placeholder="Type your question..." className="flex-1 min-h-[60px] resize-none" />
                    <Button size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
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
