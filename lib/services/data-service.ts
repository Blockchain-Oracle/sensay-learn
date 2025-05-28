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

// Helper function to process Privy IDs for database compatibility
function processUserId(userId: string): string {
  // If it's a Privy ID (starts with did:privy:), extract just the unique part
  if (userId && userId.startsWith("did:privy:")) {
    return userId.split("did:privy:")[1];
  }
  return userId;
}

export class DataService {
  // User Progress Methods
  static async getUserProgress(userId: string, days = 30) {
    const processedUserId = processUserId(userId);
    const cacheKey = `user_progress:${processedUserId}:${days}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const progress = await db.userProgress.findMany({
      where: {
        userId: processedUserId,
        date: { gte: startDate },
      },
      orderBy: { date: "desc" },
    })

    await cacheSet(cacheKey, progress, 300) // Cache for 5 minutes
    return progress
  }

  static async updateUserProgress(data: z.infer<typeof UserProgressSchema>) {
    const validated = UserProgressSchema.parse(data);
    const processedUserId = processUserId(validated.userId);

    const progress = await db.userProgress.upsert({
      where: {
        userId_learningMode_metricName_date: {
          userId: processedUserId,
          learningMode: validated.learningMode,
          metricName: validated.metricName,
          date: validated.date,
        },
      },
      update: { metricValue: validated.metricValue },
      create: { ...validated, userId: processedUserId },
    })

    // Invalidate cache
    await cacheSet(`user_progress:${processedUserId}:30`, null, 1)
    return progress
  }

  // Study Sessions Methods
  static async getUserStudySessions(userId: string, limit = 10) {
    const processedUserId = processUserId(userId);
    const cacheKey = `study_sessions:${processedUserId}:${limit}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    const sessions = await db.studySession.findMany({
      where: { userId: processedUserId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    await cacheSet(cacheKey, sessions, 300)
    return sessions
  }

  static async createStudySession(data: z.infer<typeof StudySessionSchema>) {
    const validated = StudySessionSchema.parse(data);
    const processedUserId = processUserId(validated.userId);

    const session = await db.studySession.create({
      data: {
        ...validated,
        userId: processedUserId,
        actualStart: new Date(),
      },
    })

    // Invalidate cache
    await cacheSet(`study_sessions:${processedUserId}:10`, null, 1)
    return session
  }

  // Learning Profile Methods
  static async getUserLearningProfile(userId: string, learningMode: string) {
    const processedUserId = processUserId(userId);
    const cacheKey = `learning_profile:${processedUserId}:${learningMode}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    const profile = await db.learningProfile.findUnique({
      where: {
        userId_learningMode: { userId: processedUserId, learningMode },
      },
    })

    await cacheSet(cacheKey, profile, 600) // Cache for 10 minutes
    return profile
  }

  // Achievements Methods
  static async getUserAchievements(userId: string) {
    const processedUserId = processUserId(userId);
    const cacheKey = `achievements:${processedUserId}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    const achievements = await db.userAchievement.findMany({
      where: { userId: processedUserId },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
    })

    await cacheSet(cacheKey, achievements, 1800) // Cache for 30 minutes
    return achievements
  }

  // Chat Conversations Methods
  static async getUserConversations(userId: string, learningMode?: string) {
    const processedUserId = processUserId(userId);
    const cacheKey = `conversations:${processedUserId}:${learningMode || "all"}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    const conversations = await db.chatConversation.findMany({
      where: {
        userId: processedUserId,
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
    const processedUserId = processUserId(userId);
    const cacheKey = `language_progress:${processedUserId}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    const progress = await db.languageProgress.findMany({
      where: { userId: processedUserId },
      include: { language: true },
    })

    await cacheSet(cacheKey, progress, 600)
    return progress
  }

  // Vocabulary Methods
  static async getUserVocabulary(userId: string, languageId?: string) {
    const processedUserId = processUserId(userId);
    const cacheKey = `vocabulary:${processedUserId}:${languageId || "all"}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    const vocabulary = await db.userVocabulary.findMany({
      where: {
        userId: processedUserId,
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
    const processedUserId = processUserId(userId);
    const cacheKey = `analytics:${processedUserId}:${timeframe}`
    const cached = await cacheGet(cacheKey)

    if (cached) return cached

    const days = timeframe === "week" ? 7 : timeframe === "month" ? 30 : 365
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [progress, sessions, achievements] = await Promise.all([
      this.getUserProgress(processedUserId, days),
      db.studySession.findMany({
        where: {
          userId: processedUserId,
          createdAt: { gte: startDate },
        },
      }),
      db.userAchievement.findMany({
        where: {
          userId: processedUserId,
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
      progressByMode: Array.isArray(progress) 
        ? progress.reduce(
            (acc: Record<string, number>, p: any) => {
              if (!acc[p.learningMode]) acc[p.learningMode] = 0
              acc[p.learningMode] += Number(p.metricValue)
              return acc
            },
            {} as Record<string, number>,
          )
        : {},
    }

    await cacheSet(cacheKey, analytics, 300)
    return analytics
  }
}
