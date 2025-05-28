import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCw, BookOpen, ArrowLeft } from "lucide-react"
import useVocabulary from "@/hooks/use-vocabulary"
import Flashcard from "@/components/study-buddy/flashcard"

interface FlashcardPracticeProps {
  language: string
  onBack: () => void
  darkMode?: boolean
}

export default function FlashcardPractice({
  language,
  onBack,
  darkMode = false,
}: FlashcardPracticeProps) {
  const [filter, setFilter] = useState<'all' | 'favorites' | 'mastered' | 'recent'>('all')
  const [showWordFirst, setShowWordFirst] = useState(true)
  
  const {
    words,
    loading,
    error,
    filteredWords,
    toggleMastered,
    toggleFavorite,
  } = useVocabulary()
  
  // Get words for the current language
  const languageWords = words.filter(word => word.language.toLowerCase() === language.toLowerCase())
  
  // Apply the selected filter
  const wordsToShow = filteredWords(filter).filter(word => 
    word.language.toLowerCase() === language.toLowerCase()
  )
  
  // Handle flashcard completion
  const handleComplete = (results: { wordId: string, known: boolean }[]) => {
    // Update mastered status based on results
    results.forEach(result => {
      if (result.known) {
        toggleMastered(result.wordId)
      }
    })
  }
  
  if (loading) {
    return (
      <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
        <CardContent className="p-6 text-center">
          <p className={`animate-pulse ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Loading vocabulary...
          </p>
        </CardContent>
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
        <CardContent className="p-6 text-center">
          <p className={`text-red-500 mb-4 ${darkMode ? "text-opacity-80" : ""}`}>
            {error}
          </p>
          <Button onClick={() => window.location.reload()}>
            <RotateCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  if (languageWords.length === 0) {
    return (
      <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
        <CardContent className="p-6 text-center">
          <p className={`mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            No vocabulary words found for {language}. Add some words first!
          </p>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
          <h2 className={`text-lg font-semibold ${darkMode ? "text-white" : ""}`}>
            Flashcard Practice
          </h2>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className={`${showWordFirst ? 'bg-blue-50 border-blue-200' : ''}`}
            onClick={() => setShowWordFirst(true)}
          >
            Word → Translation
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={`${!showWordFirst ? 'bg-blue-50 border-blue-200' : ''}`}
            onClick={() => setShowWordFirst(false)}
          >
            Translation → Word
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({languageWords.length})</TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites ({languageWords.filter(w => w.favorite).length})
          </TabsTrigger>
          <TabsTrigger value="mastered">
            Mastered ({languageWords.filter(w => w.mastered).length})
          </TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Flashcard 
            words={wordsToShow}
            language={language}
            onComplete={handleComplete}
            showWordFirst={showWordFirst}
            darkMode={darkMode}
          />
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-4">
          <Flashcard 
            words={wordsToShow}
            language={language}
            onComplete={handleComplete}
            showWordFirst={showWordFirst}
            darkMode={darkMode}
          />
        </TabsContent>
        
        <TabsContent value="mastered" className="mt-4">
          <Flashcard 
            words={wordsToShow}
            language={language}
            onComplete={handleComplete}
            showWordFirst={showWordFirst}
            darkMode={darkMode}
          />
        </TabsContent>
        
        <TabsContent value="recent" className="mt-4">
          <Flashcard 
            words={wordsToShow}
            language={language}
            onComplete={handleComplete}
            showWordFirst={showWordFirst}
            darkMode={darkMode}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 