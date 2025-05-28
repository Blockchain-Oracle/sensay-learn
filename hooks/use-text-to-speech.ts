import { useState, useEffect, useCallback } from 'react'
import { 
  isSpeechSynthesisSupported, 
  getBestVoiceForLanguage,
  cleanPronunciation
} from '@/lib/utils/speech-utils'

interface TextToSpeechHook {
  speak: (text: string, lang?: string, rate?: number, pitch?: number, options?: SpeakOptions) => void
  cancel: () => void
  pause: () => void
  resume: () => void
  isPaused: boolean
  isSpeaking: boolean
  supported: boolean
  voices: SpeechSynthesisVoice[]
  error: string | null
  setVoice: (voice: SpeechSynthesisVoice) => void
  currentVoice: SpeechSynthesisVoice | null
}

interface SpeakOptions {
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: string) => void
  preferredVoice?: SpeechSynthesisVoice
  emphasizeWords?: boolean
}

/**
 * Hook for text-to-speech functionality
 * @returns Text-to-speech controls and status
 */
export default function useTextToSpeech(): TextToSpeechHook {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [supported, setSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    // Check browser support using the utility function
    if (!isSpeechSynthesisSupported()) {
      setSupported(false)
      setError('Text-to-speech not supported in this browser')
      return
    }

    setSupported(true)

    // Function to populate voices
    const populateVoices = () => {
      try {
        const availableVoices = window.speechSynthesis.getVoices()
        
        // Sort voices by language then by local vs remote
        const sortedVoices = [...availableVoices].sort((a, b) => {
          // First compare by language
          const langCompare = a.lang.localeCompare(b.lang)
          if (langCompare !== 0) return langCompare
          
          // Then prioritize local (higher quality) voices
          if (a.localService && !b.localService) return -1
          if (!a.localService && b.localService) return 1
          
          // Finally sort by name
          return a.name.localeCompare(b.name)
        })
        
        setVoices(sortedVoices)
        
        // Set a default voice if none is selected
        if (!currentVoice && sortedVoices.length > 0) {
          // Prefer a high-quality English voice as default
          const defaultVoice = sortedVoices.find(v => 
            v.lang.startsWith('en') && v.localService
          ) || sortedVoices[0]
          
          setCurrentVoice(defaultVoice)
        }
      } catch (err) {
        console.error('Error getting voices:', err)
        setError('Error getting voices')
      }
    }

    // Initial population of voices
    populateVoices()

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoices
    }

    // Set up event listeners for speech synthesis
    const speechEventHandlers = {
      start: () => setIsSpeaking(true),
      end: () => {
        setIsSpeaking(false)
        setIsPaused(false)
      },
      pause: () => setIsPaused(true),
      resume: () => setIsPaused(false),
      error: (event: any) => {
        setError(`Speech synthesis error: ${event.error}`)
        setIsSpeaking(false)
        setIsPaused(false)
      }
    }

    // Add event listeners if browser supports them
    if (window.speechSynthesis.addEventListener) {
      Object.entries(speechEventHandlers).forEach(([event, handler]) => {
        window.speechSynthesis.addEventListener(event, handler as EventListener)
      })
    }

    // Clean up
    return () => {
      // Remove event listeners if browser supports them
      if (window.speechSynthesis.removeEventListener) {
        Object.entries(speechEventHandlers).forEach(([event, handler]) => {
          window.speechSynthesis.removeEventListener(event, handler as EventListener)
        })
      }
      
      // Cancel any ongoing speech
      if (supported) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  /**
   * Speak text with the given parameters
   * @param text - Text to speak
   * @param lang - BCP 47 language tag (e.g., 'en-US')
   * @param rate - Speech rate (0.1 to 10)
   * @param pitch - Speech pitch (0 to 2)
   * @param options - Additional options
   */
  const speak = useCallback((
    text: string, 
    lang = 'en-US', 
    rate = 1, 
    pitch = 1,
    options?: SpeakOptions
  ) => {
    if (!supported) {
      const errorMsg = 'Text-to-speech not supported'
      setError(errorMsg)
      options?.onError?.(errorMsg)
      return
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      // Clean up the text if needed for pronunciation
      const cleanedText = options?.emphasizeWords 
        ? text 
        : cleanPronunciation(text)
      
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(cleanedText)
      
      // Log available voices for debugging
      console.log(`Available voices for ${lang}:`, voices.filter(v => v.lang.startsWith(lang.split('-')[0])).map(v => `${v.name} (${v.lang})`))
      
      // Set voice based on preference or language
      let selectedVoice = null
      
      if (options?.preferredVoice) {
        selectedVoice = options.preferredVoice
        console.log(`Using preferred voice: ${selectedVoice.name} (${selectedVoice.lang})`)
      } else if (currentVoice && currentVoice.lang.startsWith(lang.split('-')[0])) {
        selectedVoice = currentVoice
        console.log(`Using current voice: ${selectedVoice.name} (${selectedVoice.lang})`)
      } else {
        // Find best voice for this language
        selectedVoice = getBestVoiceForLanguage(voices, lang)
        
        if (selectedVoice) {
          console.log(`Found voice for ${lang}: ${selectedVoice.name} (${selectedVoice.lang})`)
        } else {
          console.warn(`No voice found for language ${lang}, falling back to browser default`)
        }
      }
      
      // Set the selected voice if found
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
      
      // Always set the language code
      utterance.lang = lang
      console.log(`Final utterance settings: lang=${utterance.lang}, voice=${utterance.voice?.name || 'default'}, text=${cleanedText.substring(0, 30)}...`)
      
      // Set other properties
      utterance.rate = Math.max(0.1, Math.min(10, rate)) // Clamp between 0.1 and 10
      utterance.pitch = Math.max(0, Math.min(2, pitch)) // Clamp between 0 and 2
      
      // Add event handlers if provided
      if (options?.onStart) utterance.onstart = options.onStart
      if (options?.onEnd) utterance.onend = options.onEnd
      if (options?.onError) utterance.onerror = (e) => options.onError?.(`Speech error: ${e.error}`)
      
      // Start speaking
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
      setIsPaused(false)
      setError(null)
    } catch (err) {
      const errorMsg = 'Error speaking'
      console.error(errorMsg, err)
      setError(errorMsg)
      options?.onError?.(errorMsg)
    }
  }, [supported, voices, currentVoice])

  /**
   * Cancel ongoing speech
   */
  const cancel = useCallback(() => {
    if (!supported) return
    
    try {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setIsPaused(false)
    } catch (err) {
      console.error('Error canceling speech:', err)
      setError('Error canceling speech')
    }
  }, [supported])

  /**
   * Pause ongoing speech
   */
  const pause = useCallback(() => {
    if (!supported || !isSpeaking) return
    
    try {
      window.speechSynthesis.pause()
      setIsPaused(true)
    } catch (err) {
      console.error('Error pausing speech:', err)
      setError('Error pausing speech')
    }
  }, [supported, isSpeaking])

  /**
   * Resume paused speech
   */
  const resume = useCallback(() => {
    if (!supported || !isPaused) return
    
    try {
      window.speechSynthesis.resume()
      setIsPaused(false)
    } catch (err) {
      console.error('Error resuming speech:', err)
      setError('Error resuming speech')
    }
  }, [supported, isPaused])

  return {
    speak,
    cancel,
    pause,
    resume,
    isPaused,
    isSpeaking,
    supported,
    voices,
    error,
    setVoice: setCurrentVoice,
    currentVoice
  }
} 