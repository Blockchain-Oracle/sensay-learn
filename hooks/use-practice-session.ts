import { useState, useEffect, useCallback } from 'react'
import { VocabularyWord } from './use-vocabulary'
import { calculatePronunciationAccuracy } from '@/lib/utils/speech-utils'

export interface PracticePhrase {
  id: string
  phrase: string
  translation: string
  pronunciation?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  language: string
}

export interface PracticeResult {
  phraseId: string
  accuracy: number
  timestamp: Date
  userTranscript: string
}

export interface PracticeSession {
  id: string
  language: string
  startTime: Date
  endTime?: Date
  phrases: PracticePhrase[]
  results: PracticeResult[]
  completed: boolean
  score: number
}

interface PracticeSessionHook {
  currentSession: PracticeSession | null
  currentPhraseIndex: number
  currentPhrase: PracticePhrase | null
  results: PracticeResult[]
  isSessionActive: boolean
  isSessionComplete: boolean
  sessionScore: number
  startSession: (language: string, phrases: PracticePhrase[]) => void
  endSession: () => void
  nextPhrase: () => void
  previousPhrase: () => void
  recordResult: (result: Omit<PracticeResult, 'timestamp'>) => void
  resetSession: () => void
  startVocabularySession: (words: VocabularyWord[], count?: number) => void
}

/**
 * Hook for managing language practice sessions
 * @returns Functions and state for practice session management
 */
export default function usePracticeSession(): PracticeSessionHook {
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null)
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [sessionHistory, setSessionHistory] = useState<PracticeSession[]>([])

  // Persist session history to localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || sessionHistory.length === 0) return
    
    try {
      localStorage.setItem('practice-session-history', JSON.stringify(sessionHistory))
    } catch (err) {
      console.error('Error saving practice history:', err)
    }
  }, [sessionHistory])

  // Load session history from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const savedHistory = localStorage.getItem('practice-session-history')
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        // Convert string dates back to Date objects
        const formattedHistory = parsedHistory.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
          results: session.results.map((result: any) => ({
            ...result,
            timestamp: new Date(result.timestamp)
          }))
        }))
        setSessionHistory(formattedHistory)
      }
    } catch (err) {
      console.error('Error loading practice history:', err)
    }
  }, [])

  /**
   * Start a new practice session
   * @param language - Language code
   * @param phrases - List of phrases to practice
   */
  const startSession = useCallback((language: string, phrases: PracticePhrase[]) => {
    if (phrases.length === 0) {
      throw new Error('Cannot start a session with no phrases')
    }
    
    const newSession: PracticeSession = {
      id: `session_${Date.now()}`,
      language,
      startTime: new Date(),
      phrases,
      results: [],
      completed: false,
      score: 0
    }
    
    setCurrentSession(newSession)
    setCurrentPhraseIndex(0)
  }, [])

  /**
   * End the current practice session
   */
  const endSession = useCallback(() => {
    if (!currentSession) return
    
    const endedSession: PracticeSession = {
      ...currentSession,
      endTime: new Date(),
      completed: true
    }
    
    // Calculate final score
    if (endedSession.results.length > 0) {
      const totalAccuracy = endedSession.results.reduce((sum, result) => sum + result.accuracy, 0)
      endedSession.score = Math.round(totalAccuracy / endedSession.results.length)
    }
    
    setCurrentSession(endedSession)
    setSessionHistory(prev => [endedSession, ...prev])
  }, [currentSession])

  /**
   * Move to the next phrase in the session
   */
  const nextPhrase = useCallback(() => {
    if (!currentSession) return
    
    const nextIndex = currentPhraseIndex + 1
    if (nextIndex < currentSession.phrases.length) {
      setCurrentPhraseIndex(nextIndex)
    } else {
      // End of session
      endSession()
    }
  }, [currentSession, currentPhraseIndex, endSession])

  /**
   * Move to the previous phrase in the session
   */
  const previousPhrase = useCallback(() => {
    if (!currentSession) return
    
    const prevIndex = currentPhraseIndex - 1
    if (prevIndex >= 0) {
      setCurrentPhraseIndex(prevIndex)
    }
  }, [currentSession, currentPhraseIndex])

  /**
   * Record a result for the current phrase
   */
  const recordResult = useCallback((result: Omit<PracticeResult, 'timestamp'>) => {
    if (!currentSession) return
    
    const fullResult: PracticeResult = {
      ...result,
      timestamp: new Date()
    }
    
    setCurrentSession(prev => {
      if (!prev) return null
      
      // Create a new results array, replacing any existing result for the same phrase
      const updatedResults = [...prev.results.filter(r => r.phraseId !== result.phraseId), fullResult]
      
      return {
        ...prev,
        results: updatedResults
      }
    })
  }, [currentSession])

  /**
   * Reset the current session
   */
  const resetSession = useCallback(() => {
    setCurrentSession(null)
    setCurrentPhraseIndex(0)
  }, [])

  /**
   * Start a practice session with vocabulary words
   * @param words - List of vocabulary words
   * @param count - Number of words to include (default: 10)
   */
  const startVocabularySession = useCallback((words: VocabularyWord[], count = 10) => {
    if (words.length === 0) {
      throw new Error('Cannot start a session with no words')
    }
    
    // Select words for practice (prioritize non-mastered words)
    const nonMasteredWords = words.filter(word => !word.mastered)
    const selectedWords = nonMasteredWords.length >= count 
      ? nonMasteredWords.slice(0, count) 
      : [...nonMasteredWords, ...words.filter(word => word.mastered)].slice(0, count)
    
    // Convert vocabulary words to practice phrases
    const phrases: PracticePhrase[] = selectedWords.map(word => ({
      id: word.id,
      phrase: word.word,
      translation: word.translation,
      pronunciation: word.pronunciation,
      difficulty: 'intermediate', // Default difficulty
      category: word.category || 'Vocabulary',
      language: word.language
    }))
    
    // Start the session
    startSession(phrases[0].language, phrases)
  }, [startSession])

  // Derived values
  const currentPhrase = currentSession && currentSession.phrases[currentPhraseIndex] || null
  const isSessionActive = !!currentSession && !currentSession.completed
  const isSessionComplete = !!currentSession && currentSession.completed
  
  // Current results for the session
  const results = currentSession?.results || []
  
  // Calculate current session score
  const sessionScore = results.length > 0
    ? Math.round(results.reduce((sum, result) => sum + result.accuracy, 0) / results.length)
    : 0

  return {
    currentSession,
    currentPhraseIndex,
    currentPhrase,
    results,
    isSessionActive,
    isSessionComplete,
    sessionScore,
    startSession,
    endSession,
    nextPhrase,
    previousPhrase,
    recordResult,
    resetSession,
    startVocabularySession
  }
} 