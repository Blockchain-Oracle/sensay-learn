import { type NextRequest, NextResponse } from "next/server"
import { DataService } from "@/lib/services/data-service"
import { checkRateLimit } from "@/lib/cache/upstash-redis"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    const progress = await DataService.getUserProgress(userId, days)

    return NextResponse.json({ progress })
  } catch (error) {
    console.error("User progress API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rate limiting
    const { success } = await checkRateLimit(`progress:${userId}`, 20, 3600)
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const { learningMode, metricName, metricValue } = await request.json()

    const progress = await DataService.updateUserProgress({
      userId,
      learningMode,
      metricName,
      metricValue,
      date: new Date(),
    })

    return NextResponse.json({ progress })
  } catch (error) {
    console.error("Update progress API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
