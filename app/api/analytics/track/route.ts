import { type NextRequest, NextResponse } from "next/server"
import { trackUserProgress } from "@/lib/analytics/tracking"
import { createRateLimitMiddleware } from "@/lib/rate-limit"

const rateLimitMiddleware = createRateLimitMiddleware(100, 3600) // 100 events per hour

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request)
    if (rateLimitResponse) return rateLimitResponse

    const userId = request.headers.get("x-user-id")
    const { event, properties } = await request.json()

    if (!event) {
      return NextResponse.json({ error: "Event name required" }, { status: 400 })
    }

    // Track specific learning events
    if (userId && event === "learning_session_completed") {
      const { learning_mode, duration_minutes } = properties
      if (learning_mode && duration_minutes) {
        await trackUserProgress(userId, learning_mode, "time_spent", duration_minutes)
        await trackUserProgress(userId, learning_mode, "sessions_completed", 1)
      }
    }

    // Log event for analytics (in production, send to analytics service)
    console.log("Analytics event:", { event, properties, userId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
  }
}
