import { type NextRequest, NextResponse } from "next/server"
import { getLeaderboard, updateLeaderboard } from "@/lib/cache/upstash-redis"
import { db } from "@/lib/db"

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
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || "overall"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Get leaderboard from Redis
    const leaderboard = await getLeaderboard(category, limit)

    // Enrich with user data from database
    const enrichedLeaderboard = await Promise.all(
      leaderboard.map(async (entry) => {
        const processedUserId = processUserId(entry.userId);
        
        const user = await db.user.findUnique({
          where: { id: processedUserId },
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

    const processedUserId = processUserId(userId);
    
    const { category, score } = await request.json()

    if (!category || typeof score !== "number") {
      return NextResponse.json({ error: "Invalid category or score" }, { status: 400 })
    }

    // Update leaderboard in Redis
    await updateLeaderboard(category, processedUserId, score)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Leaderboard update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
