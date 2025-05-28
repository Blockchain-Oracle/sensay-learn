import { type NextRequest, NextResponse } from "next/server"
import { generateChatResponse } from "@/lib/ai/sensay"

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt, userId } = await request.json()

    if (!messages || !systemPrompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1].content
    
    // Process userId to handle Privy DID format
    let processedUserId = userId
    if (userId && userId.startsWith("did:privy:")) {
      // Extract just the unique part after the prefix
      processedUserId = userId.split("did:privy:")[1]
    }
    
    // Use Sensay API to generate a response
    try {
      const response = await generateChatResponse(
        messages,
        systemPrompt,
        "claude-3-5-haiku-latest", // Default model
        false, // Don't use cache
        processedUserId // Pass processed user ID
      )
      
      return NextResponse.json({ response })
    } catch (error) {
      console.error("Error calling Sensay API:", error)
      
      // Fallback to simulated responses if API fails
      let fallbackResponse = ""
      
      if (lastUserMessage.toLowerCase().includes('breathing')) {
        fallbackResponse = "Breathing exercises are excellent for reducing stress and anxiety. Try the 4-7-8 technique: inhale for 4 seconds, hold for 7, and exhale for 8. This helps activate your parasympathetic nervous system and promotes relaxation."
      } else if (lastUserMessage.toLowerCase().includes('anxious') || lastUserMessage.toLowerCase().includes('anxiety')) {
        fallbackResponse = "I understand anxiety can be challenging. Remember that anxiety is temporary and will pass. Try grounding yourself with the 5-4-3-2-1 technique: acknowledge 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste."
      } else if (lastUserMessage.toLowerCase().includes('stress') || lastUserMessage.toLowerCase().includes('stressed')) {
        fallbackResponse = "For stress relief, try progressive muscle relaxation. Starting from your toes and moving upward, tense each muscle group for 5 seconds, then release and notice the relaxation. This helps release physical tension that accumulates with stress."
      } else if (lastUserMessage.toLowerCase().includes('sleep') || lastUserMessage.toLowerCase().includes('tired')) {
        fallbackResponse = "To improve sleep, establish a calming bedtime routine. Try mindful body scanning before bed: lying down, bring awareness to each part of your body from toes to head, consciously relaxing each area. Also, limit screen time an hour before bedtime."
      } else if (lastUserMessage.toLowerCase().includes('grateful') || lastUserMessage.toLowerCase().includes('gratitude')) {
        fallbackResponse = "Practicing gratitude is powerful for mental wellbeing. Try writing down three things you're grateful for each day. They can be simple things like a warm cup of tea or a friendly smile. This shifts your focus toward positive aspects of life."
      } else if (lastUserMessage.toLowerCase().includes('meditation')) {
        fallbackResponse = "Meditation is a powerful practice for mental clarity and emotional balance. Start with just 5 minutes daily of focusing on your breath. When your mind wanders (which is normal), gently bring attention back to your breathing. Over time, you can extend the duration as it becomes more comfortable."
      } else if (lastUserMessage.toLowerCase().includes('focus') || lastUserMessage.toLowerCase().includes('concentrate')) {
        fallbackResponse = "To improve focus, try the Pomodoro technique: work with full concentration for 25 minutes, then take a 5-minute break. Also, mindful breathing before tasks can help clear your mind. Consider reducing digital distractions by putting your phone in another room when you need to concentrate."
      } else {
        fallbackResponse = "I'm here to support your learning journey. Would you like to try a specific topic or learning technique? Let me know how I can help guide your education today."
      }
      
      return NextResponse.json({ response: fallbackResponse })
    }
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
