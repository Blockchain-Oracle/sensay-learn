import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { dictionaryService, WordDefinition } from '@/lib/services/dictionary-service'

export interface VocabularyWord {
  id: string
  word: string
  translation: string
  category?: string
  pronunciation?: string
  mastered: boolean
  favorite: boolean
  language: string
  dateAdded: Date
  lastPracticed?: Date
  definition?: WordDefinition | null
}

interface VocabularyHook {
  words: VocabularyWord[]
  loading: boolean
  error: string | null
  searchResults: VocabularyWord[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  addWord: (word: Omit<VocabularyWord, 'id' | 'dateAdded'>) => Promise<VocabularyWord>
  removeWord: (id: string) => void
  updateWord: (id: string, updates: Partial<VocabularyWord>) => void
  toggleMastered: (id: string) => void
  toggleFavorite: (id: string) => void
  lookupWord: (word: string, language: string) => Promise<WordDefinition | null>
  filteredWords: (filter: 'all' | 'favorites' | 'mastered' | 'recent') => VocabularyWord[]
  wordsByCategory: Record<string, VocabularyWord[]>
}

/**
 * Hook for managing vocabulary words
 * @param initialWords - Optional initial vocabulary list
 * @returns Functions and state for vocabulary management
 */
export default function useVocabulary(initialWords: VocabularyWord[] = []): VocabularyHook {
  const [words, setWords] = useState<VocabularyWord[]>(initialWords)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<VocabularyWord[]>([])
  // Add ref to track if we've already loaded from localStorage
  const hasLoadedRef = useRef(false)

  // Load words from localStorage on init
  useEffect(() => {
    if (typeof window === 'undefined' || initialWords.length > 0 || hasLoadedRef.current) return
    
    try {
      const savedWords = localStorage.getItem('vocabulary-words')
      if (savedWords) {
        const parsedWords = JSON.parse(savedWords)
        // Convert string dates back to Date objects
        const formattedWords = parsedWords.map((word: any) => ({
          ...word,
          dateAdded: new Date(word.dateAdded),
          lastPracticed: word.lastPracticed ? new Date(word.lastPracticed) : undefined
        }))
        setWords(formattedWords)
      }
      // Mark as loaded so we don't try again
      hasLoadedRef.current = true
    } catch (err) {
      console.error('Error loading vocabulary from storage:', err)
      setError('Could not load saved vocabulary')
      hasLoadedRef.current = true
    }
  }, [initialWords])

  // Save words to localStorage on change
  useEffect(() => {
    if (typeof window === 'undefined' || !hasLoadedRef.current) return
    
    try {
      localStorage.setItem('vocabulary-words', JSON.stringify(words))
    } catch (err) {
      console.error('Error saving vocabulary to storage:', err)
    }
  }, [words])

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }
    
    const term = searchTerm.toLowerCase().trim()
    const results = words.filter(word => 
      word.word.toLowerCase().includes(term) || 
      word.translation.toLowerCase().includes(term)
    )
    
    setSearchResults(results)
  }, [searchTerm, words])

  /**
   * Look up a word in the dictionary
   */
  const lookupWord = useCallback(async (
    word: string, 
    language: string
  ): Promise<WordDefinition | null> => {
    setLoading(true)
    setError(null)
    
    try {
      // Map language name to language code for API
      const languageCode = {
        'spanish': 'es',
        'french': 'fr',
        'german': 'de',
        'italian': 'it',
        'portuguese': 'pt-BR',
        'english': 'en'
      }[language.toLowerCase()] || 'en'
      
      const definition = await dictionaryService.getDefinition(word, languageCode)
      return definition
    } catch (error) {
      console.error('Error looking up word:', error)
      setError('Error looking up word definition')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Add a new word to vocabulary
   */
  const addWord = useCallback(async (
    wordData: Omit<VocabularyWord, 'id' | 'dateAdded'>
  ): Promise<VocabularyWord> => {
    setLoading(true)
    
    try {
      // Generate unique ID
      const id = `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Look up definition if not provided
      let definition = wordData.definition
      if (!definition) {
        definition = await lookupWord(wordData.word, wordData.language)
      }
      
      // Create new word object
      const newWord: VocabularyWord = {
        ...wordData,
        id,
        dateAdded: new Date(),
        definition
      }
      
      // Add to state
      setWords(prev => [newWord, ...prev])
      
      return newWord
    } catch (err) {
      console.error('Error adding word:', err)
      setError('Could not add word')
      throw err
    } finally {
      setLoading(false)
    }
  }, [lookupWord])

  /**
   * Remove a word from vocabulary
   */
  const removeWord = useCallback((id: string) => {
    setWords(prev => prev.filter(word => word.id !== id))
  }, [])

  /**
   * Update a word's properties
   */
  const updateWord = useCallback((id: string, updates: Partial<VocabularyWord>) => {
    setWords(prev => 
      prev.map(word => 
        word.id === id ? { ...word, ...updates } : word
      )
    )
  }, [])

  /**
   * Toggle whether a word is mastered
   */
  const toggleMastered = useCallback((id: string) => {
    setWords(prev => 
      prev.map(word => 
        word.id === id 
          ? { 
              ...word, 
              mastered: !word.mastered,
              lastPracticed: new Date()
            } 
          : word
      )
    )
  }, [])

  /**
   * Toggle whether a word is a favorite
   */
  const toggleFavorite = useCallback((id: string) => {
    setWords(prev => 
      prev.map(word => 
        word.id === id 
          ? { ...word, favorite: !word.favorite } 
          : word
      )
    )
  }, [])

  /**
   * Get filtered words based on criteria
   */
  const filteredWords = useCallback((filter: 'all' | 'favorites' | 'mastered' | 'recent') => {
    switch (filter) {
      case 'favorites':
        return words.filter(word => word.favorite)
      case 'mastered':
        return words.filter(word => word.mastered)
      case 'recent':
        // Sort by date added, newest first
        return [...words].sort((a, b) => 
          b.dateAdded.getTime() - a.dateAdded.getTime()
        ).slice(0, 10)
      case 'all':
      default:
        return words
    }
  }, [words])

  /**
   * Get words organized by category
   */
  const getWordsByCategory = useCallback(() => {
    const byCategory: Record<string, VocabularyWord[]> = {}
    
    // Group words by category
    words.forEach(word => {
      const category = word.category || 'Uncategorized'
      if (!byCategory[category]) {
        byCategory[category] = []
      }
      byCategory[category].push(word)
    })
    
    return byCategory
  }, [words])

  // Memoize the result of getWordsByCategory
  const wordsByCategory = useMemo(() => getWordsByCategory(), [getWordsByCategory])

  return {
    words,
    loading,
    error,
    searchResults,
    searchTerm,
    setSearchTerm,
    addWord,
    removeWord,
    updateWord,
    toggleMastered,
    toggleFavorite,
    lookupWord,
    filteredWords,
    wordsByCategory
  }
} 