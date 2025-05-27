"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR from "swr"
import type { VideoRecommendation } from "@/lib/services/youtube-service"
import type { ScrapedContent } from "@/lib/services/scraping-service"

// Generic fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

// User Progress Hook
export function useUserProgress(userId: string, days = 30) {
  const { data, error, mutate } = useSWR(userId ? `/api/user/progress?days=${days}` : null, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  })

  return {
    progress: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

// Study Sessions Hook
export function useStudySessions(userId: string) {
  const { data, error, mutate } = useSWR(userId ? `/api/user/sessions` : null, fetcher, {
    refreshInterval: 60000, // Refresh every minute
  })

  const createSession = useCallback(
    async (sessionData: any) => {
      try {
        const response = await fetch("/api/user/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
    [mutate],
  )

  return {
    sessions: data,
    isLoading: !error && !data,
    isError: error,
    createSession,
    mutate,
  }
}

// YouTube Recommendations Hook
export function useYouTubeRecommendations(topic: string, learningMode: string, userLevel = "beginner") {
  const [recommendations, setRecommendations] = useState<VideoRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = useCallback(async () => {
    if (!topic || !learningMode) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/youtube/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, learningMode, userLevel }),
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      } else {
        setError("Failed to fetch recommendations")
      }
    } catch (err) {
      setError("Network error")
      console.error("YouTube recommendations error:", err)
    } finally {
      setLoading(false)
    }
  }, [topic, learningMode, userLevel])

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
export function useEducationalContent(topic: string) {
  const [content, setContent] = useState<ScrapedContent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContent = useCallback(async () => {
    if (!topic) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/content/educational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      })

      if (response.ok) {
        const data = await response.json()
        setContent(data.content || [])
      } else {
        setError("Failed to fetch educational content")
      }
    } catch (err) {
      setError("Network error")
      console.error("Educational content error:", err)
    } finally {
      setLoading(false)
    }
  }, [topic])

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
  const { data, error, mutate } = useSWR(userId ? `/api/analytics?timeframe=${timeframe}` : null, fetcher, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true,
  })

  return {
    analytics: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

// Language Progress Hook
export function useLanguageProgress(userId: string) {
  const { data, error, mutate } = useSWR(userId ? `/api/user/language-progress` : null, fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
  })

  return {
    languageProgress: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

// Achievements Hook
export function useAchievements(userId: string) {
  const { data, error, mutate } = useSWR(userId ? `/api/user/achievements` : null, fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
  })

  return {
    achievements: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

// Leaderboard Hook
export function useLeaderboard(category = "overall", limit = 10) {
  const { data, error, mutate } = useSWR(`/api/leaderboard?category=${category}&limit=${limit}`, fetcher, {
    refreshInterval: 60000, // Refresh every minute
  })

  return {
    leaderboard: data?.leaderboard || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}
