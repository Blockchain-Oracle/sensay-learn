import { type NextRequest, NextResponse } from "next/server"
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

    const processedUserId = processUserId(userId);
    
    const user = await db.user.findUnique({
      where: { id: processedUserId },
      include: {
        preferences: true,
        learningProfiles: true,
        userProgress: {
          where: {
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const processedUserId = processUserId(userId);
    
    const { displayName, timezone, languagePreference, preferences } = await request.json()

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: processedUserId },
      data: {
        displayName,
        timezone,
        languagePreference,
        updatedAt: new Date(),
      },
    })

    // Update preferences if provided
    if (preferences) {
      await db.userPreferences.upsert({
        where: { userId: processedUserId },
        update: preferences,
        create: {
          userId: processedUserId,
          ...preferences,
        },
      })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Profile update API error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
