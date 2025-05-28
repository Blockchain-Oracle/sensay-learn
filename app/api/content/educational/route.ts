import { type NextRequest, NextResponse } from "next/server"
import { ScrapingService } from "@/lib/services/scraping-service"
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

    // Rate limiting for scraping (more restrictive)
    const identifier = processedUserId || request.headers.get("x-forwarded-for") || "anonymous"
    const { success, remaining } = await checkRateLimit(
      `scraping:${processedUserId}`, 
      processedUserId ? 10 : 3, // 10 requests for authenticated users, 3 for anonymous
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

    const { topic, maxResults = 5 } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    const content = await ScrapingService.scrapeEducationalContent(
      topic,
      Math.min(maxResults, 10), // Limit to 10 results max
    )

    return NextResponse.json({
      content,
      remaining,
    })
  } catch (error) {
    console.error("Educational content API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
