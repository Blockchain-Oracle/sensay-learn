import { type NextRequest, NextResponse } from "next/server"
import { DataService } from "@/lib/services/data-service"
import { checkRateLimit } from "@/lib/cache/upstash-redis"

// Helper function to process Privy IDs for database compatibility
function processUserId(userId: string): string {
  // If it's a Privy ID (starts with did:privy:), extract just the unique part
  if (userId && userId.startsWith("did:privy:")) {
    return userId.split("did:privy:")[1];
  }
  return userId;
}
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    const processedUserId = processUserId(userId);

    const progress = await DataService.getUserProgress(processedUserId, days)

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

    const processedUserId = processUserId(userId);

    // Rate limiting
    const { success } = await checkRateLimit(`progress:${userId}`, 20, 3600)
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const { learningMode, metricName, metricValue } = await request.json()

    const progress = await DataService.updateUserProgress({
      userId: processedUserId,
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
