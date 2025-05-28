import { NextRequest, NextResponse } from "next/server"

// This would normally be in environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

interface Message {
  role: string
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json()

    if (!messages || !systemPrompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1].content
    
    // Simulate processing for demo purposes
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Provide a simulated response
    let response = ''
    
    if (lastUserMessage.toLowerCase().includes('breathing')) {
      response = 'Breathing exercises are excellent for reducing stress and anxiety. Try the 4-7-8 technique: inhale for 4 seconds, hold for 7, and exhale for 8. This helps activate your parasympathetic nervous system and promotes relaxation.'
    } else if (lastUserMessage.toLowerCase().includes('anxious') || lastUserMessage.toLowerCase().includes('anxiety')) {
      response = 'I understand anxiety can be challenging. Remember that anxiety is temporary and will pass. Try grounding yourself with the 5-4-3-2-1 technique: acknowledge 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.'
    } else if (lastUserMessage.toLowerCase().includes('stress') || lastUserMessage.toLowerCase().includes('stressed')) {
      response = 'For stress relief, try progressive muscle relaxation. Starting from your toes and moving upward, tense each muscle group for 5 seconds, then release and notice the relaxation. This helps release physical tension that accumulates with stress.'
    } else if (lastUserMessage.toLowerCase().includes('sleep') || lastUserMessage.toLowerCase().includes('tired')) {
      response = 'To improve sleep, establish a calming bedtime routine. Try mindful body scanning before bed: lying down, bring awareness to each part of your body from toes to head, consciously relaxing each area. Also, limit screen time an hour before bedtime.'
    } else if (lastUserMessage.toLowerCase().includes('grateful') || lastUserMessage.toLowerCase().includes('gratitude')) {
      response = 'Practicing gratitude is powerful for mental wellbeing. Try writing down three things you're grateful for each day. They can be simple things like a warm cup of tea or a friendly smile. This shifts your focus toward positive aspects of life.'
    } else if (lastUserMessage.toLowerCase().includes('meditation')) {
      response = 'Meditation is a powerful practice for mental clarity and emotional balance. Start with just 5 minutes daily of focusing on your breath. When your mind wanders (which is normal), gently bring attention back to your breathing. Over time, you can extend the duration as it becomes more comfortable.'
    } else if (lastUserMessage.toLowerCase().includes('focus') || lastUserMessage.toLowerCase().includes('concentrate')) {
      response = 'To improve focus, try the Pomodoro technique: work with full concentration for 25 minutes, then take a 5-minute break. Also, mindful breathing before tasks can help clear your mind. Consider reducing digital distractions by putting your phone in another room when you need to concentrate.'
    } else {
      response = `I'm here to support your mindfulness journey. Would you like to try a breathing exercise, practice gratitude, or learn about stress management techniques? Let me know how I can help guide your practice today.`
    }
    
    // If we have an OpenAI key, use that instead
    if (OPENAI_API_KEY) {
      try {
        // Format the messages for the OpenAI API
        const formattedMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.map((msg: Message) => ({
            role: msg.role,
            content: msg.content
          }))
        ]

        // Make request to OpenAI API
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 500
          })
        })

        if (openaiResponse.ok) {
          const data = await openaiResponse.json()
          response = data.choices[0].message.content
        }
      } catch (error) {
        console.error('Error calling OpenAI:', error)
        // Continue with the simulated response if OpenAI fails
      }
    }
    
    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error in mindfulness chat API:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
} 