import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Volume2, ArrowRight, ArrowLeft, Check, X, RotateCw } from "lucide-react"
import { VocabularyWord } from "@/hooks/use-vocabulary"
import useTextToSpeech from "@/hooks/use-text-to-speech"
import { getLanguageCode } from "@/lib/utils/speech-utils"

interface FlashcardProps {
  words: VocabularyWord[]
  language: string
  onComplete?: (results: { wordId: string, known: boolean }[]) => void
  showWordFirst?: boolean
  darkMode?: boolean
}

export default function Flashcard({
  words,
  language,
  onComplete,
  showWordFirst = true,
  darkMode = false,
}: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState<{ wordId: string, known: boolean }[]>([])
  const [complete, setComplete] = useState(false)
  
  const { speak } = useTextToSpeech()
  const languageCode = getLanguageCode(language)
  
  const currentWord = words[currentIndex]
  
  // Play pronunciation of the current word
  const handlePlay = () => {
    if (!currentWord) return
    speak(currentWord.word, languageCode)
  }
  
  // Flip the card to show the other side
  const handleFlip = () => {
    setFlipped(!flipped)
  }
  
  // Mark the current word as known/unknown and move to the next
  const handleResult = (known: boolean) => {
    const result = { wordId: currentWord.id, known }
    setResults(prev => [...prev, result])
    
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setFlipped(false)
    } else {
      setComplete(true)
      if (onComplete) {
        onComplete([...results, result])
      }
    }
  }
  
  // Move to the previous card
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setFlipped(false)
      
      // Remove the last result
      setResults(prev => prev.slice(0, -1))
    }
  }
  
  // Reset the flashcard session
  const handleReset = () => {
    setCurrentIndex(0)
    setFlipped(false)
    setResults([])
    setComplete(false)
  }
  
  // Display completion screen when done
  if (complete) {
    const knownCount = results.filter(r => r.known).length
    const percentage = Math.round((knownCount / words.length) * 100)
    
    return (
      <Card className={`${darkMode ? "bg-gray-800 border-gray-700" : ""} overflow-hidden`}>
        <CardContent className="p-6 text-center">
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : ""}`}>
            Practice Complete!
          </h3>
          
          <div className="mb-4">
            <div className={`text-3xl font-bold mb-2 ${darkMode ? "text-green-400" : "text-green-600"}`}>
              {percentage}%
            </div>
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              You knew {knownCount} out of {words.length} words
            </p>
          </div>
          
          <Button onClick={handleReset}>
            <RotateCw className="h-4 w-4 mr-2" />
            Practice Again
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  // If no words or invalid index
  if (!currentWord) {
    return (
      <Card className={`${darkMode ? "bg-gray-800 border-gray-700" : ""} overflow-hidden`}>
        <CardContent className="p-6 text-center">
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            No vocabulary words available for practice
          </p>
        </CardContent>
      </Card>
    )
  }
  
  // Front side content
  const frontContent = showWordFirst ? (
    <>
      <div className="mb-2 flex items-center justify-between">
        <Badge variant={darkMode ? "outline" : "secondary"} className="text-xs">
          {currentWord.category || "Vocabulary"}
        </Badge>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={handlePlay}
          title="Listen to pronunciation"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>
      <div className={`text-2xl font-bold mb-4 ${darkMode ? "text-white" : ""}`}>
        {currentWord.word}
      </div>
      {currentWord.pronunciation && (
        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          {currentWord.pronunciation}
        </div>
      )}
    </>
  ) : (
    <>
      <div className="mb-2">
        <Badge variant={darkMode ? "outline" : "secondary"} className="text-xs">
          {currentWord.category || "Vocabulary"}
        </Badge>
      </div>
      <div className={`text-2xl font-bold mb-4 ${darkMode ? "text-white" : ""}`}>
        {currentWord.translation}
      </div>
    </>
  )
  
  // Back side content
  const backContent = showWordFirst ? (
    <>
      <div className={`text-lg font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
        Translation:
      </div>
      <div className={`text-2xl font-bold mb-4 ${darkMode ? "text-white" : ""}`}>
        {currentWord.translation}
      </div>
    </>
  ) : (
    <>
      <div className={`text-lg font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
        Word:
      </div>
      <div className="flex items-center justify-center mb-4">
        <div className={`text-2xl font-bold mr-3 ${darkMode ? "text-white" : ""}`}>
          {currentWord.word}
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={handlePlay}
          title="Listen to pronunciation"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>
      {currentWord.pronunciation && (
        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          {currentWord.pronunciation}
        </div>
      )}
    </>
  )
  
  return (
    <div>
      <Card 
        className={`
          ${darkMode ? "bg-gray-800 border-gray-700" : ""} 
          overflow-hidden cursor-pointer transition-all duration-300
          ${flipped ? "shadow-lg" : ""}
        `}
        onClick={handleFlip}
      >
        <CardContent className="p-6 text-center min-h-[200px] flex flex-col justify-center">
          {flipped ? backContent : frontContent}
          
          <div className={`text-xs mt-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            Click to flip
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between mt-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleResult(false)}
            className="border-red-200 hover:border-red-300 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1 text-red-500" /> Don't Know
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleResult(true)}
            className="border-green-200 hover:border-green-300 hover:bg-green-50"
          >
            <Check className="h-4 w-4 mr-1 text-green-500" /> Know
          </Button>
        </div>
        
        {currentIndex < words.length - 1 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setCurrentIndex(currentIndex + 1)
              setFlipped(false)
              setResults(prev => [...prev, { wordId: currentWord.id, known: false }])
            }}
          >
            Skip <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          {currentIndex + 1} of {words.length}
        </span>
      </div>
    </div>
  )
} 