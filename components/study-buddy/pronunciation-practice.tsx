import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Volume2, Check, X } from "lucide-react"
import useTextToSpeech from "@/hooks/use-text-to-speech"
import useSpeechRecognition from "@/hooks/use-speech-recognition"

interface PronunciationPracticeProps {
  phrase: string
  translation?: string
  pronunciation?: string
  language: string
  onAccuracyChange?: (accuracy: number) => void
  darkMode?: boolean
}

export default function PronunciationPractice({
  phrase,
  translation,
  pronunciation,
  language,
  onAccuracyChange,
  darkMode = false,
}: PronunciationPracticeProps) {
  const [isComparing, setIsComparing] = useState(false)
  const [accuracy, setAccuracy] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  
  // Get language code for speech recognition
  const languageCodeMap: Record<string, string> = {
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
  
  const languageCode = languageCodeMap[language.toLowerCase()] || "en-US"
  const [languageSupported, setLanguageSupported] = useState(true)
  
  // Text-to-speech hook for playback
  const { speak, supported: ttsSupported, voices } = useTextToSpeech()
  
  // Speech recognition hook for user input
  const {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    resetTranscript,
    supported: srSupported,
  } = useSpeechRecognition(languageCode)

  // Check if the language has available voices
  useEffect(() => {
    // Short delay to ensure voices are loaded
    const timer = setTimeout(() => {
      if (voices.length > 0 && languageCode !== 'en-US') {
        const hasMatchingVoice = voices.some(voice => 
          voice.lang === languageCode || voice.lang.startsWith(languageCode.split('-')[0])
        )
        setLanguageSupported(hasMatchingVoice)
        
        if (!hasMatchingVoice) {
          console.warn(`No voices found for language: ${languageCode} (${language}). Using browser default.`)
        }
      }
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [voices, languageCode, language])

  // Play pronunciation
  const handlePlay = () => {
    speak(phrase, languageCode, 0.8, 1, {
      onError: (err) => console.error(`Error playing pronunciation: ${err}`)
    })
  }

  // Record user's pronunciation
  const handleRecord = () => {
    if (isListening) {
      stopListening()
      setIsComparing(true)
    } else {
      resetTranscript()
      setShowResult(false)
      setFeedback(null)
      startListening()
    }
  }

  // Compare the transcript with the expected phrase
  useEffect(() => {
    if (isComparing && !isListening && transcript) {
      // Simple string similarity algorithm (Levenshtein distance)
      const calculateSimilarity = (a: string, b: string): number => {
        const longer = a.length > b.length ? a : b
        const shorter = a.length > b.length ? b : a
        
        if (longer.length === 0) return 1.0
        
        // Normalize and clean strings for comparison
        const normalizedA = a.toLowerCase().trim()
        const normalizedB = b.toLowerCase().trim()
        
        // Simple word count comparison - adjust this algorithm based on your needs
        const wordsA = normalizedA.split(/\s+/)
        const wordsB = normalizedB.split(/\s+/)
        
        // Count matching words
        let matches = 0
        for (const word of wordsA) {
          if (wordsB.includes(word)) matches++
        }
        
        // Calculate accuracy percentage
        const accuracyScore = Math.min(100, Math.round((matches / Math.max(wordsA.length, wordsB.length)) * 100))
        
        return accuracyScore
      }
      
      const similarityScore = calculateSimilarity(phrase, transcript)
      setAccuracy(similarityScore)
      
      // Generate feedback
      if (similarityScore >= 90) {
        setFeedback("Excellent! Your pronunciation is spot on!")
      } else if (similarityScore >= 70) {
        setFeedback("Good job! Keep practicing to perfect your pronunciation.")
      } else if (similarityScore >= 50) {
        setFeedback("Not bad, but there's room for improvement.")
      } else {
        setFeedback("Try again, focus on the pronunciation guide.")
      }
      
      setShowResult(true)
      setIsComparing(false)
      
      // Notify parent component
      if (onAccuracyChange) {
        onAccuracyChange(similarityScore)
      }
    }
  }, [isComparing, isListening, transcript, phrase, onAccuracyChange])

  // Reset when phrase changes
  useEffect(() => {
    resetTranscript()
    setShowResult(false)
    setFeedback(null)
    setIsComparing(false)
  }, [phrase, resetTranscript])

  const resultBgColor = 
    accuracy >= 90 ? 'bg-green-100' : 
    accuracy >= 70 ? 'bg-blue-100' : 
    accuracy >= 50 ? 'bg-yellow-100' : 
    'bg-red-100'
  
  const resultTextColor = 
    accuracy >= 90 ? 'text-green-700' : 
    accuracy >= 70 ? 'text-blue-700' : 
    accuracy >= 50 ? 'text-yellow-700' : 
    'text-red-700'

  if (!ttsSupported || !srSupported) {
    return (
      <div className={`p-3 rounded ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100'}`}>
        <p className="text-center text-sm">
          Speech capabilities not supported in this browser. 
          Try Chrome, Edge or Safari for the full experience.
        </p>
      </div>
    )
  }

  return (
    <div>
      <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
        <CardContent className="pt-6 space-y-4">
          {/* Language support warning */}
          {!languageSupported && (
            <div className={`px-3 py-2 rounded text-sm ${darkMode ? "bg-yellow-800 text-yellow-200" : "bg-yellow-100 text-yellow-800"}`}>
              <p>Limited browser support for {language}. Some features may use English instead. For best results, try Chrome browser.</p>
            </div>
          )}
          
          {/* Phrase to practice */}
          <div className={`p-3 rounded ${darkMode ? "bg-gray-700" : "bg-green-50"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-lg font-medium ${darkMode ? "text-white" : ""}`}>{phrase}</span>
              <Button size="sm" variant="ghost" onClick={handlePlay}>
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            {pronunciation && (
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{pronunciation}</p>
            )}
            {translation && (
              <p className={`text-xs mt-1 italic ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{translation}</p>
            )}
          </div>

          {/* Recording controls */}
          <div className="flex flex-col items-center space-y-2">
            <Button
              onClick={handleRecord}
              variant={isListening ? "destructive" : "default"}
              className="w-full"
              disabled={isComparing}
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" /> Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" /> Record Pronunciation
                </>
              )}
            </Button>
            
            {isListening && (
              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Listening... Speak now
              </p>
            )}
            
            {isComparing && (
              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Analyzing your pronunciation...
              </p>
            )}
          </div>

          {/* Results */}
          {showResult && (
            <div className={`mt-4 p-3 rounded ${darkMode ? "bg-gray-700" : resultBgColor}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${darkMode ? "text-white" : resultTextColor}`}>
                  {accuracy >= 70 ? (
                    <div className="flex items-center">
                      <Check className="h-4 w-4 mr-1" /> 
                      Your pronunciation
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      Try again
                    </div>
                  )}
                </span>
                <span className={`font-bold ${darkMode ? "text-white" : resultTextColor}`}>
                  {accuracy}%
                </span>
              </div>
              
              <div className="mb-2">
                <Progress value={accuracy} className="h-2" />
              </div>
              
              {feedback && (
                <p className={`text-sm mt-2 ${darkMode ? "text-gray-300" : resultTextColor}`}>
                  {feedback}
                </p>
              )}
              
              <div className="mt-3 text-sm">
                <div className={`font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>You said:</div>
                <div className={`italic ${darkMode ? "text-gray-400" : "text-gray-600"}`}>"{transcript}"</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 