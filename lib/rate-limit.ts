import { redis } from "@/lib/cache/redis"

export async function rateLimit(
  identifier: string,
  limit = 10,
  window = 60,
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  try {
    const client = redis()
    const key = `rate_limit:${identifier}`

    const multi = client.multi()
    multi.incr(key)
    multi.expire(key, window)

    const results = await multi.exec()
    const current = (results?.[0]?.[1] as number) || 0

    const remaining = Math.max(0, limit - current)
    const resetTime = Date.now() + window * 1000

    return {
      success: current <= limit,
      remaining,
      resetTime,
    }
  } catch (error) {
    console.error("Rate limiting error:", error)
    // Fail open - allow the request if rate limiting fails
    return {
      success: true,
      remaining: limit,
      resetTime: Date.now() + window * 1000,
    }
  }
}

export function createRateLimitMiddleware(limit = 100, window = 3600) {
  return async function rateLimitMiddleware(request: Request, identifier?: string): Promise<Response | null> {
    const id = identifier || request.headers.get("x-user-id") || request.headers.get("x-forwarded-for") || "anonymous"

    const { success, remaining, resetTime } = await rateLimit(id, limit, window)

    if (!success) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          resetTime,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": resetTime.toString(),
          },
        },
      )
    }

    return null // Continue processing
  }
}
