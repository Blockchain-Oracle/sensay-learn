import { type NextRequest, NextResponse } from "next/server"
import { getUserSession, getLeaderboard } from "@/lib/cache/upstash-redis"
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
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Process the userId to handle Privy ID format
    const processedUserId = processUserId(userId);

    // Get cached session data
    const sessionData = await getUserSession(processedUserId)

    // Get study streak from database
    const streakProgress = await db.userProgress.findFirst({
      where: {
        userId: processedUserId,
        metricName: "study_streak",
        date: new Date(),
      },
      orderBy: { createdAt: "desc" },
    })

    // Get total sessions
    const totalSessions = await db.userProgress.aggregate({
      where: {
        userId: processedUserId,
        metricName: "sessions_completed",
      },
      _sum: {
        metricValue: true,
      },
    })

    // Get weekly progress
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())

    const weeklyProgress = await db.userProgress.aggregate({
      where: {
        userId: processedUserId,
        metricName: "time_spent",
        date: {
          gte: weekStart,
        },
      },
      _sum: {
        metricValue: true,
      },
    })

    // Get leaderboard position
    const leaderboard = await getLeaderboard("overall", 100)
    const userRank = leaderboard.findIndex((entry) => entry.userId === processedUserId) + 1

    // Get recent achievements
    const recentAchievements = await db.userAchievement.findMany({
      where: { userId: processedUserId },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
      take: 3,
    })

    const stats = {
      studyStreak: Number(streakProgress?.metricValue || 0),
      totalSessions: Number(totalSessions._sum.metricValue || 0),
      weeklyGoalProgress: Math.min(100, Math.round((Number(weeklyProgress._sum.metricValue || 0) / 600) * 100)), // 10 hours weekly goal
      leaderboardRank: userRank || 999,
      recentAchievements: recentAchievements.map((ua) => ({
        name: ua.achievement.name,
        earnedAt: ua.earnedAt.toISOString(),
      })),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Dashboard stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
