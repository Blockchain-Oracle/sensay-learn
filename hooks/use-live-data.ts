"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR from "swr"
import type { VideoRecommendation, ScrapedContent } from "@/lib/services/client"
import { ClientYouTubeService, ClientScrapingService } from "@/lib/services/client"

// Enhanced fetcher for SWR that includes auth headers
const fetcher = (url: string, userId?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }
  
  // Add auth header if userId is provided
  if (userId) {
    headers['x-user-id'] = userId
  }
  
  return fetch(url, { headers }).then((res) => res.json())
}

// User Progress Hook
export function useUserProgress(userId: string, days = 30) {
  const { data, error, mutate } = useSWR(
    userId ? [`/api/user/progress?days=${days}`, userId] : null, 
    ([url, id]) => fetcher(url, id),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  )

  return {
    progress: data?.progress || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

// Study Sessions Hook
export function useStudySessions(userId: string) {
  const { data, error, mutate } = useSWR(
    userId ? [`/api/user/sessions`, userId] : null, 
    ([url, id]) => fetcher(url, id),
    {
      refreshInterval: 60000, // Refresh every minute
    }
  )

  const createSession = useCallback(
    async (sessionData: any) => {
      try {
        const response = await fetch("/api/user/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId
          },
          body: JSON.stringify(sessionData),
        })

        if (response.ok) {
          mutate() // Revalidate data
          return await response.json()
        }
      } catch (error) {
        console.error("Error creating session:", error)
      }
    },
    [mutate, userId],
  )

  return {
    sessions: data?.sessions || [],
    isLoading: !error && !data,
    isError: error,
    createSession,
    mutate,
  }
}

// YouTube Recommendations Hook
export function useYouTubeRecommendations(topic: string, learningMode: string, userLevel = "beginner", userId?: string) {
  const [recommendations, setRecommendations] = useState<VideoRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = useCallback(async () => {
    if (!topic || !learningMode) return

    setLoading(true)
    setError(null)

    try {
      const results = await ClientYouTubeService.getRecommendations(topic, learningMode, userLevel, 10, userId)
      setRecommendations(results)
    } catch (err) {
      setError("Failed to fetch recommendations")
      console.error("YouTube recommendations error:", err)
    } finally {
      setLoading(false)
    }
  }, [topic, learningMode, userLevel, userId])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations,
  }
}

// Educational Content Hook
export function useEducationalContent(topic: string, userId?: string) {
  const [content, setContent] = useState<ScrapedContent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContent = useCallback(async () => {
    if (!topic) return

    setLoading(true)
    setError(null)

    try {
      const results = await ClientScrapingService.getEducationalContent(topic, 5, userId)
      setContent(results)
    } catch (err) {
      setError("Failed to fetch educational content")
      console.error("Educational content error:", err)
    } finally {
      setLoading(false)
    }
  }, [topic, userId])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  return {
    content,
    loading,
    error,
    refetch: fetchContent,
  }
}

// Real-time Analytics Hook
export function useAnalytics(userId: string, timeframe = "week") {
  const { data, error, mutate } = useSWR(
    userId ? [`/api/analytics?timeframe=${timeframe}`, userId] : null, 
    ([url, id]) => fetcher(url, id),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  )

  return {
    analytics: data?.analytics || {},
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

// Language Progress Hook
export function useLanguageProgress(userId: string) {
  const { data, error, mutate } = useSWR(
    userId ? [`/api/user/language-progress`, userId] : null, 
    ([url, id]) => fetcher(url, id),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  )

  return {
    languageProgress: data?.languageProgress || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

// Achievements Hook
export function useAchievements(userId: string) {
  const { data, error, mutate } = useSWR(
    userId ? [`/api/user/achievements`, userId] : null, 
    ([url, id]) => fetcher(url, id),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  )

  return {
    achievements: data?.achievements || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

// Leaderboard Hook
export function useLeaderboard(category = "overall", limit = 10) {
  const { data, error, mutate } = useSWR(
    `/api/leaderboard?category=${category}&limit=${limit}`, 
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
    }
  )

  return {
    leaderboard: data?.leaderboard || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}
