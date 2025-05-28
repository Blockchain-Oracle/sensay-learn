import { useState, useEffect, useCallback } from 'react'

export interface ConversationScenario {
  id: string
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  description: string
  phrases: string[]
  dialogues?: string[]
  language: string
}

interface ConversationScenariosHook {
  scenarios: ConversationScenario[]
  currentScenario: ConversationScenario | null
  loading: boolean
  error: string | null
  setCurrentScenario: (id: string) => void
  getScenariosByLanguage: (language: string) => ConversationScenario[]
  getScenariosByDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced') => ConversationScenario[]
  getRandomPhrase: (scenarioId?: string, language?: string) => string | null
}

/**
 * Predefined conversation scenarios for different languages
 */
export const conversationScenarios: ConversationScenario[] = [
  {
    id: "restaurant",
    title: "Ordering at a Restaurant",
    difficulty: "beginner",
    description: "Practice ordering food and drinks",
    language: "spanish",
    phrases: [
      "Me gustaría...",
      "¿Puedo tener...?",
      "La cuenta, por favor",
      "¿Cuál es el especial del día?",
      "¿Puedo ver el menú?",
      "Una mesa para dos, por favor",
    ],
  },
  {
    id: "hotel",
    title: "Hotel Check-in",
    difficulty: "intermediate",
    description: "Check into a hotel and ask about amenities",
    language: "spanish",
    phrases: [
      "Tengo una reserva",
      "¿A qué hora es el desayuno?",
      "¿Podría llamar un taxi?",
      "¿Tiene WiFi gratis?",
      "¿Dónde está el ascensor?",
      "¿Puede recomendarme un restaurante?",
    ],
  },
  {
    id: "shopping",
    title: "Shopping for Clothes",
    difficulty: "beginner",
    description: "Buy clothes and ask about sizes",
    language: "spanish",
    phrases: [
      "¿Cuánto cuesta esto?",
      "¿Tiene esto en talla...?",
      "¿Puedo probármelo?",
      "¿Acepta tarjetas de crédito?",
      "¿Hay descuentos?",
      "¿Dónde están los probadores?",
    ],
  },
  {
    id: "business",
    title: "Business Meeting",
    difficulty: "advanced",
    description: "Professional conversation and presentations",
    language: "spanish",
    phrases: [
      "Permítame presentar...",
      "¿Qué piensa sobre...?",
      "Me gustaría programar...",
      "¿Podemos discutir los detalles?",
      "¿Cuál es el plazo?",
      "Estoy de acuerdo con su propuesta",
    ],
  },
  {
    id: "restaurant-fr",
    title: "Au Restaurant",
    difficulty: "beginner",
    description: "Commandez de la nourriture et des boissons",
    language: "french",
    phrases: [
      "Je voudrais...",
      "Est-ce que je peux avoir...?",
      "L'addition, s'il vous plaît",
      "Quel est le plat du jour?",
      "Est-ce que je peux voir le menu?",
      "Une table pour deux, s'il vous plaît",
    ],
  },
  {
    id: "hotel-fr",
    title: "À l'Hôtel",
    difficulty: "intermediate",
    description: "Enregistrez-vous à l'hôtel et renseignez-vous sur les commodités",
    language: "french",
    phrases: [
      "J'ai une réservation",
      "À quelle heure est le petit-déjeuner?",
      "Pourriez-vous appeler un taxi?",
      "Avez-vous du WiFi gratuit?",
      "Où est l'ascenseur?",
      "Pouvez-vous me recommander un restaurant?",
    ],
  },
  {
    id: "restaurant-de",
    title: "Im Restaurant",
    difficulty: "beginner",
    description: "Essen und Getränke bestellen",
    language: "german",
    phrases: [
      "Ich hätte gerne...",
      "Kann ich... haben?",
      "Die Rechnung, bitte",
      "Was ist das Tagesgericht?",
      "Kann ich die Speisekarte sehen?",
      "Einen Tisch für zwei, bitte",
    ],
  },
  {
    id: "shopping-de",
    title: "Einkaufen",
    difficulty: "intermediate",
    description: "Kleidung kaufen und nach Größen fragen",
    language: "german",
    phrases: [
      "Wie viel kostet das?",
      "Haben Sie das in Größe...?",
      "Kann ich das anprobieren?",
      "Akzeptieren Sie Kreditkarten?",
      "Gibt es Rabatte?",
      "Wo sind die Umkleidekabinen?",
    ],
  },
]

/**
 * Hook for managing conversation scenarios
 * @returns Functions and state for scenario management
 */
export default function useConversationScenarios(): ConversationScenariosHook {
  const [scenarios, setScenarios] = useState<ConversationScenario[]>(conversationScenarios)
  const [currentScenario, setCurrentScenarioState] = useState<ConversationScenario | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load any custom scenarios from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const savedScenarios = localStorage.getItem('custom-scenarios')
      if (savedScenarios) {
        const parsedScenarios = JSON.parse(savedScenarios) as ConversationScenario[]
        // Combine with predefined scenarios
        setScenarios([...conversationScenarios, ...parsedScenarios])
      }
    } catch (err) {
      console.error('Error loading custom scenarios:', err)
      setError('Could not load custom scenarios')
    }
  }, [])

  /**
   * Set the current scenario by ID
   */
  const setCurrentScenario = useCallback((id: string) => {
    const scenario = scenarios.find(s => s.id === id) || null
    setCurrentScenarioState(scenario)
  }, [scenarios])

  /**
   * Get scenarios for a specific language
   */
  const getScenariosByLanguage = useCallback((language: string) => {
    return scenarios.filter(s => s.language.toLowerCase() === language.toLowerCase())
  }, [scenarios])

  /**
   * Get scenarios by difficulty level
   */
  const getScenariosByDifficulty = useCallback((difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    return scenarios.filter(s => s.difficulty === difficulty)
  }, [scenarios])

  /**
   * Get a random phrase from the current or specified scenario
   */
  const getRandomPhrase = useCallback((scenarioId?: string, language?: string): string | null => {
    let targetScenarios: ConversationScenario[] = []
    
    if (scenarioId) {
      // Get phrases from a specific scenario
      const scenario = scenarios.find(s => s.id === scenarioId)
      if (scenario) {
        targetScenarios = [scenario]
      }
    } else if (language) {
      // Get phrases from scenarios in a specific language
      targetScenarios = getScenariosByLanguage(language)
    } else if (currentScenario) {
      // Get phrases from the current scenario
      targetScenarios = [currentScenario]
    } else {
      // No scenario specified
      return null
    }
    
    if (targetScenarios.length === 0) return null
    
    // Get all phrases from the target scenarios
    const allPhrases = targetScenarios.flatMap(s => s.phrases)
    if (allPhrases.length === 0) return null
    
    // Return a random phrase
    const randomIndex = Math.floor(Math.random() * allPhrases.length)
    return allPhrases[randomIndex]
  }, [scenarios, currentScenario, getScenariosByLanguage])

  return {
    scenarios,
    currentScenario,
    loading,
    error,
    setCurrentScenario,
    getScenariosByLanguage,
    getScenariosByDifficulty,
    getRandomPhrase
  }
} 