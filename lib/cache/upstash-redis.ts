import { Redis } from "@upstash/redis"

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Read-only client for better performance on read operations
const redisReadOnly = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_READ_ONLY_TOKEN!,
})

export async function cacheSet(key: string, value: any, ttl = 3600): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value))
  } catch (error) {
    console.error("Redis cache set error:", error)
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await redisReadOnly.get(key)
    return value ? (typeof value === "string" ? JSON.parse(value) : value) : null
  } catch (error) {
    console.error("Redis cache get error:", error)
    return null
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error("Redis cache delete error:", error)
  }
}

export async function cacheExists(key: string): Promise<boolean> {
  try {
    const exists = await redisReadOnly.exists(key)
    return exists === 1
  } catch (error) {
    console.error("Redis cache exists error:", error)
    return false
  }
}

// Learning session caching
export async function cacheUserSession(userId: string, sessionData: any, ttl = 1800): Promise<void> {
  await cacheSet(`session:${userId}`, sessionData, ttl)
}

export async function getUserSession(userId: string): Promise<any> {
  return await cacheGet(`session:${userId}`)
}

// AI response caching for faster repeated queries
export async function cacheAIResponse(prompt: string, response: string, ttl = 3600): Promise<void> {
  const key = `ai:${Buffer.from(prompt).toString("base64").slice(0, 50)}`
  await cacheSet(key, response, ttl)
}

export async function getCachedAIResponse(prompt: string): Promise<string | null> {
  const key = `ai:${Buffer.from(prompt).toString("base64").slice(0, 50)}`
  return await cacheGet(key)
}

// Study streak tracking
export async function updateStudyStreak(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0]
  const streakKey = `streak:${userId}`
  const lastStudyKey = `last_study:${userId}`

  const lastStudyDate = await redisReadOnly.get(lastStudyKey)
  const currentStreak = (await redisReadOnly.get(streakKey)) || 0

  if (lastStudyDate === today) {
    return Number(currentStreak)
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]

  let newStreak = 1
  if (lastStudyDate === yesterdayStr) {
    newStreak = Number(currentStreak) + 1
  }

  await redis.set(streakKey, newStreak)
  await redis.set(lastStudyKey, today)

  return newStreak
}

// Leaderboard functionality
export async function updateLeaderboard(category: string, userId: string, score: number): Promise<void> {
  const key = `leaderboard:${category}`
  await redis.zadd(key, { score, member: userId })
}

export async function getLeaderboard(category: string, limit = 10): Promise<Array<{ userId: string; score: number }>> {
  try {
    const key = `leaderboard:${category}`
    const results = await redisReadOnly.zrevrange(key, 0, limit - 1, { withScores: true })

    const leaderboard = []
    for (let i = 0; i < results.length; i += 2) {
      leaderboard.push({
        userId: results[i] as string,
        score: results[i + 1] as number,
      })
    }

    return leaderboard
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }
}

// Rate limiting with Upstash
export async function checkRateLimit(
  identifier: string,
  limit = 10,
  window = 60,
): Promise<{
  success: boolean
  remaining: number
  resetTime: number
}> {
  try {
    const key = `rate_limit:${identifier}`
    const current = await redis.incr(key)

    if (current === 1) {
      await redis.expire(key, window)
    }

    const remaining = Math.max(0, limit - current)
    const resetTime = Date.now() + window * 1000

    return {
      success: current <= limit,
      remaining,
      resetTime,
    }
  } catch (error) {
    console.error("Rate limiting error:", error)
    return {
      success: true,
      remaining: limit,
      resetTime: Date.now() + window * 1000,
    }
  }
}

export { redis, redisReadOnly }
