import { type NextRequest, NextResponse } from "next/server"
import { generateChatResponse } from "@/lib/ai/openai"
import { checkRateLimit, cacheAIResponse, getCachedAIResponse, cacheUserSession } from "@/lib/cache/upstash-redis"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Apply rate limiting
    const { success, remaining, resetTime } = await checkRateLimit(`chat:${userId}`, 50, 3600)
    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded", resetTime },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": resetTime.toString(),
          },
        },
      )
    }

    const { messages, systemPrompt, conversationId, learningMode } = await request.json()

    if (!messages || !systemPrompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check for cached AI response
    const lastMessage = messages[messages.length - 1]?.content
    const cacheKey = `${systemPrompt}:${lastMessage}`
    let aiResponse = await getCachedAIResponse(cacheKey)

    if (!aiResponse) {
      // Generate new AI response
      aiResponse = await generateChatResponse(messages, systemPrompt)

      // Cache the response for future use
      await cacheAIResponse(cacheKey, aiResponse, 3600)
    }

    // Save conversation and messages to database
    let conversation
    if (conversationId) {
      conversation = await db.chatConversation.findUnique({
        where: { id: conversationId, userId },
      })
    }

    if (!conversation) {
      conversation = await db.chatConversation.create({
        data: {
          userId,
          learningMode: learningMode || "general",
          systemPrompt,
          title: messages[0]?.content?.substring(0, 50) + "..." || "New Conversation",
        },
      })
    }

    // Save user message
    await db.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: lastMessage || "",
      },
    })

    // Save AI response
    await db.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: aiResponse,
      },
    })

    // Cache user session data
    await cacheUserSession(userId, {
      lastActivity: new Date().toISOString(),
      currentConversation: conversation.id,
      learningMode,
    })

    return NextResponse.json({
      message: aiResponse,
      conversationId: conversation.id,
      cached: !!aiResponse,
      remaining,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
