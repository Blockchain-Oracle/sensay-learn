"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Users, Search, Clock, BookOpen, MessageCircle } from "lucide-react"
import ChatInterface from "@/components/chat-interface"

export default function HistoricalFiguresPage() {
  const [selectedFigure, setSelectedFigure] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const historicalFigures = [
    {
      id: 1,
      name: "Albert Einstein",
      era: "1879-1955",
      field: "Physics",
      image: "/placeholder.svg?height=80&width=80",
      description: "Theoretical physicist who developed the theory of relativity",
      timeline: ["1879: Born in Germany", "1905: Special Relativity", "1915: General Relativity", "1921: Nobel Prize"],
      facts: [
        "Developed E=mc²",
        "Won Nobel Prize in Physics",
        "Fled Nazi Germany in 1933",
        "Helped develop quantum theory",
      ],
    },
    {
      id: 2,
      name: "Cleopatra VII",
      era: "69-30 BCE",
      field: "Egyptian Queen",
      image: "/placeholder.svg?height=80&width=80",
      description: "Last active pharaoh of Ptolemaic Egypt",
      timeline: ["69 BCE: Born", "51 BCE: Became pharaoh", "48 BCE: Met Julius Caesar", "30 BCE: Death"],
      facts: [
        "Spoke nine languages",
        "Highly educated in mathematics and philosophy",
        "Allied with Julius Caesar and Mark Antony",
        "Last pharaoh of Egypt",
      ],
    },
    {
      id: 3,
      name: "Leonardo da Vinci",
      era: "1452-1519",
      field: "Renaissance Artist",
      image: "/placeholder.svg?height=80&width=80",
      description: "Italian polymath of the Renaissance period",
      timeline: ["1452: Born in Italy", "1482: Moved to Milan", "1503: Painted Mona Lisa", "1519: Death in France"],
      facts: [
        "Painted the Mona Lisa",
        "Designed flying machines",
        "Studied human anatomy",
        "Master of multiple disciplines",
      ],
    },
    {
      id: 4,
      name: "Martin Luther King Jr.",
      era: "1929-1968",
      field: "Civil Rights Leader",
      image: "/placeholder.svg?height=80&width=80",
      description: "American civil rights activist and minister",
      timeline: ["1929: Born", "1955: Montgomery Bus Boycott", "1963: 'I Have a Dream' speech", "1968: Assassination"],
      facts: [
        "Led Montgomery Bus Boycott",
        "Delivered 'I Have a Dream' speech",
        "Won Nobel Peace Prize in 1964",
        "Advocated for nonviolent resistance",
      ],
    },
    {
      id: 5,
      name: "Socrates",
      era: "470-399 BCE",
      field: "Greek Philosopher",
      image: "/placeholder.svg?height=80&width=80",
      description: "Classical Greek philosopher and founder of Western philosophy",
      timeline: ["470 BCE: Born", "450 BCE: Began teaching", "399 BCE: Trial and death", "Legacy: Socratic method"],
      facts: [
        "Developed the Socratic method",
        "Teacher of Plato",
        "Never wrote down his teachings",
        "Believed 'the unexamined life is not worth living'",
      ],
    },
    {
      id: 6,
      name: "Marie Curie",
      era: "1867-1934",
      field: "Physicist & Chemist",
      image: "/placeholder.svg?height=80&width=80",
      description: "First woman to win a Nobel Prize",
      timeline: ["1867: Born in Poland", "1891: Moved to Paris", "1903: First Nobel Prize", "1911: Second Nobel Prize"],
      facts: [
        "First woman to win Nobel Prize",
        "Only person to win Nobel in two sciences",
        "Discovered radium and polonium",
        "Founded mobile X-ray units in WWI",
      ],
    },
  ]

  const filteredFigures = historicalFigures.filter(
    (figure) =>
      figure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      figure.field.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const systemPrompt = selectedFigure
    ? `You are ${selectedFigure.name}, the ${selectedFigure.description}. You lived during ${selectedFigure.era}. Respond as this historical figure would, using first person and speaking from their perspective and time period. Share insights about your life, work, and the historical context of your era. Be historically accurate while making the conversation engaging and educational.`
    : `You are a Historical Figures facilitator. Help users choose a historical figure to chat with and provide context about different historical periods and personalities.`

  const getSuggestedQuestions = () => {
    if (!selectedFigure) return ["Choose a historical figure to start chatting!"]

    switch (selectedFigure.name) {
      case "Albert Einstein":
        return [
          "Tell me about your theory of relativity",
          "What was it like working on the Manhattan Project?",
          "How did you come up with E=mc²?",
          "What do you think about modern physics?",
        ]
      case "Cleopatra VII":
        return [
          "What was life like as pharaoh of Egypt?",
          "Tell me about your relationship with Julius Caesar",
          "How did you maintain power in ancient Egypt?",
          "What was Alexandria like in your time?",
        ]
      case "Leonardo da Vinci":
        return [
          "How do you balance art and science?",
          "Tell me about painting the Mona Lisa",
          "What inspired your flying machine designs?",
          "What was the Renaissance like?",
        ]
      default:
        return [
          "Tell me about your most important work",
          "What was your time period like?",
          "What challenges did you face?",
          "What would you want people to remember about you?",
        ]
    }
  }

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
              <Users className="h-6 w-6 text-amber-600" />
              <span className="text-xl font-semibold text-gray-900">Historical Figures</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {!selectedFigure ? (
          /* Figure Selection */
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose a Historical Figure</h1>
              <p className="text-lg text-gray-600 mb-6">
                Select a historical figure to have an engaging conversation and learn about their time period.
              </p>

              {/* Search */}
              <div className="max-w-md mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search historical figures..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Figure Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFigures.map((figure) => (
                <Card
                  key={figure.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  onClick={() => setSelectedFigure(figure)}
                >
                  <CardHeader className="text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarImage src={figure.image || "/placeholder.svg"} />
                      <AvatarFallback className="text-lg">
                        {figure.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{figure.name}</CardTitle>
                    <div className="flex justify-center space-x-2">
                      <Badge variant="outline">{figure.era}</Badge>
                      <Badge variant="secondary">{figure.field}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 text-center">{figure.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Interface */
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
            {/* Left Sidebar - Timeline and Facts */}
            <div className="col-span-3 space-y-4">
              {/* Back to Selection */}
              <Button variant="outline" onClick={() => setSelectedFigure(null)} className="w-full">
                ← Choose Different Figure
              </Button>

              {/* Selected Figure Info */}
              <Card>
                <CardHeader className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-2">
                    <AvatarImage src={selectedFigure.image || "/placeholder.svg"} />
                    <AvatarFallback>
                      {selectedFigure.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{selectedFigure.name}</CardTitle>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="outline">{selectedFigure.era}</Badge>
                    <Badge variant="secondary">{selectedFigure.field}</Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedFigure.timeline.map((event: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm">{event}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Facts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                    Key Facts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedFigure.facts.map((fact: string, index: number) => (
                    <div key={index} className="bg-green-50 p-2 rounded border-l-4 border-green-400">
                      <p className="text-sm">{fact}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Center - Chat */}
            <div className="col-span-6">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedFigure.image || "/placeholder.svg"} />
                      <AvatarFallback>
                        {selectedFigure.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">Chat with {selectedFigure.name}</CardTitle>
                      <p className="text-sm text-gray-600">{selectedFigure.description}</p>
                    </div>
                  </div>
                </CardHeader>

                <div className="flex-1 px-6 pb-6">
                  <ChatInterface
                    title=""
                    description=""
                    icon={<></>}
                    systemPrompt={systemPrompt}
                    placeholderMessage={`Ask ${selectedFigure.name} about their life and times...`}
                    suggestedQuestions={getSuggestedQuestions()}
                  />
                </div>
              </Card>
            </div>

            {/* Right Sidebar - Suggested Questions */}
            <div className="col-span-3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-purple-600" />
                    Suggested Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getSuggestedQuestions().map((question, index) => (
                    <div
                      key={index}
                      className="bg-purple-50 p-3 rounded cursor-pointer hover:bg-purple-100 transition-colors border"
                    >
                      <p className="text-sm">{question}</p>
                    </div>
                  ))}

                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium text-sm mb-2">Learn More About:</h4>
                    <div className="space-y-1">
                      <Badge variant="outline" className="mr-1 mb-1">
                        Historical Context
                      </Badge>
                      <Badge variant="outline" className="mr-1 mb-1">
                        Personal Life
                      </Badge>
                      <Badge variant="outline" className="mr-1 mb-1">
                        Major Works
                      </Badge>
                      <Badge variant="outline" className="mr-1 mb-1">
                        Legacy
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
