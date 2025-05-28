import { useState, useEffect, useCallback } from 'react'
import { isSpeechRecognitionSupported } from '@/lib/utils/speech-utils'

interface SpeechRecognitionHook {
  transcript: string
  isListening: boolean
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  supported: boolean
  confidence: number
}

/**
 * Hook for speech recognition functionality
 * @param lang - BCP 47 language tag (e.g., 'en-US', 'es-ES')
 * @returns Speech recognition controls and status
 */
export default function useSpeechRecognition(lang = 'en-US'): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recognition, setRecognition] = useState<any>(null)
  const [supported, setSupported] = useState(false)
  const [confidence, setConfidence] = useState(0)

  // Initialize the recognition object
  useEffect(() => {
    // Check browser support using the utility function
    if (!isSpeechRecognitionSupported()) {
      setSupported(false)
      setError('Speech recognition not supported in this browser')
      return
    }
    
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition
      
      setSupported(true)
      
      const recognitionInstance = new SpeechRecognition()
      
      // Configure the recognition
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = true
      recognitionInstance.lang = lang
      
      // Handle recognition results
      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = ''
        let maxConfidence = 0
        
        // Process results, including interim ones
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript
          
          // Track the highest confidence for feedback
          if (result[0].confidence > maxConfidence) {
            maxConfidence = result[0].confidence
          }
          
          // If this is a final result, add it to the final transcript
          if (result.isFinal) {
            finalTranscript += transcript
          }
        }
        
        // If we have a final transcript, use it
        if (finalTranscript) {
          setTranscript(finalTranscript)
        } 
        // Otherwise use the last result (interim)
        else if (event.results.length > 0) {
          setTranscript(event.results[event.results.length - 1][0].transcript)
        }
        
        // Set confidence level (0-100)
        setConfidence(Math.round(maxConfidence * 100))
      }
      
      // Handle errors
      recognitionInstance.onerror = (event: any) => {
        const errorMessages: Record<string, string> = {
          'no-speech': 'No speech was detected. Please try again.',
          'audio-capture': 'No microphone was found or microphone is disabled.',
          'not-allowed': 'Microphone permission was denied. Please allow microphone access.',
          'network': 'A network error occurred. Speech recognition requires internet connection.',
          'aborted': 'Speech recognition was aborted.',
          'service-not-allowed': 'Speech recognition service is not allowed.'
        }
        
        const errorMessage = errorMessages[event.error] || `Error: ${event.error}`
        console.error('Speech recognition error:', event.error)
        setError(errorMessage)
        setIsListening(false)
        
        // For network errors, try to auto-recover after a short delay
        if (event.error === 'network') {
          setTimeout(() => {
            setError('Attempting to reconnect...')
            try {
              recognitionInstance.abort()
            } catch (e) {
              // Ignore abort errors
            }
          }, 2000)
        }
      }
      
      // Handle recognition end
      recognitionInstance.onend = () => {
        setIsListening(false)
      }
      
      setRecognition(recognitionInstance)
    } catch (error) {
      console.error('Error initializing speech recognition:', error)
      setSupported(false)
      setError('Error initializing speech recognition')
    }

    // Cleanup on unmount
    return () => {
      if (recognition) {
        try {
          recognition.abort()
        } catch (error) {
          console.error('Error aborting speech recognition:', error)
        }
      }
    }
  }, [lang])

  /**
   * Start listening for speech input
   */
  const startListening = useCallback(() => {
    if (!recognition) return
    
    setError(null)
    setTranscript('')
    setIsListening(true)
    
    try {
      recognition.start()
    } catch (error) {
      // Handle the already running error that occurs in some browsers
      if (error instanceof DOMException && error.name === 'InvalidStateError') {
        recognition.stop()
        setTimeout(() => {
          recognition.start()
        }, 200)
      } else {
        console.error('Speech recognition error:', error)
        setError('Error starting speech recognition')
        setIsListening(false)
      }
    }
  }, [recognition])

  /**
   * Stop listening for speech input
   */
  const stopListening = useCallback(() => {
    if (!recognition) return
    
    try {
      recognition.stop()
      setIsListening(false)
    } catch (error) {
      console.error('Speech recognition error:', error)
      setError('Error stopping speech recognition')
    }
  }, [recognition])

  /**
   * Reset the transcript
   */
  const resetTranscript = useCallback(() => {
    setTranscript('')
    setConfidence(0)
  }, [])

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    resetTranscript,
    supported,
    confidence
  }
} 