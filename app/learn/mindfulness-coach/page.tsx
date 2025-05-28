"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ArrowLeft, Heart, Smile, Frown, Meh, Zap, Moon, 
  Volume2, VolumeX, Mic, MicOff, Clock 
} from "lucide-react"
import ChatInterface from "@/components/chat-interface"
import { useAuth } from "@/hooks/use-auth"

// Define types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error: any;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onerror: (event: SpeechRecognitionEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function MindfulnessCoachPage() {
  const { user } = useAuth()
  const userId = user?.id || "guest-user"
  const [selectedMood, setSelectedMood] = useState("")
  const [completedExercises, setCompletedExercises] = useState<number[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [activeBreathingSession, setActiveBreathingSession] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale")
  const [breathingCount, setBreathingCount] = useState(0)

  // Refs for speech recognition and synthesis
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const ambientSoundRef = useRef<HTMLAudioElement | null>(null)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Check if browser supports speech recognition and synthesis
    if (typeof window !== 'undefined') {
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
        recognitionRef.current = new SpeechRecognitionAPI()
        
        if (recognitionRef.current) {
          recognitionRef.current.continuous = true
          recognitionRef.current.interimResults = true
          
          recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            const result = event.results[event.results.length - 1]
            if (result.isFinal) {
              setTranscript(result[0].transcript)
            }
          }
          
          recognitionRef.current.onerror = (event: SpeechRecognitionEvent) => {
            console.error('Speech recognition error', event.error)
            setIsListening(false)
          }
        }
      }
      
      // Initialize speech synthesis
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis
      }
    }
    
    // Initialize ambient sound
    ambientSoundRef.current = new Audio('/sounds/ambient-meditation.mp3')
    ambientSoundRef.current.loop = true
    
    return () => {
      // Cleanup
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
      if (ambientSoundRef.current) {
        ambientSoundRef.current.pause()
      }
    }
  }, [])

  // Handle sound toggle
  useEffect(() => {
    if (ambientSoundRef.current) {
      if (soundEnabled) {
        ambientSoundRef.current.play().catch(e => console.error("Audio play failed:", e))
      } else {
        ambientSoundRef.current.pause()
      }
    }
  }, [soundEnabled])

  // Handle breathing animation
  useEffect(() => {
    if (!activeBreathingSession) return
    
    let timer: NodeJS.Timeout
    
    if (breathingPhase === "inhale") {
      speak("Breathe in")
      timer = setTimeout(() => {
        setBreathingPhase("hold")
        setBreathingCount(0)
      }, 4000)
    } else if (breathingPhase === "hold") {
      speak("Hold")
      timer = setTimeout(() => {
        setBreathingPhase("exhale")
        setBreathingCount(0)
      }, 7000)
    } else {
      speak("Breathe out")
      timer = setTimeout(() => {
        setBreathingPhase("inhale")
        setBreathingCount(prev => prev + 1)
        
        // End session after 5 cycles
        if (breathingCount >= 4) {
          setActiveBreathingSession(false)
          speak("Great job. Breathing exercise complete.")
        }
      }, 8000)
    }
    
    return () => clearTimeout(timer)
  }, [breathingPhase, activeBreathingSession, breathingCount])

  // Toggle speech recognition
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
      setIsListening(true)
    }
  }

  // Text-to-speech function
  const speak = (text: string) => {
    if (!synthRef.current || !soundEnabled) return
    
    // Cancel any ongoing speech
    synthRef.current.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9 // Slightly slower for mindfulness
    utterance.pitch = 1
    utterance.volume = 1
    
    synthRef.current.speak(utterance)
  }

  // Start a guided breathing session
  const startBreathingExercise = () => {
    setActiveBreathingSession(true)
    setBreathingPhase("inhale")
    setBreathingCount(0)
    speak("Let's begin our 4-7-8 breathing exercise. Get comfortable and we'll start with breathing in for 4 seconds.")
  }

  const moods = [
    { id: "happy", label: "Happy", icon: Smile, color: "bg-green-100 text-green-600 border-green-200" },
    { id: "stressed", label: "Stressed", icon: Zap, color: "bg-red-100 text-red-600 border-red-200" },
    { id: "tired", label: "Tired", icon: Moon, color: "bg-blue-100 text-blue-600 border-blue-200" },
    { id: "neutral", label: "Neutral", icon: Meh, color: "bg-gray-100 text-gray-600 border-gray-200" },
    { id: "anxious", label: "Anxious", icon: Frown, color: "bg-orange-100 text-orange-600 border-orange-200" },
  ]

  const exercises = [
    {
      id: 1,
      title: "4-7-8 Breathing",
      duration: "5 min",
      category: "Breathing",
      description: "Inhale for 4, hold for 7, exhale for 8",
      action: startBreathingExercise
    },
    {
      id: 2,
      title: "Body Scan Meditation",
      duration: "10 min",
      category: "Meditation",
      description: "Progressive relaxation from head to toe",
      action: () => speak("Let's begin a body scan meditation. Start by focusing on the top of your head and slowly move your attention down through your body, noticing any sensations without judgment.")
    },
    {
      id: 3,
      title: "Gratitude Journaling",
      duration: "8 min",
      category: "Journaling",
      description: "Write down 3 things you're grateful for",
      action: () => speak("Take a moment to reflect on three things you're grateful for today. Consider writing them down in a journal.")
    },
    {
      id: 4,
      title: "Mindful Walking",
      duration: "15 min",
      category: "Movement",
      description: "Focus on each step and breath",
      action: () => speak("For mindful walking, find a space where you can walk slowly. Focus on the sensation of each step, the feeling of your feet touching the ground, and your breath as you move.")
    },
    {
      id: 5,
      title: "Progressive Muscle Relaxation",
      duration: "12 min",
      category: "Relaxation",
      description: "Tense and release muscle groups",
      action: () => speak("Let's begin progressive muscle relaxation. We'll work through each muscle group, tensing for 5 seconds and then releasing completely.")
    },
    {
      id: 6,
      title: "Loving-Kindness Meditation",
      duration: "7 min",
      category: "Meditation",
      description: "Send compassion to yourself and others",
      action: () => speak("Let's practice loving-kindness meditation. Begin by directing positive wishes toward yourself. May I be happy. May I be healthy. May I be safe.")
    },
  ]

  const systemPrompt = `You are a Mindfulness & Mental Health Coach. Based on the user's selected mood (${selectedMood || "not selected"}), provide personalized guidance. Your role is to:
- Guide users through stress relief and relaxation techniques
- Provide mindfulness exercises and meditation guidance
- Help users develop emotional awareness and regulation skills
- Offer coping strategies for anxiety, stress, and difficult emotions
- Teach breathing exercises and grounding techniques
- Support mental well-being through positive psychology approaches
- Adapt guidance based on the user's current emotional state

Be compassionate, non-judgmental, and supportive. Always encourage professional help when needed.`

  const toggleExercise = (exerciseId: number) => {
    const exercise = exercises.find(ex => ex.id === exerciseId)
    
    setCompletedExercises((prev) =>
      prev.includes(exerciseId) ? prev.filter((id) => id !== exerciseId) : [...prev, exerciseId],
    )
    
    // If exercise is being completed, trigger its action
    if (!completedExercises.includes(exerciseId) && exercise?.action) {
      exercise.action()
    }
  }

  const getMoodBasedSuggestions = () => {
    switch (selectedMood) {
      case "stressed":
        return [
          "Guide me through a breathing exercise",
          "I need help calming down",
          "What's a quick stress relief technique?",
        ]
      case "tired":
        return [
          "Help me with gentle energizing exercises",
          "I'm exhausted, what can help?",
          "Guide me through a body scan",
        ]
      case "anxious":
        return ["I'm feeling anxious, can you help?", "Teach me grounding techniques", "Help me with worry management"]
      default:
        return ["How are you feeling today?", "Guide me through a mindfulness exercise", "Help me practice gratitude"]
    }
  }

  // Handle changing mood with voice
  useEffect(() => {
    if (!transcript) return
    
    const lowerTranscript = transcript.toLowerCase()
    
    // Check for mood keywords
    moods.forEach(mood => {
      if (lowerTranscript.includes(`feeling ${mood.id}`) || 
          lowerTranscript.includes(`i'm ${mood.id}`) || 
          lowerTranscript.includes(`i am ${mood.id}`)) {
        setSelectedMood(mood.id)
        speak(`I understand you're feeling ${mood.id}. Let me suggest some exercises that might help.`)
      }
    })
    
    // Check for exercise keywords
    if (lowerTranscript.includes("breathing exercise") || lowerTranscript.includes("four seven eight")) {
      startBreathingExercise()
    }
    
    // Reset transcript after processing
    setTranscript("")
  }, [transcript, moods])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Floating animation elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur shadow-sm border-b relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-green-600" />
                <span className="text-xl font-semibold text-gray-900">Mindfulness Coach</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Voice Recognition Toggle */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleListening}
                className={isListening ? "bg-green-50 text-green-600" : ""}
              >
                {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              
              {/* Sound Toggle */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={soundEnabled ? "bg-blue-50 text-blue-600" : ""}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Mood Selector */}
        <Card className="mb-6 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">How are you feeling today?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {moods.map((mood) => {
                const IconComponent = mood.icon
                return (
                  <Button
                    key={mood.id}
                    variant={selectedMood === mood.id ? "default" : "outline"}
                    className={`${mood.color} ${selectedMood === mood.id ? "ring-2 ring-green-500" : ""}`}
                    onClick={() => {
                      setSelectedMood(mood.id)
                      speak(`I understand you're feeling ${mood.label}. Let me suggest some exercises that might help.`)
                    }}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {mood.label}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-16rem)]">
          {/* Left Panel - Exercises */}
          <div className="col-span-4">
            <Card className="h-full bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Mindfulness Exercises</CardTitle>
                <p className="text-sm text-gray-600">
                  {completedExercises.length} of {exercises.length} completed today
                </p>
              </CardHeader>
              <CardContent className="space-y-3 overflow-y-auto">
                {exercises.map((exercise) => (
                  <div 
                    key={exercise.id} 
                    className={`flex items-start space-x-3 p-3 hover:bg-green-50 rounded border transition-all ${
                      completedExercises.includes(exercise.id) ? "bg-green-50 border-green-300" : ""
                    }`}
                  >
                    <Checkbox
                      checked={completedExercises.includes(exercise.id)}
                      onCheckedChange={() => toggleExercise(exercise.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium">{exercise.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {exercise.duration}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{exercise.description}</p>
                      <Badge variant="secondary" className="text-xs">
                        {exercise.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center - AI Chat */}
          <div className="col-span-8">
            <Card className="h-full bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Your Mindfulness Guide</CardTitle>
                    {selectedMood && (
                      <p className="text-sm text-gray-600">
                        Personalized guidance for when you're feeling {selectedMood}
                      </p>
                    )}
                  </div>
                  {selectedMood && (
                    <Badge className="bg-green-100 text-green-700">
                      Mood: {moods.find((m) => m.id === selectedMood)?.label}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <div className="flex-1 px-6 pb-6">
                <ChatInterface
                  title=""
                  description=""
                  icon={<></>}
                  systemPrompt={systemPrompt}
                  placeholderMessage="Tell me how you're feeling or ask for guidance..."
                  suggestedQuestions={getMoodBasedSuggestions()}
                  onMessageResponse={(message) => {
                    if (soundEnabled) {
                      speak(message)
                    }
                  }}
                  apiEndpoint="/api/chat/mindfulness"
                  userId={userId}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Breathing Exercise Overlay */}
        {activeBreathingSession && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md text-center">
              <h2 className="text-2xl font-semibold mb-6">4-7-8 Breathing</h2>
              
              <div className="relative w-40 h-40 mx-auto mb-8">
                <div 
                  className={`absolute inset-0 bg-blue-500 rounded-full transition-all duration-[4000ms] ${
                    breathingPhase === "inhale" 
                      ? "scale-100 opacity-70" 
                      : breathingPhase === "hold" 
                        ? "scale-100 opacity-70 border-4 border-green-500" 
                        : "scale-50 opacity-40"
                  }`}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                  {breathingPhase === "inhale" ? "Inhale" : breathingPhase === "hold" ? "Hold" : "Exhale"}
                </div>
              </div>
              
              <p className="text-lg mb-2">
                {breathingPhase === "inhale" ? "Breathe in through your nose" : 
                 breathingPhase === "hold" ? "Hold your breath" : 
                 "Exhale slowly through your mouth"}
              </p>
              
              <div className="flex justify-center mb-6">
                <Badge className="text-lg px-4 py-2">
                  Cycle: {breathingCount + 1}/5
                </Badge>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setActiveBreathingSession(false)}
              >
                End Session
              </Button>
            </div>
          </div>
        )}
        
        {/* Breathing Animation Overlay (non-interactive version) */}
        {selectedMood === "stressed" && !activeBreathingSession && (
          <div className="fixed bottom-8 right-8 z-20 cursor-pointer" onClick={startBreathingExercise}>
            <div className="relative">
              <div className="w-20 h-20 bg-green-400 rounded-full opacity-30 animate-ping"></div>
              <div className="absolute inset-0 w-20 h-20 bg-green-500 rounded-full opacity-50 animate-pulse"></div>
              <div className="absolute inset-2 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                Breathe
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
