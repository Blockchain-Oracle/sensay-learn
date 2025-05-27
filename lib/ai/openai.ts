import OpenAI from "openai"
import { cacheGet, cacheSet } from "@/lib/cache/redis"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function generateChatResponse(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  model = "gpt-4",
  useCache = false,
) {
  try {
    // Create cache key if caching is enabled
    let cacheKey = ""
    if (useCache) {
      cacheKey = `chat:${Buffer.from(JSON.stringify({ messages, systemPrompt, model })).toString("base64")}`
      const cached = await cacheGet<string>(cacheKey)
      if (cached) return cached
    }

    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content || ""

    // Cache the response if caching is enabled
    if (useCache && content) {
      await cacheSet(cacheKey, content, 3600) // Cache for 1 hour
    }

    return content
  } catch (error) {
    console.error("OpenAI API error:", error)
    throw new Error("Failed to generate AI response")
  }
}

export async function generateSummary(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that creates concise, educational summaries. Focus on key concepts and important points.",
        },
        {
          role: "user",
          content: `Please create a comprehensive summary of the following text, highlighting key concepts and important points:\n\n${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    return response.choices[0]?.message?.content || ""
  } catch (error) {
    console.error("Error generating summary:", error)
    throw new Error("Failed to generate summary")
  }
}

export async function generateFlashcards(text: string): Promise<Array<{ question: string; answer: string }>> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            'Create educational flashcards from the given text. Return a JSON array of objects with "question" and "answer" fields. Make questions clear and answers concise.',
        },
        {
          role: "user",
          content: `Create flashcards from this text:\n\n${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    })

    try {
      const content = response.choices[0]?.message?.content || "[]"
      return JSON.parse(content)
    } catch (parseError) {
      console.error("Error parsing flashcards JSON:", parseError)
      return []
    }
  } catch (error) {
    console.error("Error generating flashcards:", error)
    throw new Error("Failed to generate flashcards")
  }
}

export async function analyzePronunciation(text: string, audioUrl: string): Promise<{ score: number; feedback: any }> {
  // This would integrate with a speech recognition service
  // For now, return mock data
  return {
    score: Math.floor(Math.random() * 30) + 70, // 70-100
    feedback: {
      overall: "Good pronunciation with minor improvements needed",
      phonemes: [],
      suggestions: ["Focus on vowel sounds", "Slow down slightly"],
    },
  }
}
