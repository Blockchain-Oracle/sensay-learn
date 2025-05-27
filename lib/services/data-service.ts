import { db } from "@/lib/db"
import { cacheGet, cacheSet } from "@/lib/cache/upstash-redis"
import { z } from "zod"

// Data validation schemas
const UserProgressSchema = z.object({
  userId: z.string(),
  learningMode: z.string(),
  metricName: z.string(),
  metricValue: z.number(),
  date: z.date(),
})

const StudySessionSchema = z.object({
  userId: z.string(),
  title: z.string(),
  subject: z.string().optional(),
  topic: z.string().optional(),
  duration: z.number(),
  status: z.enum(["scheduled", "active", "completed", "cancelled"]),
})

export class DataService {
  // User Progress Methods
  static async getUserProgress(userId: string, days = 30) {
    const cacheKey = `user_progress:${userId}:${days}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const progress = await db.userProgress.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: "desc" },
    })

    await cacheSet(cacheKey, progress, 300) // Cache for 5 minutes
    return progress
  }

  static async updateUserProgress(data: z.infer<typeof UserProgressSchema>) {
    const validated = UserProgressSchema.parse(data)

    const progress = await db.userProgress.upsert({
      where: {
        userId_learningMode_metricName_date: {
          userId: validated.userId,
          learningMode: validated.learningMode,
          metricName: validated.metricName,
          date: validated.date,
        },
      },
      update: { metricValue: validated.metricValue },
      create: validated,
    })

    // Invalidate cache
    await cacheSet(`user_progress:${validated.userId}:30`, null, 1)
    return progress
  }

  // Study Sessions Methods
  static async getUserStudySessions(userId: string, limit = 10) {
    const cacheKey = `study_sessions:${userId}:${limit}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    const sessions = await db.studySession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    await cacheSet(cacheKey, sessions, 300)
    return sessions
  }

  static async createStudySession(data: z.infer<typeof StudySessionSchema>) {
    const validated = StudySessionSchema.parse(data)

    const session = await db.studySession.create({
      data: {
        ...validated,
        actualStart: new Date(),
      },
    })

    // Invalidate cache
    await cacheSet(`study_sessions:${validated.userId}:10`, null, 1)
    return session
  }

  // Learning Profile Methods
  static async getUserLearningProfile(userId: string, learningMode: string) {
    const cacheKey = `learning_profile:${userId}:${learningMode}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    const profile = await db.learningProfile.findUnique({
      where: {
        userId_learningMode: { userId, learningMode },
      },
    })

    await cacheSet(cacheKey, profile, 600) // Cache for 10 minutes
    return profile
  }

  // Achievements Methods
  static async getUserAchievements(userId: string) {
    const cacheKey = `achievements:${userId}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    const achievements = await db.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
    })

    await cacheSet(cacheKey, achievements, 1800) // Cache for 30 minutes
    return achievements
  }

  // Chat Conversations Methods
  static async getUserConversations(userId: string, learningMode?: string) {
    const cacheKey = `conversations:${userId}:${learningMode || "all"}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    const conversations = await db.chatConversation.findMany({
      where: {
        userId,
        ...(learningMode && { learningMode }),
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    })

    await cacheSet(cacheKey, conversations, 300)
    return conversations
  }

  // Language Progress Methods
  static async getLanguageProgress(userId: string) {
    const cacheKey = `language_progress:${userId}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    const progress = await db.languageProgress.findMany({
      where: { userId },
      include: { language: true },
    })

    await cacheSet(cacheKey, progress, 600)
    return progress
  }

  // Vocabulary Methods
  static async getUserVocabulary(userId: string, languageId?: string) {
    const cacheKey = `vocabulary:${userId}:${languageId || "all"}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    const vocabulary = await db.userVocabulary.findMany({
      where: {
        userId,
        ...(languageId && { word: { languageId } }),
      },
      include: { word: true },
      orderBy: { lastPracticedAt: "desc" },
      take: 50,
    })

    await cacheSet(cacheKey, vocabulary, 600)
    return vocabulary
  }

  // Analytics Methods
  static async getAnalytics(userId: string, timeframe = "week") {
    const cacheKey = `analytics:${userId}:${timeframe}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    const days = timeframe === "week" ? 7 : timeframe === "month" ? 30 : 365
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [progress, sessions, achievements] = await Promise.all([
      this.getUserProgress(userId, days),
      db.studySession.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
      }),
      db.userAchievement.findMany({
        where: {
          userId,
          earnedAt: { gte: startDate },
        },
        include: { achievement: true },
      }),
    ])

    const analytics = {
      totalStudyTime: sessions.reduce((acc, session) => {
        const duration =
          session.actualEnd && session.actualStart
            ? (session.actualEnd.getTime() - session.actualStart.getTime()) / (1000 * 60)
            : 0
        return acc + duration
      }, 0),
      sessionsCompleted: sessions.filter((s) => s.status === "completed").length,
      achievementsEarned: achievements.length,
      progressByMode: progress.reduce(
        (acc, p) => {
          if (!acc[p.learningMode]) acc[p.learningMode] = 0
          acc[p.learningMode] += Number(p.metricValue)
          return acc
        },
        {} as Record<string, number>,
      ),
    }

    await cacheSet(cacheKey, analytics, 300)
    return analytics
  }
}
