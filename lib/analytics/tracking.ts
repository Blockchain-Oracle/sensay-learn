import { db } from "@/lib/db"

// Helper function to process Privy IDs for database compatibility
function processUserId(userId: string): string {
  // If it's a Privy ID (starts with did:privy:), extract just the unique part
  if (userId && userId.startsWith("did:privy:")) {
    return userId.split("did:privy:")[1];
  }
  return userId;
}

export function trackEvent(name: string, properties?: Record<string, any>) {
  if (typeof window !== "undefined") {
    // Track with Vercel Analytics
    if (window.va) {
      window.va.track(name, properties)
    }

    // Track with custom analytics
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: name, properties }),
    }).catch(console.error)
  }
}

export async function trackUserProgress(userId: string, learningMode: string, metricName: string, metricValue: number) {
  try {
    const processedUserId = processUserId(userId);
    
    await db.userProgress.upsert({
      where: {
        userId_learningMode_metricName_date: {
          userId: processedUserId,
          learningMode,
          metricName,
          date: new Date(),
        },
      },
      update: {
        metricValue,
      },
      create: {
        userId: processedUserId,
        learningMode,
        metricName,
        metricValue,
        date: new Date(),
      },
    })
  } catch (error) {
    console.error("Error tracking user progress:", error)
  }
}

export function useAnalytics() {
  const trackLearningSession = (mode: string, duration: number) => {
    trackEvent("learning_session_completed", {
      learning_mode: mode,
      duration_minutes: duration,
      timestamp: new Date().toISOString(),
    })
  }

  const trackAchievement = (achievementId: string) => {
    trackEvent("achievement_unlocked", {
      achievement_id: achievementId,
      timestamp: new Date().toISOString(),
    })
  }

  const trackFileUpload = (module: string, fileType: string, fileSize: number) => {
    trackEvent("file_uploaded", {
      module,
      file_type: fileType,
      file_size: fileSize,
      timestamp: new Date().toISOString(),
    })
  }

  return {
    trackLearningSession,
    trackAchievement,
    trackFileUpload,
  }
}
