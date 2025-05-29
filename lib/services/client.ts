"use client"

import { z } from "zod"

// Type definitions without direct imports from server-side code
export type VideoRecommendation = {
  videoId: string
  title: string
  description: string
  thumbnailUrl: string
  channelTitle: string
  duration: string
  viewCount: string
  publishedAt: string
  relevanceScore: number
  aiReasoning: string
}

export type ScrapedContent = {
  title: string
  content: string
  url: string
  summary: string
  keyPoints: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedReadTime: number
}

// Client-side service wrappers that use fetch
export class ClientYouTubeService {
  static async getRecommendations(
    topic: string,
    learningMode: string,
    userLevel = "beginner",
    maxResults = 10,
    userId?: string
  ): Promise<VideoRecommendation[]> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json"
      }
      
      if (userId) {
        headers["x-user-id"] = userId
      }
      
      const response = await fetch("/api/youtube/recommendations", {
        method: "POST",
        headers,
        body: JSON.stringify({ topic, learningMode, userLevel, maxResults }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.recommendations || []
    } catch (error) {
      console.error("Error fetching YouTube recommendations:", error)
      return []
    }
  }
}

export class ClientScrapingService {
  static async getEducationalContent(
    topic: string,
    maxResults = 5,
    userId: string
  ): Promise<ScrapedContent[]> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json"
      }
      
      if (userId) {
        headers["x-user-id"] = userId
      }
      
      const response = await fetch("/api/content/educational", {
        method: "POST",
        headers,
        body: JSON.stringify({ topic, maxResults }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.content || []
    } catch (error) {
      console.error("Error fetching educational content:", error)
      return []
    }
  }
} 