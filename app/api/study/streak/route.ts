import { type NextRequest, NextResponse } from "next/server"
import { updateStudyStreak } from "@/lib/cache/upstash-redis"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { learningMode, sessionDuration } = await request.json()

    // Update study streak in Redis
    const newStreak = await updateStudyStreak(userId)

    // Track progress in database
    await db.userProgress.upsert({
      where: {
        userId_learningMode_metricName_date: {
          userId,
          learningMode: learningMode || "general",
          metricName: "study_streak",
          date: new Date(),
        },
      },
      update: {
        metricValue: newStreak,
      },
      create: {
        userId,
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
              userId,
              achievementId: achievement.id,
            },
          },
          update: {},
          create: {
            userId,
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
