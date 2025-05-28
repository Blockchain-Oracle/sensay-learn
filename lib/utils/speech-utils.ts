/**
 * Speech utilities for language learning features
 * These utilities handle the common tasks related to speech recognition and synthesis
 */

// Map language names to BCP 47 language tags required for speech API
export const languageCodeMap: Record<string, string> = {
  "english": "en-US",
  "spanish": "es-ES",
  "french": "fr-FR",
  "german": "de-DE",
  "italian": "it-IT",
  "portuguese": "pt-PT",
  "japanese": "ja-JP",
  "mandarin": "zh-CN",
  "arabic": "ar-SA",
}

// Get language code for speech APIs
export function getLanguageCode(language: string): string {
  return languageCodeMap[language.toLowerCase()] || "en-US"
}

// Check if browser supports speech recognition
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition)
}

// Check if browser supports speech synthesis
export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'speechSynthesis' in window
}

/**
 * Compare two strings and calculate pronunciation similarity score
 * @param expected - The expected phrase
 * @param actual - The user's spoken phrase
 * @returns A similarity score from 0-100
 */
export function calculatePronunciationAccuracy(expected: string, actual: string): number {
  if (!expected || !actual) return 0
  
  // Normalize and clean strings for comparison
  const normalizedExpected = expected.toLowerCase().trim()
  const normalizedActual = actual.toLowerCase().trim()
  
  // For more accurate comparison, we could use more advanced algorithms
  // like Levenshtein distance or phonetic matching, but this simpler approach
  // is more appropriate for language learning beginners
  
  // Split into words and count matches
  const wordsExpected = normalizedExpected.split(/\s+/)
  const wordsActual = normalizedActual.split(/\s+/)
  
  // Count matching words
  let matches = 0
  for (const word of wordsActual) {
    if (wordsExpected.includes(word)) matches++
  }
  
  // Calculate accuracy percentage - with a slight bias toward partial matches
  // to encourage learners
  const accuracyScore = Math.min(
    100, 
    Math.round((matches / Math.max(wordsExpected.length, wordsActual.length)) * 100)
  )
  
  return accuracyScore
}

/**
 * Generate feedback based on pronunciation accuracy
 * @param accuracy - The accuracy score (0-100)
 * @returns Feedback message
 */
export function generatePronunciationFeedback(accuracy: number): string {
  if (accuracy >= 90) {
    return "Excellent! Your pronunciation is spot on!"
  } else if (accuracy >= 70) {
    return "Good job! Keep practicing to perfect your pronunciation."
  } else if (accuracy >= 50) {
    return "Not bad, but there's room for improvement."
  } else if (accuracy >= 30) {
    return "Try again, focusing on the pronunciation guide."
  } else {
    return "Let's keep practicing. Listen to the example and try again."
  }
}

/**
 * Get optimal voice for a given language
 * @param voices - Available synthesis voices
 * @param languageCode - BCP 47 language tag
 * @returns Best matching voice or null
 */
export function getBestVoiceForLanguage(
  voices: SpeechSynthesisVoice[],
  languageCode: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) {
    console.warn('No voices available for selection')
    return null
  }

  console.log(`Finding best voice for ${languageCode} among ${voices.length} voices`)
  
  // Try exact match first
  let voice = voices.find(v => v.lang === languageCode)
  if (voice) {
    console.log(`Found exact match: ${voice.name} (${voice.lang})`)
    return voice
  }
  
  // Try language code prefix match (e.g., 'ar' for 'ar-SA')
  if (languageCode.includes('-')) {
    const langPrefix = languageCode.split('-')[0]
    voice = voices.find(v => v.lang.startsWith(langPrefix))
    
    if (voice) {
      console.log(`Found language prefix match: ${voice.name} (${voice.lang})`)
      return voice
    }
  }
  
  // Try alternative dialects for the same language
  // For example, if ar-SA isn't available, try ar-EG
  if (languageCode.includes('-')) {
    const langPrefix = languageCode.split('-')[0]
    const dialectVoices = voices.filter(v => v.lang.startsWith(langPrefix))
    
    if (dialectVoices.length > 0) {
      // Prefer local voices (generally higher quality)
      const localVoice = dialectVoices.find(v => v.localService)
      if (localVoice) {
        console.log(`Found local dialect voice: ${localVoice.name} (${localVoice.lang})`)
        return localVoice
      }
      
      // Otherwise use the first available dialect
      console.log(`Found dialect voice: ${dialectVoices[0].name} (${dialectVoices[0].lang})`)
      return dialectVoices[0]
    }
  }
  
  // If still no match, return null
  console.warn(`No matching voice found for ${languageCode}`)
  return null
}

/**
 * Convert phonetic notation to a more speech-friendly format
 * @param phonetic - The phonetic notation
 * @returns Cleaned pronunciation
 */
export function cleanPronunciation(phonetic: string): string {
  if (!phonetic) return ''
  
  return phonetic
    .replace(/[\/\[\]]/g, '') // Remove slashes and brackets
    .replace(/ˈ/g, '') // Remove stress marks
    .replace(/ˌ/g, '')
    .trim()
} 