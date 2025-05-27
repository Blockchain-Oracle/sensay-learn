"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useYouTubeRecommendations } from "@/hooks/use-live-data"
import { Play, Eye, ExternalLink, RefreshCw } from "lucide-react"
import type { VideoRecommendation } from "@/lib/services/youtube-service"

interface YouTubeRecommendationsProps {
  topic: string
  learningMode: string
  userLevel?: string
  maxResults?: number
}

export function YouTubeRecommendations({
  topic,
  learningMode,
  userLevel = "beginner",
  maxResults = 6,
}: YouTubeRecommendationsProps) {
  const { recommendations, loading, error, refetch } = useYouTubeRecommendations(topic, learningMode, userLevel)
  const [selectedVideo, setSelectedVideo] = useState<VideoRecommendation | null>(null)

  const formatDuration = (duration: string) => {
    // Convert ISO 8601 duration to readable format
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return "Unknown"

    const hours = match[1] ? Number.parseInt(match[1]) : 0
    const minutes = match[2] ? Number.parseInt(match[2]) : 0
    const seconds = match[3] ? Number.parseInt(match[3]) : 0

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const formatViewCount = (count: string) => {
    const num = Number.parseInt(count)
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M views`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K views`
    return `${num} views`
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800"
    if (score >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            YouTube Recommendations
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Failed to load YouTube recommendations</p>
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
            <Play className="h-5 w-5 mr-2 text-red-600" />
            YouTube Recommendations
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No recommendations found for this topic</p>
            <Button onClick={refetch}>Refresh</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(0, maxResults).map((video) => (
              <div key={video.videoId} className="group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={video.thumbnailUrl || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
                    <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="truncate">{video.channelTitle}</span>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{formatViewCount(video.viewCount)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className={`text-xs ${getRelevanceColor(video.relevanceScore)}`}>
                      {video.relevanceScore}% relevant
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`https://youtube.com/watch?v=${video.videoId}`, "_blank")
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>

                  {video.aiReasoning && <p className="text-xs text-gray-500 line-clamp-2">{video.aiReasoning}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">{selectedVideo.title}</h2>
                  <Button variant="ghost" onClick={() => setSelectedVideo(null)}>
                    ×
                  </Button>
                </div>

                <div className="aspect-video mb-4">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{selectedVideo.channelTitle}</span>
                    <span>{formatViewCount(selectedVideo.viewCount)}</span>
                    <span>{formatDuration(selectedVideo.duration)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge className={getRelevanceColor(selectedVideo.relevanceScore)}>
                      {selectedVideo.relevanceScore}% Relevant
                    </Badge>
                    <Badge variant="outline">{userLevel}</Badge>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">AI Analysis</h3>
                    <p className="text-sm text-gray-700">{selectedVideo.aiReasoning}</p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-sm text-gray-700 line-clamp-4">{selectedVideo.description}</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => window.open(`https://youtube.com/watch?v=${selectedVideo.videoId}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Watch on YouTube
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedVideo(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
