import { type NextRequest, NextResponse } from "next/server"
import { getLeaderboard, updateLeaderboard } from "@/lib/cache/upstash-redis"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || "overall"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Get leaderboard from Redis
    const leaderboard = await getLeaderboard(category, limit)

    // Enrich with user data from database
    const enrichedLeaderboard = await Promise.all(
      leaderboard.map(async (entry) => {
        const user = await db.user.findUnique({
          where: { id: entry.userId },
          select: { displayName: true, avatarUrl: true },
        })

        return {
          ...entry,
          displayName: user?.displayName || "Anonymous",
          avatarUrl: user?.avatarUrl,
        }
      }),
    )

    return NextResponse.json({
      category,
      leaderboard: enrichedLeaderboard,
    })
  } catch (error) {
    console.error("Leaderboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { category, score } = await request.json()

    if (!category || typeof score !== "number") {
      return NextResponse.json({ error: "Invalid category or score" }, { status: 400 })
    }

    // Update leaderboard in Redis
    await updateLeaderboard(category, userId, score)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Leaderboard update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
