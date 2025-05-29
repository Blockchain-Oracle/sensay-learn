import { type NextRequest, NextResponse } from "next/server"
import { YouTubeService } from "@/lib/services/youtube-service"
import { checkRateLimit } from "@/lib/cache/upstash-redis"

// Helper function to process Privy IDs for database compatibility
function processUserId(userId: string): string {
  // If it's a Privy ID (starts with did:privy:), extract just the unique part
  if (userId && userId.startsWith("did:privy:")) {
    return userId.split("did:privy:")[1];
  }
  return userId;
}
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const processedUserId = processUserId(userId);

    // Rate limiting (allow anonymous users but with stricter limits)
    const identifier = processedUserId || request.headers.get("x-forwarded-for") || "anonymous"
    const { success, remaining } = await checkRateLimit(
      `youtube:${processedUserId}`,
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
