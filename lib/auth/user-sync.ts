import type { User } from "@privy-io/server-auth"
import { db } from "@/lib/db"

export async function syncUserWithDatabase(privyUser: User) {
  try {
    const existingUser = await db.user.findUnique({
      where: { privyId: privyUser.id },
    })

    if (!existingUser) {
      // Create new user
      const newUser = await db.user.create({
        data: {
          privyId: privyUser.id,
          email: privyUser.email?.address || "",
          displayName: privyUser.email?.address?.split("@")[0] || "User",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActiveAt: new Date(),
        },
      })

      // Create default preferences
      await db.userPreferences.create({
        data: {
          userId: newUser.id,
          darkMode: false,
          notificationsEnabled: true,
          emailNotifications: true,
          voiceEnabled: true,
          accessibilitySettings: {},
        },
      })

      // Create learning profiles for all modes
      const learningModes = [
        "ai-mentor",
        "coding-tutor",
        "mindfulness-coach",
        "debate-coach",
        "historical-figures",
        "adaptive-learning",
        "career-simulation",
        "study-buddy",
        "science-lab",
        "language-coach",
      ]

      for (const mode of learningModes) {
        await db.learningProfile.create({
          data: {
            userId: newUser.id,
            learningMode: mode,
            level: "beginner",
            preferences: {},
            goals: [],
          },
        })
      }

      return newUser
    } else {
      // Update last active
      return await db.user.update({
        where: { id: existingUser.id },
        data: { lastActiveAt: new Date() },
      })
    }
  } catch (error) {
    console.error("Error syncing user with database:", error)
    throw error
  }
}
