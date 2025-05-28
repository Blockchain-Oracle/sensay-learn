import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Volume2, Heart, Plus, ChevronDown, ChevronUp, Star } from "lucide-react"
import useTextToSpeech from "@/hooks/use-text-to-speech"
import { WordDefinition } from "@/lib/services/dictionary-service"

interface VocabularyCardProps {
  word: string
  translation: string
  category?: string
  definitions?: WordDefinition | null
  pronunciation?: string
  language: string
  mastered?: boolean
  favorite?: boolean
  darkMode?: boolean
  onToggleFavorite?: () => void
  onToggleMastered?: () => void
  onPlayAudio?: () => void
}

export default function VocabularyCard({
  word,
  translation,
  category,
  definitions,
  pronunciation,
  language,
  mastered = false,
  favorite = false,
  darkMode = false,
  onToggleFavorite,
  onToggleMastered,
  onPlayAudio,
}: VocabularyCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { speak } = useTextToSpeech()

  // Get language code for speech
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

  const handlePlayAudio = () => {
    // If there's an external audio handler (e.g. for custom audio files)
    if (onPlayAudio) {
      onPlayAudio()
      return
    }

    // Otherwise use the browser's text-to-speech
    speak(word, languageCode)
  }

  return (
    <Card className={`${darkMode ? "border-gray-600 bg-gray-700" : "bg-gray-50"} overflow-hidden`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <span className={`text-lg font-medium ${darkMode ? "text-white" : ""}`}>{word}</span>
            {mastered && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
          </div>
          <div className="flex space-x-1">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handlePlayAudio}
              title="Listen to pronunciation"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant={favorite ? "default" : "ghost"} 
              onClick={onToggleFavorite}
              title={favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`h-4 w-4 ${favorite ? "fill-current text-red-500" : ""}`} />
            </Button>
          </div>
        </div>
        
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          {translation}
        </p>
        
        {category && (
          <Badge variant="outline" className="text-xs mt-1">
            {category}
          </Badge>
        )}

        {definitions && (
          <div className="mt-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-auto flex items-center text-sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  <span>Hide details</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  <span>Show details</span>
                </>
              )}
            </Button>

            {expanded && (
              <div className={`mt-2 p-3 rounded ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                {pronunciation && (
                  <div className="mb-2">
                    <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Pronunciation: 
                    </span>
                    <span className={`text-xs ml-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {pronunciation}
                    </span>
                  </div>
                )}
                
                {definitions && definitions.phonetic && !pronunciation && (
                  <div className="mb-2">
                    <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Pronunciation: 
                    </span>
                    <span className={`text-xs ml-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {definitions.phonetic}
                    </span>
                  </div>
                )}
                
                {definitions && definitions.definitions && (
                  <div className="space-y-3">
                    {definitions.definitions.slice(0, 3).map((def, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center">
                          <Badge variant="secondary" className="mr-2 text-xs">
                            {def.partOfSpeech}
                          </Badge>
                          <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {def.definition}
                          </p>
                        </div>
                        
                        {def.example && (
                          <p className={`text-xs italic pl-1 border-l-2 border-gray-300 ml-1 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}>
                            "{def.example}"
                          </p>
                        )}
                        
                        {def.synonyms && def.synonyms.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {def.synonyms.slice(0, 5).map((synonym, synIndex) => (
                              <Badge key={synIndex} variant="outline" className="text-xs">
                                {synonym}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between mt-3">
          <Button 
            variant="outline"
            size="sm"
            className={`text-xs ${darkMode ? "border-gray-600 text-gray-300" : ""}`}
            onClick={onToggleMastered}
          >
            {mastered ? "Unmark as mastered" : "Mark as mastered"}
          </Button>
          
          <Button 
            variant="ghost"
            size="sm"
            className={`text-xs ${darkMode ? "text-gray-300" : ""}`}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add to study set
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 