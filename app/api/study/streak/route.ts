import { type NextRequest, NextResponse } from "next/server"
import { updateStudyStreak } from "@/lib/cache/upstash-redis"
import { db } from "@/lib/db"

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
    
    const { learningMode, sessionDuration } = await request.json()

    // Update study streak in Redis
    const newStreak = await updateStudyStreak(processedUserId)

    // Track progress in database
    await db.userProgress.upsert({
      where: {
        userId_learningMode_metricName_date: {
          userId: processedUserId,
          learningMode: learningMode || "general",
          metricName: "study_streak",
          date: new Date(),
        },
      },
      update: {
        metricValue: newStreak,
      },
      create: {
        userId: processedUserId,
        learningMode: learningMode || "general",
        metricName: "study_streak",
        metricValue: newStreak,
        date: new Date(),
      },
    })

    // Check for streak achievements
    if (newStreak === 7) {
      // Award 7-day streak achievement
      const achievement = await db.achievement.findFirst({
        where: { name: "Study Streak" },
      })

      if (achievement) {
        await db.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: processedUserId,
              achievementId: achievement.id,
            },
          },
          update: {},
          create: {
            userId: processedUserId,
            achievementId: achievement.id,
          },
        })
      }
    }

    return NextResponse.json({
      streak: newStreak,
      isNewRecord: newStreak > 0,
    })
  } catch (error) {
    console.error("Study streak API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
