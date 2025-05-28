import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Search, Volume2 } from "lucide-react"
import { VocabularyWord } from "@/hooks/use-vocabulary"
import useTextToSpeech from "@/hooks/use-text-to-speech"
import { getLanguageCode } from "@/lib/utils/speech-utils"

interface VocabularyInputProps {
  onAddWord: (word: Omit<VocabularyWord, 'id' | 'dateAdded'>) => Promise<VocabularyWord>
  onLookupWord: (word: string, language: string) => Promise<any>
  loading: boolean
  language: string
  darkMode?: boolean
  categories?: string[]
}

export default function VocabularyInput({
  onAddWord,
  onLookupWord,
  loading,
  language,
  darkMode = false,
  categories = ["Greetings", "Food", "Travel", "Business", "Family", "Hobbies", "Numbers", "Colors", "Weather", "Time"]
}: VocabularyInputProps) {
  const [wordText, setWordText] = useState("")
  const [translation, setTranslation] = useState("")
  const [pronunciation, setPronunciation] = useState("")
  const [category, setCategory] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [lookupMode, setLookupMode] = useState(false)
  
  const { speak } = useTextToSpeech()
  const languageCode = getLanguageCode(language)

  // Handle looking up a word
  const handleLookup = async () => {
    if (!wordText.trim()) {
      setError("Please enter a word to look up")
      return
    }
    
    setError(null)
    
    try {
      const result = await onLookupWord(wordText, language)
      
      if (result) {
        // Auto-fill fields from lookup result
        setTranslation(result.definitions[0]?.definition || "")
        setPronunciation(result.phonetic || "")
      } else {
        setError("No definition found for this word")
      }
    } catch (err) {
      console.error("Error looking up word:", err)
      setError("Failed to look up word")
    }
  }

  // Play pronunciation of the word
  const handlePlayPronunciation = () => {
    if (!wordText.trim()) return
    speak(wordText, languageCode)
  }

  // Add a new word to vocabulary
  const handleAddWord = async () => {
    if (!wordText.trim()) {
      setError("Word is required")
      return
    }
    
    if (!translation.trim()) {
      setError("Translation is required")
      return
    }
    
    setError(null)
    
    try {
      await onAddWord({
        word: wordText.trim(),
        translation: translation.trim(),
        pronunciation: pronunciation.trim() || undefined,
        category: category || undefined,
        mastered: false,
        favorite: false,
        language
      })
      
      // Reset form
      setWordText("")
      setTranslation("")
      setPronunciation("")
      setCategory("")
    } catch (err) {
      console.error("Error adding word:", err)
      setError("Failed to add word")
    }
  }

  return (
    <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
      <CardHeader>
        <CardTitle className={`text-lg flex items-center ${darkMode ? "text-white" : ""}`}>
          <Plus className="h-5 w-5 mr-2 text-blue-600" />
          Add New Vocabulary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Word input with lookup option */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label 
              htmlFor="word" 
              className={darkMode ? "text-gray-300" : ""}
            >
              Word
            </Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLookupMode(!lookupMode)}
              className={`text-xs ${darkMode ? "text-gray-300" : ""}`}
            >
              {lookupMode ? "Manual Entry" : "Dictionary Lookup"}
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              {lookupMode && (
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              )}
              <Input
                id="word"
                value={wordText}
                onChange={(e) => setWordText(e.target.value)}
                className={lookupMode ? "pl-9" : ""}
                placeholder={lookupMode ? "Search word to lookup..." : "Enter new word"}
              />
            </div>
            
            {lookupMode ? (
              <Button onClick={handleLookup} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={handlePlayPronunciation}
                title="Hear pronunciation"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Translation */}
        <div className="space-y-2">
          <Label 
            htmlFor="translation" 
            className={darkMode ? "text-gray-300" : ""}
          >
            Translation
          </Label>
          <Input
            id="translation"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            placeholder="Enter translation"
          />
        </div>
        
        {/* Pronunciation */}
        <div className="space-y-2">
          <Label 
            htmlFor="pronunciation" 
            className={darkMode ? "text-gray-300" : ""}
          >
            Pronunciation (optional)
          </Label>
          <Input
            id="pronunciation"
            value={pronunciation}
            onChange={(e) => setPronunciation(e.target.value)}
            placeholder="e.g. hoh-LAH"
          />
        </div>
        
        {/* Category */}
        <div className="space-y-2">
          <Label 
            htmlFor="category" 
            className={darkMode ? "text-gray-300" : ""}
          >
            Category (optional)
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Error message */}
        {error && (
          <div className={`text-sm ${darkMode ? "text-red-400" : "text-red-600"}`}>
            {error}
          </div>
        )}
        
        {/* Add button */}
        <Button 
          className="w-full"
          onClick={handleAddWord}
          disabled={loading || !wordText.trim() || !translation.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" /> Add to Vocabulary
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
} 