import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Headphones } from "lucide-react"
import useConversationScenarios, { ConversationScenario } from "@/hooks/use-conversation-scenarios"
import EnhancedPronunciationPractice from "@/components/study-buddy/enhanced-pronunciation-practice"
import { PracticePhrase } from "@/hooks/use-practice-session"
import { getLanguageCode } from "@/lib/utils/speech-utils"

interface PronunciationPracticePageProps {
  language: string
  onBack: () => void
  darkMode?: boolean
}

export default function PronunciationPracticePage({
  language,
  onBack,
  darkMode = false,
}: PronunciationPracticePageProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [practiceActive, setPracticeActive] = useState(false)
  const [practicePhrases, setPracticePhrases] = useState<PracticePhrase[]>([])
  
  const {
    scenarios,
    currentScenario,
    setCurrentScenario,
    getScenariosByLanguage,
  } = useConversationScenarios()
  
  // Get scenarios for the current language
  const languageScenarios = getScenariosByLanguage(language)
  
  // Filter scenarios by difficulty
  const filteredScenarios = languageScenarios.filter(
    scenario => scenario.difficulty === difficulty
  )
  
  // When scenario is selected
  useEffect(() => {
    if (selectedScenarioId) {
      setCurrentScenario(selectedScenarioId)
    }
  }, [selectedScenarioId, setCurrentScenario])
  
  // Create practice phrases when scenario changes
  useEffect(() => {
    if (!currentScenario) return
    
    const phrases: PracticePhrase[] = currentScenario.phrases.map((phrase, index) => ({
      id: `phrase_${currentScenario.id}_${index}`,
      phrase,
      translation: '', // Translations would be provided in a real app
      difficulty: currentScenario.difficulty,
      category: currentScenario.title,
      language: currentScenario.language,
    }))
    
    setPracticePhrases(phrases)
  }, [currentScenario])
  
  // Handle starting practice
  const handleStartPractice = () => {
    if (practicePhrases.length === 0) return
    setPracticeActive(true)
  }
  
  // Handle practice completion
  const handlePracticeComplete = (results: { phraseId: string, accuracy: number, userTranscript: string }[]) => {
    console.log('Practice complete with results:', results)
    // In a real app, we would save these results, update stats, etc.
  }
  
  // Default practice phrases if no scenario is selected
  const getDefaultPhrases = (): PracticePhrase[] => {
    const defaultPhrases = [
      "Hello, how are you?",
      "My name is...",
      "I would like to learn more",
      "Could you speak more slowly?",
      "Thank you very much",
    ]
    
    const languageCode = getLanguageCode(language)
    
    // Map of default phrases for different languages
    const translations: Record<string, string[]> = {
      "es-ES": [
        "Hola, ¿cómo estás?",
        "Me llamo...",
        "Me gustaría aprender más",
        "¿Podría hablar más despacio?",
        "Muchas gracias",
      ],
      "fr-FR": [
        "Bonjour, comment allez-vous?",
        "Je m'appelle...",
        "Je voudrais apprendre davantage",
        "Pourriez-vous parler plus lentement?",
        "Merci beaucoup",
      ],
      "de-DE": [
        "Hallo, wie geht es Ihnen?",
        "Ich heiße...",
        "Ich möchte mehr lernen",
        "Könnten Sie langsamer sprechen?",
        "Vielen Dank",
      ],
    }
    
    const phrases = translations[languageCode] || defaultPhrases
    
    return phrases.map((phrase, index) => ({
      id: `default_phrase_${index}`,
      phrase,
      translation: defaultPhrases[index] || '',
      difficulty: 'beginner',
      category: 'Basic Phrases',
      language,
    }))
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center">
          <Headphones className="h-5 w-5 mr-2 text-green-600" />
          <h2 className={`text-lg font-semibold ${darkMode ? "text-white" : ""}`}>
            Pronunciation Practice
          </h2>
        </div>
      </div>
      
      {/* Practice Settings */}
      {!practiceActive && (
        <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
          <CardHeader>
            <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>
              Choose Practice Scenario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Difficulty selector */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : ""}`}>
                Difficulty Level
              </label>
              <div className="flex space-x-2">
                <Button 
                  variant={difficulty === 'beginner' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setDifficulty('beginner')}
                >
                  Beginner
                </Button>
                <Button 
                  variant={difficulty === 'intermediate' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setDifficulty('intermediate')}
                >
                  Intermediate
                </Button>
                <Button 
                  variant={difficulty === 'advanced' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setDifficulty('advanced')}
                >
                  Advanced
                </Button>
              </div>
            </div>
            
            {/* Scenario selector */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : ""}`}>
                Conversation Scenario
              </label>
              {filteredScenarios.length > 0 ? (
                <Select value={selectedScenarioId || ''} onValueChange={setSelectedScenarioId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredScenarios.map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  No scenarios available for {language} at {difficulty} level.
                </p>
              )}
            </div>
            
            {/* Start button */}
            <div className="pt-4">
              <Button 
                className="w-full" 
                onClick={handleStartPractice}
                disabled={filteredScenarios.length === 0 && !selectedScenarioId}
              >
                Start Practice
              </Button>
              
              {filteredScenarios.length === 0 && (
                <p className={`text-sm mt-2 text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Default phrases will be used if no scenario is selected.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Practice Interface */}
      {practiceActive && (
        <EnhancedPronunciationPractice
          phrases={practicePhrases.length > 0 ? practicePhrases : getDefaultPhrases()}
          language={language}
          onComplete={handlePracticeComplete}
          darkMode={darkMode}
        />
      )}
    </div>
  )
} 