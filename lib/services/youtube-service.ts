import { google } from "googleapis"
import { generateChatResponse } from "@/lib/ai/openai"
import { cacheGet, cacheSet } from "@/lib/cache/upstash-redis"
import { z } from "zod"

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
})

const VideoRecommendationSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnailUrl: z.string(),
  channelTitle: z.string(),
  duration: z.string(),
  viewCount: z.string(),
  publishedAt: z.string(),
  relevanceScore: z.number(),
  aiReasoning: z.string(),
})

export type VideoRecommendation = z.infer<typeof VideoRecommendationSchema>

export class YouTubeService {
  static async getRecommendations(
    topic: string,
    learningMode: string,
    userLevel = "beginner",
    maxResults = 10,
  ): Promise<VideoRecommendation[]> {
    const cacheKey = `youtube:${topic}:${learningMode}:${userLevel}:${maxResults}`
    const cached = await cacheGet<VideoRecommendation[]>(cacheKey)

    if (cached) return cached

    try {
      // Generate AI-enhanced search query
      const searchQuery = await this.generateSearchQuery(topic, learningMode, userLevel)

      // Search YouTube
      const searchResponse = await youtube.search.list({
        part: ["snippet"],
        q: searchQuery,
        type: ["video"],
        maxResults,
        order: "relevance",
        videoDuration: "medium", // 4-20 minutes
        videoDefinition: "high",
        safeSearch: "strict",
      })

      if (!searchResponse.data.items) return []

      // Get video details
      const videoIds = searchResponse.data.items.map((item) => item.id?.videoId).filter(Boolean)
      const videoDetails = await youtube.videos.list({
        part: ["contentDetails", "statistics"],
        id: videoIds,
      })

      // Process and score videos with AI
      const recommendations = await Promise.all(
        searchResponse.data.items.map(async (item, index) => {
          const videoDetail = videoDetails.data.items?.[index]

          if (!item.snippet || !item.id?.videoId) return null

          // AI scoring and reasoning
          const aiAnalysis = await this.analyzeVideoRelevance(
            item.snippet.title || "",
            item.snippet.description || "",
            topic,
            learningMode,
            userLevel,
          )

          return VideoRecommendationSchema.parse({
            videoId: item.id.videoId,
            title: item.snippet.title || "",
            description: item.snippet.description || "",
            thumbnailUrl: item.snippet.thumbnails?.high?.url || "",
            channelTitle: item.snippet.channelTitle || "",
            duration: videoDetail?.contentDetails?.duration || "",
            viewCount: videoDetail?.statistics?.viewCount || "0",
            publishedAt: item.snippet.publishedAt || "",
            relevanceScore: aiAnalysis.score,
            aiReasoning: aiAnalysis.reasoning,
          })
        }),
      )

      const validRecommendations = recommendations
        .filter(Boolean)
        .sort((a, b) => b!.relevanceScore - a!.relevanceScore) as VideoRecommendation[]

      await cacheSet(cacheKey, validRecommendations, 3600) // Cache for 1 hour
      return validRecommendations
    } catch (error) {
      console.error("YouTube API error:", error)
      return []
    }
  }

  private static async generateSearchQuery(topic: string, learningMode: string, userLevel: string): Promise<string> {
    const prompt = `Generate an optimized YouTube search query for finding educational content.

Topic: ${topic}
Learning Mode: ${learningMode}
User Level: ${userLevel}

Consider:
- Educational keywords that improve search quality
- Level-appropriate terminology
- Learning mode specific terms (tutorial, explanation, practice, etc.)
- Filters to avoid low-quality content

Return only the search query, no explanation.`

    try {
      const query = await generateChatResponse(
        [{ role: "user", content: prompt }],
        "You are a search optimization expert for educational content.",
        "gpt-3.5-turbo",
      )
      return query.trim()
    } catch (error) {
      console.error("Error generating search query:", error)
      return `${topic} ${learningMode} ${userLevel} tutorial`
    }
  }

  private static async analyzeVideoRelevance(
    title: string,
    description: string,
    topic: string,
    learningMode: string,
    userLevel: string,
  ): Promise<{ score: number; reasoning: string }> {
    const prompt = `Analyze this YouTube video for educational relevance:

Title: ${title}
Description: ${description.substring(0, 500)}...

Target Topic: ${topic}
Learning Mode: ${learningMode}
User Level: ${userLevel}

Rate the relevance on a scale of 0-100 and provide reasoning.

Respond in JSON format:
{
  "score": number,
  "reasoning": "brief explanation"
}`

    try {
      const response = await generateChatResponse(
        [{ role: "user", content: prompt }],
        "You are an educational content analyst. Evaluate content quality, relevance, and appropriateness for the target audience.",
        "gpt-3.5-turbo",
      )

      const analysis = JSON.parse(response)
      return {
        score: Math.max(0, Math.min(100, analysis.score)),
        reasoning: analysis.reasoning || "AI analysis completed",
      }
    } catch (error) {
      console.error("Error analyzing video relevance:", error)
      return { score: 50, reasoning: "Unable to analyze content" }
    }
  }

  static async getVideoTranscript(videoId: string): Promise<string | null> {
    const cacheKey = `transcript:${videoId}`
    const cached = await cacheGet<string>(cacheKey)

    if (cached) return cached

    try {
      // Note: YouTube API doesn't provide transcripts directly
      // This would require additional services or web scraping
      // For now, return null and handle in the UI
      return null
    } catch (error) {
      console.error("Error fetching transcript:", error)
      return null
    }
  }

  static async getChannelInfo(channelId: string) {
    const cacheKey = `channel:${channelId}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    try {
      const response = await youtube.channels.list({
        part: ["snippet", "statistics"],
        id: [channelId],
      })

      const channel = response.data.items?.[0]
      if (!channel) return null

      const info = {
        title: channel.snippet?.title,
        description: channel.snippet?.description,
        thumbnailUrl: channel.snippet?.thumbnails?.high?.url,
        subscriberCount: channel.statistics?.subscriberCount,
        videoCount: channel.statistics?.videoCount,
      }

      await cacheSet(cacheKey, info, 86400) // Cache for 24 hours
      return info
    } catch (error) {
      console.error("Error fetching channel info:", error)
      return null
    }
  }
}
