import * as cheerio from "cheerio"
import { cacheGet, cacheSet } from "@/lib/cache/upstash-redis"
import { generateChatResponse } from "@/lib/ai/sensay"

export interface ScrapedContent {
  title: string
  content: string
  url: string
  summary: string
  keyPoints: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedReadTime: number
}

export class ScrapingService {
  private static readonly EDUCATIONAL_SITES = [
    "wikipedia.org",
    "khanacademy.org",
    "coursera.org",
    "edx.org",
    "mit.edu",
    "stanford.edu",
    "harvard.edu",
    "medium.com",
    "towardsdatascience.com",
    "freecodecamp.org",
  ]

  static async scrapeEducationalContent(topic: string, maxResults = 5): Promise<ScrapedContent[]> {
    const cacheKey = `scraped:${topic}:${maxResults}`
    const cached = await cacheGet<ScrapedContent[]>(cacheKey)

    if (cached) return cached

    try {
      // Generate search URLs for educational sites
      const searchUrls = await this.generateSearchUrls(topic)

      // Scrape content from multiple sources
      const scrapingPromises = searchUrls.slice(0, maxResults).map((url) =>
        this.scrapeUrl(url).catch((error) => {
          console.error(`Error scraping ${url}:`, error)
          return null
        }),
      )

      const results = await Promise.all(scrapingPromises)
      const validResults = results.filter(Boolean) as ScrapedContent[]

      await cacheSet(cacheKey, validResults, 3600) // Cache for 1 hour
      return validResults
    } catch (error) {
      console.error("Error in scrapeEducationalContent:", error)
      return []
    }
  }

  private static async generateSearchUrls(topic: string): Promise<string[]> {
    // In a production environment, you would use a proper search API
    // For now, we'll generate some common educational URLs
    const encodedTopic = encodeURIComponent(topic)

    return [
      `https://en.wikipedia.org/wiki/${encodedTopic.replace(/\s+/g, "_")}`,
      `https://www.khanacademy.org/search?search_again=1&query=${encodedTopic}`,
      `https://medium.com/search?q=${encodedTopic}`,
      // Add more educational sites as needed
    ]
  }

  private static async scrapeUrl(url: string): Promise<ScrapedContent | null> {
    try {
      // Note: In a production environment, you should use a proper scraping service
      // or respect robots.txt and rate limits
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; SensayLearn/1.0; Educational Content Aggregator)",
        },
      })

      if (!response.ok) return null

      const html = await response.text()
      const $ = cheerio.load(html)

      // Extract content based on common patterns
      const title = $("h1").first().text() || $("title").text() || "Untitled"
      let content = ""

      // Try different content selectors
      const contentSelectors = ["article", ".content", ".post-content", ".entry-content", "main", "#content"]

      for (const selector of contentSelectors) {
        const element = $(selector)
        if (element.length > 0) {
          content = element.text().trim()
          break
        }
      }

      // Fallback to paragraph content
      if (!content) {
        content = $("p")
          .map((_, el) => $(el).text())
          .get()
          .join("\n")
      }

      if (!content || content.length < 100) return null

      // Clean and process content
      content = content.replace(/\s+/g, " ").trim()

      // Generate AI analysis
      const analysis = await this.analyzeContent(title, content)

      return {
        title: title.trim(),
        content: content.substring(0, 2000), // Limit content length
        url,
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        difficulty: analysis.difficulty,
        estimatedReadTime: Math.ceil(content.split(" ").length / 200), // ~200 WPM
      }
    } catch (error) {
      console.error(`Error scraping ${url}:`, error)
      return null
    }
  }

  private static async analyzeContent(
    title: string,
    content: string,
  ): Promise<{
    summary: string
    keyPoints: string[]
    difficulty: "beginner" | "intermediate" | "advanced"
  }> {
    const prompt = `Analyze this educational content:

Title: ${title}
Content: ${content.substring(0, 1000)}...

Provide:
1. A concise summary (2-3 sentences)
2. 3-5 key learning points
3. Difficulty level (beginner/intermediate/advanced)

Respond in JSON format:
{
  "summary": "...",
  "keyPoints": ["...", "...", "..."],
  "difficulty": "beginner|intermediate|advanced"
}`

    try {
      const response = await generateChatResponse(
        [{ role: "user", content: prompt }],
        "You are an educational content analyst. Provide clear, concise analysis suitable for learners.",
        "gpt-3.5-turbo",
      )

      const analysis = JSON.parse(response)
      return {
        summary: analysis.summary || "Content analysis available",
        keyPoints: Array.isArray(analysis.keyPoints) ? analysis.keyPoints : [],
        difficulty: ["beginner", "intermediate", "advanced"].includes(analysis.difficulty)
          ? analysis.difficulty
          : "intermediate",
      }
    } catch (error) {
      console.error("Error analyzing content:", error)
      return {
        summary: "Educational content available for review",
        keyPoints: ["Content available for learning"],
        difficulty: "intermediate",
      }
    }
  }

  static async scrapeWikipedia(topic: string): Promise<ScrapedContent | null> {
    const cacheKey = `wikipedia:${topic}`
    const cached = await cacheGet<ScrapedContent>(cacheKey)

    if (cached) return cached

    try {
      const encodedTopic = encodeURIComponent(topic.replace(/\s+/g, "_"))
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTopic}`

      const response = await fetch(url)
      if (!response.ok) return null

      const data = await response.json()

      if (data.type === "disambiguation") {
        // Handle disambiguation pages
        return null
      }

      const content: ScrapedContent = {
        title: data.title,
        content: data.extract,
        url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodedTopic}`,
        summary: data.extract_html ? data.extract_html.replace(/<[^>]*>/g, "") : data.extract,
        keyPoints: [data.extract.split(".")[0] + "."], // First sentence as key point
        difficulty: "intermediate",
        estimatedReadTime: Math.ceil(data.extract.split(" ").length / 200),
      }

      await cacheSet(cacheKey, content, 86400) // Cache for 24 hours
      return content
    } catch (error) {
      console.error("Error scraping Wikipedia:", error)
      return null
    }
  }
}
