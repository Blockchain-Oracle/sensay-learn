import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Volume2, Check, X, ChevronRight, ChevronLeft, BarChart } from "lucide-react"
import useTextToSpeech from "@/hooks/use-text-to-speech"
import useSpeechRecognition from "@/hooks/use-speech-recognition"
import usePracticeSession from "@/hooks/use-practice-session"
import { calculatePronunciationAccuracy, generatePronunciationFeedback, getLanguageCode } from "@/lib/utils/speech-utils"
import { PracticePhrase } from "@/hooks/use-practice-session"

interface EnhancedPronunciationPracticeProps {
  phrases: PracticePhrase[]
  language: string
  onComplete?: (results: { phraseId: string, accuracy: number, userTranscript: string }[]) => void
  darkMode?: boolean
  showControls?: boolean
}

export default function EnhancedPronunciationPractice({
  phrases,
  language,
  onComplete,
  darkMode = false,
  showControls = true,
}: EnhancedPronunciationPracticeProps) {
  // Voice-related hooks
  const languageCode = getLanguageCode(language)
  const { speak, supported: ttsSupported, voices } = useTextToSpeech()
  const [languageSupported, setLanguageSupported] = useState(true)

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

  const {
    transcript,
    isListening,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    supported: srSupported,
    confidence,
  } = useSpeechRecognition(languageCode)

  // Practice session management
  const {
    currentPhrase,
    currentPhraseIndex,
    results,
    isSessionActive,
    isSessionComplete,
    sessionScore,
    startSession,
    nextPhrase,
    previousPhrase,
    recordResult,
    endSession,
    resetSession,
  } = usePracticeSession()
  
  // Component state
  const [isComparing, setIsComparing] = useState(false)
  const [currentAccuracy, setCurrentAccuracy] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Start the session when phrases change
  useEffect(() => {
    if (phrases.length > 0 && !isSessionActive && !isSessionComplete) {
      startSession(language, phrases)
    }
  }, [phrases, language, isSessionActive, isSessionComplete, startSession])

  // Play pronunciation automatically when phrase changes
  useEffect(() => {
    if (currentPhrase && ttsSupported) {
      // Small delay to ensure UI updates first
      const timer = setTimeout(() => {
        handlePlay()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentPhrase])

  // Analyze transcript when speech recognition completes
  useEffect(() => {
    if (isComparing && !isListening && transcript && currentPhrase) {
      // Calculate accuracy
      const accuracy = calculatePronunciationAccuracy(currentPhrase.phrase, transcript)
      setCurrentAccuracy(accuracy)
      
      // Generate feedback
      const feedbackText = generatePronunciationFeedback(accuracy)
      setFeedback(feedbackText)
      
      // Record the result
      recordResult({
        phraseId: currentPhrase.id,
        accuracy,
        userTranscript: transcript
      })
      
      // Show result
      setShowResult(true)
      setIsComparing(false)
    }
  }, [isComparing, isListening, transcript, currentPhrase, recordResult])

  // Handle session completion
  useEffect(() => {
    if (isSessionComplete && onComplete) {
      onComplete(results)
    }
  }, [isSessionComplete, results, onComplete])

  // Play the current phrase audio
  const handlePlay = () => {
    if (!currentPhrase) return
    
    speak(currentPhrase.phrase, languageCode, 0.8, 1, {
      onError: (err) => setError(`Could not play audio: ${err}`)
    })
  }

  // Record user's pronunciation
  const handleRecord = () => {
    if (!currentPhrase) return
    
    if (isListening) {
      stopListening()
      setIsComparing(true)
    } else {
      resetTranscript()
      setShowResult(false)
      setFeedback(null)
      setError(null)
      startListening()
    }
  }

  // Move to next phrase
  const handleNext = () => {
    setShowResult(false)
    setFeedback(null)
    resetTranscript()
    nextPhrase()
  }

  // Move to previous phrase
  const handlePrevious = () => {
    setShowResult(false)
    setFeedback(null)
    resetTranscript()
    previousPhrase()
  }

  // Complete the practice session
  const handleComplete = () => {
    endSession()
    if (onComplete) {
      onComplete(results)
    }
  }

  // Reset the session
  const handleReset = () => {
    resetTranscript()
    resetSession()
    startSession(language, phrases)
  }

  // Style helpers
  const resultBgColor = 
    currentAccuracy >= 90 ? 'bg-green-100' : 
    currentAccuracy >= 70 ? 'bg-blue-100' : 
    currentAccuracy >= 50 ? 'bg-yellow-100' : 
    'bg-red-100'
  
  const resultTextColor = 
    currentAccuracy >= 90 ? 'text-green-700' : 
    currentAccuracy >= 70 ? 'text-blue-700' : 
    currentAccuracy >= 50 ? 'text-yellow-700' : 
    'text-red-700'

  // Error states
  if (!ttsSupported || !srSupported) {
    return (
      <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100'}`}>
        <p className="mb-2">
          Speech capabilities not supported in this browser. 
          Try Chrome, Edge or Safari for the full experience.
        </p>
        <Button onClick={() => window.location.reload()}>Reload Page</Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-800 text-red-300' : 'bg-red-50 text-red-600'}`}>
        <p className="mb-2">{error}</p>
        <Button onClick={() => setError(null)}>Dismiss</Button>
      </div>
    )
  }

  if (speechError) {
    return (
      <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-800 text-yellow-300' : 'bg-yellow-50 text-yellow-600'}`}>
        <p className="mb-2">{speechError}</p>
        <Button onClick={() => window.location.reload()}>Reload Page</Button>
      </div>
    )
  }

  // Session complete view
  if (isSessionComplete) {
    return (
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50'}`}>
        <div className="text-center mb-6">
          <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Practice Complete!
          </h3>
          <div className="flex items-center justify-center mb-4">
            <BarChart className="h-5 w-5 mr-2 text-green-500" />
            <span className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {sessionScore}%
            </span>
          </div>
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            You've completed practicing {phrases.length} phrases in {language}.
          </p>
          <div className="flex justify-center space-x-3">
            <Button onClick={handleReset}>
              Practice Again
            </Button>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="space-y-3">
          <h4 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Your Results:</h4>
          {results.map((result) => {
            const phrase = phrases.find(p => p.id === result.phraseId)
            if (!phrase) return null
            
            const resultClass = 
              result.accuracy >= 90 ? 'bg-green-100 border-green-200' : 
              result.accuracy >= 70 ? 'bg-blue-100 border-blue-200' : 
              result.accuracy >= 50 ? 'bg-yellow-100 border-yellow-200' : 
              'bg-red-100 border-red-200'
            
            return (
              <div 
                key={result.phraseId}
                className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : resultClass}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-medium ${darkMode ? 'text-white' : ''}`}>
                    {phrase.phrase}
                  </span>
                  <span className={`font-bold ${darkMode ? 'text-white' : ''}`}>
                    {result.accuracy}%
                  </span>
                </div>
                <p className={`text-xs italic ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  You said: "{result.userTranscript}"
                </p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Loading state
  if (!currentPhrase) {
    return (
      <div className={`p-4 rounded-lg text-center animate-pulse ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100'}`}>
        <p>Loading practice phrases...</p>
      </div>
    )
  }

  // Main practice UI
  return (
    <div>
      <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
        {showControls && (
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>
              Pronunciation Practice
            </CardTitle>
            <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {currentPhraseIndex + 1} of {phrases.length}
            </div>
          </CardHeader>
        )}

        <CardContent className="pt-4 space-y-4">
          {/* Progress bar */}
          <Progress 
            value={(currentPhraseIndex / phrases.length) * 100} 
            className="h-1 mb-4"
          />
          
          {/* Language support warning */}
          {!languageSupported && (
            <div className={`px-3 py-2 rounded text-sm ${darkMode ? "bg-yellow-800 text-yellow-200" : "bg-yellow-100 text-yellow-800"}`}>
              <p>Limited browser support for {language}. Some features may use English instead. For best results, try Chrome browser.</p>
            </div>
          )}
          
          {/* Phrase to practice */}
          <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-green-50"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xl font-medium ${darkMode ? "text-white" : ""}`}>
                {currentPhrase.phrase}
              </span>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handlePlay}
                title="Listen to pronunciation"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
            {currentPhrase.pronunciation && (
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {currentPhrase.pronunciation}
              </p>
            )}
            {currentPhrase.translation && (
              <p className={`text-sm mt-1 italic ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {currentPhrase.translation}
              </p>
            )}
          </div>

          {/* Recording controls */}
          <div className="flex flex-col items-center space-y-3">
            <Button
              onClick={handleRecord}
              variant={isListening ? "destructive" : "default"}
              className="w-full"
              disabled={isComparing}
              size="lg"
            >
              {isListening ? (
                <>
                  <MicOff className="h-5 w-5 mr-2" /> Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" /> Record Pronunciation
                </>
              )}
            </Button>
            
            {isListening && (
              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} animate-pulse`}>
                Listening... Speak now
              </p>
            )}
            
            {isComparing && (
              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} animate-pulse`}>
                Analyzing your pronunciation...
              </p>
            )}
          </div>

          {/* Results */}
          {showResult && (
            <div className={`mt-4 p-4 rounded-lg ${darkMode ? "bg-gray-700" : resultBgColor}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${darkMode ? "text-white" : resultTextColor}`}>
                  {currentAccuracy >= 70 ? (
                    <div className="flex items-center">
                      <Check className="h-5 w-5 mr-1" /> 
                      Your pronunciation
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <X className="h-5 w-5 mr-1" />
                      Try again
                    </div>
                  )}
                </span>
                <span className={`text-lg font-bold ${darkMode ? "text-white" : resultTextColor}`}>
                  {currentAccuracy}%
                </span>
              </div>
              
              <div className="mb-3">
                <Progress value={currentAccuracy} className="h-2" />
              </div>
              
              {feedback && (
                <p className={`text-sm mb-3 ${darkMode ? "text-gray-300" : resultTextColor}`}>
                  {feedback}
                </p>
              )}
              
              <div className="mt-2 text-sm">
                <div className={`font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  You said:
                </div>
                <div className={`italic ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  "{transcript}"
                </div>
              </div>
              
              {/* Try again or continue buttons */}
              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowResult(false)
                    resetTranscript()
                  }}
                >
                  Try Again
                </Button>
                <Button 
                  size="sm"
                  onClick={handleNext}
                >
                  {currentPhraseIndex === phrases.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            </div>
          )}

          {/* Navigation controls */}
          {showControls && !showResult && (
            <div className="flex justify-between mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPhraseIndex === 0 || isListening}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>

              {currentPhraseIndex === phrases.length - 1 ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleComplete}
                  disabled={isListening}
                >
                  Complete Practice
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={isListening}
                >
                  Skip <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 