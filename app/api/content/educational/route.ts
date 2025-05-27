import { type NextRequest, NextResponse } from "next/server"
import { ScrapingService } from "@/lib/services/scraping-service"
import { checkRateLimit } from "@/lib/cache/upstash-redis"

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    // Rate limiting for scraping (more restrictive)
    const identifier = userId || request.headers.get("x-forwarded-for") || "anonymous"
    const { success, remaining } = await checkRateLimit(
      `scraping:${identifier}`,
      userId ? 10 : 3, // 10 requests for authenticated users, 3 for anonymous
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
