import { type NextRequest, NextResponse } from "next/server"
import { YouTubeService } from "@/lib/services/youtube-service"
import { checkRateLimit } from "@/lib/cache/upstash-redis"

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    // Rate limiting (allow anonymous users but with stricter limits)
    const identifier = userId || request.headers.get("x-forwarded-for") || "anonymous"
    const { success, remaining } = await checkRateLimit(
      `youtube:${identifier}`,
      userId ? 30 : 10, // 30 requests for authenticated users, 10 for anonymous
      3600,
    )

    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: { "X-RateLimit-Remaining": remaining.toString() },
        },
      )
    }

    const { topic, learningMode, userLevel, maxResults = 10 } = await request.json()

    if (!topic || !learningMode) {
      return NextResponse.json({ error: "Topic and learning mode are required" }, { status: 400 })
    }

    const recommendations = await YouTubeService.getRecommendations(
      topic,
      learningMode,
      userLevel,
      Math.min(maxResults, 20), // Limit to 20 results max
    )

    return NextResponse.json({
      recommendations,
      remaining,
    })
  } catch (error) {
    console.error("YouTube recommendations API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
