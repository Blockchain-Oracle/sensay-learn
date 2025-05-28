"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useEducationalContent } from "@/hooks/use-live-data"
import { BookOpen, Clock, ExternalLink, RefreshCw, Lightbulb } from "lucide-react"

interface EducationalContentProps {
  topic: string
  maxResults?: number
  userId?: string
}

export function EducationalContent({ topic, maxResults = 5, userId }: EducationalContentProps) {
  const { content, loading, error, refetch } = useEducationalContent(topic, userId)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Educational Resources
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Failed to load educational content</p>
            <Button onClick={refetch}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
            Educational Resources
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{topic}</Badge>
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No educational content found for this topic</p>
            <Button onClick={refetch}>Refresh</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {content.slice(0, maxResults).map((item, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg line-clamp-2 flex-1 mr-4">{item.title}</h3>
                  <Button variant="ghost" size="sm" onClick={() => window.open(item.url, "_blank")}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-gray-700 text-sm mb-3 line-clamp-3">{item.summary}</p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(item.difficulty)}>{item.difficulty}</Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {item.estimatedReadTime} min read
                    </div>
                  </div>
                </div>

                {item.keyPoints.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-1 text-yellow-600" />
                      Key Points
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {item.keyPoints.slice(0, 3).map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="line-clamp-1">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(item.url, "_blank")}
                    className="w-full"
                  >
                    Read Full Article
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
