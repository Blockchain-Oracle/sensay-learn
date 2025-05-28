"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  Upload,
  Brain,
  Users,
  Target,
  Moon,
  Sun,
  Plus,
  Share,
  Download,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Circle,
  BarChart3,
  Calendar as CalendarIcon,
  ChevronRight,
  AlertCircle
} from "lucide-react"
import ChatInterface from "@/components/chat-interface"
import { format } from "date-fns"
import PomodoroTimer from "@/components/study/PomodoroTimer"
import CalendarComponent from "@/components/study/CalendarComponent"

// Add type for Google API window
declare global {
  interface Window {
    gapi: any;
  }
}

// Add type for calendar events
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  subject?: string;
}

// Type for flashcards
interface Flashcard {
  question: string;
  answer: string;
}

// Type for quiz questions
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

// Type for concept nodes
interface ConceptNode {
  id: string;
  label: string;
  color?: string;
  x?: number;
  y?: number;
}

// Type for concept links
interface ConceptLink {
  source: string;
  target: string;
  label?: string;
}

export default function StudyBuddyPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60) // 25 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [currentGoal, setCurrentGoal] = useState("Complete Math Chapter 5")
  
  // Google Calendar integration
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    description: "",
    subject: "",
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000), // Default to 1 hour
  })
  const [showAddEvent, setShowAddEvent] = useState(false)

  // Google Auth
  const [isGoogleAuthorized, setIsGoogleAuthorized] = useState(false)
  const googleApiLoaded = useRef(false)

  // Document upload and processing
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedText, setUploadedText] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [generatedContentType, setGeneratedContentType] = useState<'summary' | 'flashcards' | 'quiz'>('summary')
  const [isProcessingContent, setIsProcessingContent] = useState(false)
  const [processingError, setProcessingError] = useState("")

  // Flashcards
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [flashcardsFlipped, setFlashcardsFlipped] = useState<boolean[]>([])

  // Quiz
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [quizResults, setQuizResults] = useState<boolean[]>([])
  const [quizScore, setQuizScore] = useState<number | null>(null)

  // Concept map
  const [conceptMapNodes, setConceptMapNodes] = useState<ConceptNode[]>([
    { id: '1', label: 'Photosynthesis', color: '#4CAF50', x: 300, y: 200 },
    { id: '2', label: 'Chlorophyll', color: '#81C784', x: 150, y: 300 },
    { id: '3', label: 'Light Energy', color: '#FFC107', x: 450, y: 100 },
    { id: '4', label: 'Carbon Dioxide', color: '#90CAF9', x: 450, y: 300 },
    { id: '5', label: 'Water', color: '#90CAF9', x: 150, y: 100 },
    { id: '6', label: 'Glucose', color: '#FF8A65', x: 600, y: 200 },
    { id: '7', label: 'Oxygen', color: '#90CAF9', x: 600, y: 300 },
  ])
  const [conceptMapLinks, setConceptMapLinks] = useState<ConceptLink[]>([
    { source: '1', target: '2', label: 'uses' },
    { source: '1', target: '3', label: 'requires' },
    { source: '1', target: '4', label: 'consumes' },
    { source: '1', target: '5', label: 'consumes' },
    { source: '1', target: '6', label: 'produces' },
    { source: '1', target: '7', label: 'releases' },
  ])
  const [newConceptMap, setNewConceptMap] = useState<{topic: string, content: string}>({
    topic: '',
    content: ''
  })
  const [isGeneratingMap, setIsGeneratingMap] = useState(false)
  const [showConceptMapForm, setShowConceptMapForm] = useState(false)
  const [conceptMapTopic, setConceptMapTopic] = useState("Photosynthesis")
  const conceptMapRef = useRef<HTMLDivElement>(null)

  // For responsive design
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check window size for responsive design
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mock events - would be replaced with actual Google Calendar events
  useEffect(() => {
    // Dummy events - would be replaced with actual Google Calendar API calls
    const dummyEvents = [
      {
        id: "1",
        title: "Math Study Session",
        start: new Date(new Date().setHours(10, 0, 0, 0)),
        end: new Date(new Date().setHours(11, 30, 0, 0)),
        subject: "Mathematics"
      },
      {
        id: "2",
        title: "Physics Lab Prep",
        start: new Date(new Date().setHours(14, 0, 0, 0)),
        end: new Date(new Date().setHours(15, 0, 0, 0)),
        subject: "Physics"
      }
    ]
    setCalendarEvents(dummyEvents)

    // Google Calendar API setup
    if (!googleApiLoaded.current && typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = initGoogleCalendarApi
      document.body.appendChild(script)
      googleApiLoaded.current = true
    }
  }, [])

  const initGoogleCalendarApi = () => {
    if (window.gapi) {
      window.gapi.load('client:auth2', () => {
        window.gapi.client.init({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
          clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          scope: 'https://www.googleapis.com/auth/calendar'
        }).then(() => {
          // Check if already signed in
          if (window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
            setIsGoogleAuthorized(true)
            loadCalendarEvents()
          }
        })
      })
    }
  }

  const handleGoogleSignIn = () => {
    if (window.gapi && window.gapi.auth2) {
      window.gapi.auth2.getAuthInstance().signIn().then(() => {
        setIsGoogleAuthorized(true)
        loadCalendarEvents()
      })
    }
  }

  const loadCalendarEvents = () => {
    if (window.gapi && window.gapi.client) {
      window.gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
      }).then((response: any) => {
        const events = response.result.items.map((event: any) => ({
          id: event.id,
          title: event.summary,
          start: new Date(event.start.dateTime || event.start.date),
          end: new Date(event.end.dateTime || event.end.date),
          description: event.description
        }))
        setCalendarEvents(events)
      })
    }
  }

  const addEventToGoogleCalendar = () => {
    if (!newEvent.title) return
    
    if (window.gapi && window.gapi.client && isGoogleAuthorized) {
      const event = {
        'summary': newEvent.title,
        'description': newEvent.description || 'Study session',
        'start': {
          'dateTime': newEvent.start?.toISOString(),
          'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        'end': {
          'dateTime': newEvent.end?.toISOString(),
          'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }

      window.gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
      }).then(() => {
        loadCalendarEvents()
        setShowAddEvent(false)
        setNewEvent({
          title: "",
          description: "",
          start: new Date(),
          end: new Date(new Date().getTime() + 60 * 60 * 1000)
        })
      })
    } else {
      // For demo purposes, just add to local state
      const newLocalEvent = {
        id: Math.random().toString(36).substring(7),
        title: newEvent.title || "",
        description: newEvent.description || "",
        subject: newEvent.subject || "",
        start: newEvent.start || new Date(),
        end: newEvent.end || new Date(new Date().getTime() + 60 * 60 * 1000)
      }
      setCalendarEvents([...calendarEvents, newLocalEvent])
      setShowAddEvent(false)
      setNewEvent({
        title: "",
        description: "",
        start: new Date(),
        end: new Date(new Date().getTime() + 60 * 60 * 1000)
      })
    }
  }

  // Document upload and processing functions
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setUploadedFile(file)

    // For PDF files, we'd use a PDF parsing library
    // For this demo, we'll just pretend we can extract text from any file
    if (file.type === 'text/plain') {
      try {
        const text = await file.text()
        setUploadedText(text)
      } catch (error) {
        console.error('Error reading file:', error)
        setProcessingError('Error reading file')
      }
    }
  }

  const generateSummary = async () => {
    if (!uploadedText && !uploadedFile) return
    
    setIsProcessingContent(true)
    setGeneratedContentType('summary')
    setProcessingError('')
    
    try {
      // In a real app, this would be an API call to a summarization service
      // For demo purposes, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock summary generation
      const summary = `This document covers key concepts in ${uploadedFile?.name || 'the provided text'}.
      
Main points:
1. Introduction to the subject matter and fundamental principles
2. Key theories and their applications in real-world scenarios
3. Methods for problem-solving and analytical approaches
4. Recent developments and future directions in the field

The material builds upon previous concepts and establishes a foundation for advanced topics. Important formulas and definitions are highlighted throughout the text, with examples demonstrating practical applications.`
      
      setGeneratedContent(summary)
      setIsProcessingContent(false)
    } catch (error) {
      console.error('Error generating summary:', error)
      setProcessingError('Failed to generate summary')
      setIsProcessingContent(false)
    }
  }

  const generateFlashcards = async () => {
    if (!uploadedText && !uploadedFile) return
    
    setIsProcessingContent(true)
    setGeneratedContentType('flashcards')
    setProcessingError('')
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock flashcard generation
      const mockFlashcards: Flashcard[] = [
        { question: "What is the definition of photosynthesis?", answer: "The process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water." },
        { question: "What is the primary function of chlorophyll?", answer: "To absorb light energy for the photosynthesis process." },
        { question: "What is the chemical equation for photosynthesis?", answer: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂" },
        { question: "What organelle in plant cells is responsible for photosynthesis?", answer: "Chloroplasts" },
        { question: "What are the two stages of photosynthesis?", answer: "Light-dependent reactions and light-independent reactions (Calvin cycle)" }
      ]
      
      setFlashcards(mockFlashcards)
      setFlashcardsFlipped(new Array(mockFlashcards.length).fill(false))
      setIsProcessingContent(false)
    } catch (error) {
      console.error('Error generating flashcards:', error)
      setProcessingError('Failed to generate flashcards')
      setIsProcessingContent(false)
    }
  }

  const generateQuiz = async () => {
    if (!uploadedText && !uploadedFile) return
    
    setIsProcessingContent(true)
    setGeneratedContentType('quiz')
    setProcessingError('')
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock quiz generation
      const mockQuiz: QuizQuestion[] = [
        {
          question: "What is the main function of photosynthesis?",
          options: [
            "Breaking down glucose for energy",
            "Converting light energy to chemical energy",
            "Converting oxygen to carbon dioxide",
            "Breaking down proteins into amino acids"
          ],
          correctAnswer: 1
        },
        {
          question: "Which of the following is NOT a product of photosynthesis?",
          options: [
            "Oxygen",
            "Glucose",
            "Carbon dioxide",
            "ATP"
          ],
          correctAnswer: 2
        },
        {
          question: "Where does the light-dependent reaction take place?",
          options: [
            "Stroma",
            "Thylakoid membrane",
            "Cell wall",
            "Mitochondria"
          ],
          correctAnswer: 1
        },
        {
          question: "What pigment gives plants their green color?",
          options: [
            "Chlorophyll",
            "Carotene",
            "Melanin",
            "Xanthophyll"
          ],
          correctAnswer: 0
        }
      ]
      
      setQuizQuestions(mockQuiz)
      setQuizAnswers(new Array(mockQuiz.length).fill(-1))
      setQuizResults([])
      setQuizScore(null)
      setIsProcessingContent(false)
    } catch (error) {
      console.error('Error generating quiz:', error)
      setProcessingError('Failed to generate quiz')
      setIsProcessingContent(false)
    }
  }

  const toggleFlashcard = (index: number) => {
    const flipped = [...flashcardsFlipped]
    flipped[index] = !flipped[index]
    setFlashcardsFlipped(flipped)
  }

  const checkQuizAnswers = () => {
    const results = quizQuestions.map((question, index) => {
      return quizAnswers[index] === question.correctAnswer
    })
    
    const score = results.filter(result => result).length / results.length * 100
    setQuizResults(results)
    setQuizScore(score)
  }

  // Generate a concept map
  const generateConceptMap = async () => {
    if (!newConceptMap.topic) return
    
    setIsGeneratingMap(true)
    
    try {
      // In a real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For demo, generate a different concept map based on topic
      if (newConceptMap.topic.toLowerCase().includes('atom')) {
        setConceptMapNodes([
          { id: '1', label: 'Atom', color: '#673AB7', x: 300, y: 200 },
          { id: '2', label: 'Proton', color: '#E53935', x: 150, y: 300 },
          { id: '3', label: 'Neutron', color: '#3949AB', x: 300, y: 300 },
          { id: '4', label: 'Electron', color: '#42A5F5', x: 450, y: 300 },
          { id: '5', label: 'Nucleus', color: '#FB8C00', x: 225, y: 400 },
          { id: '6', label: 'Element', color: '#8BC34A', x: 450, y: 100 },
          { id: '7', label: 'Atomic Number', color: '#FF9800', x: 150, y: 100 },
        ])
        
        setConceptMapLinks([
          { source: '1', target: '2', label: 'contains' },
          { source: '1', target: '3', label: 'contains' },
          { source: '1', target: '4', label: 'contains' },
          { source: '5', target: '2', label: 'contains' },
          { source: '5', target: '3', label: 'contains' },
          { source: '1', target: '5', label: 'has' },
          { source: '6', target: '1', label: 'made of' },
          { source: '7', target: '2', label: 'equals count of' },
        ])
        
        setConceptMapTopic("Atomic Structure")
      } else if (newConceptMap.topic.toLowerCase().includes('cell')) {
        setConceptMapNodes([
          { id: '1', label: 'Cell', color: '#2196F3', x: 300, y: 200 },
          { id: '2', label: 'Nucleus', color: '#F44336', x: 150, y: 300 },
          { id: '3', label: 'Mitochondria', color: '#4CAF50', x: 450, y: 300 },
          { id: '4', label: 'Cell Membrane', color: '#9C27B0', x: 300, y: 100 },
          { id: '5', label: 'DNA', color: '#FF9800', x: 150, y: 400 },
          { id: '6', label: 'ATP', color: '#CDDC39', x: 450, y: 400 },
        ])
        
        setConceptMapLinks([
          { source: '1', target: '2', label: 'contains' },
          { source: '1', target: '3', label: 'contains' },
          { source: '1', target: '4', label: 'surrounded by' },
          { source: '2', target: '5', label: 'contains' },
          { source: '3', target: '6', label: 'produces' },
        ])
        
        setConceptMapTopic("Cell Structure")
      } else {
        // Default to a simple map
        setConceptMapNodes([
          { id: '1', label: newConceptMap.topic, color: '#2196F3', x: 300, y: 200 },
          { id: '2', label: 'Concept 1', color: '#F44336', x: 150, y: 300 },
          { id: '3', label: 'Concept 2', color: '#4CAF50', x: 450, y: 300 },
          { id: '4', label: 'Concept 3', color: '#FF9800', x: 300, y: 100 },
        ])
        
        setConceptMapLinks([
          { source: '1', target: '2', label: 'related to' },
          { source: '1', target: '3', label: 'related to' },
          { source: '1', target: '4', label: 'related to' },
          { source: '2', target: '3', label: 'connects to' },
        ])
        
        setConceptMapTopic(newConceptMap.topic)
      }
      
      setShowConceptMapForm(false)
      setNewConceptMap({ topic: '', content: '' })
      setIsGeneratingMap(false)
    } catch (error) {
      console.error('Error generating concept map:', error)
      setIsGeneratingMap(false)
    }
  }

  // Filter events for selected date
  const getEventsForSelectedDate = () => {
    if (!selectedDate) return []
    
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.getDate() === selectedDate.getDate() &&
             eventDate.getMonth() === selectedDate.getMonth() &&
             eventDate.getFullYear() === selectedDate.getFullYear()
    })
  }

  const studySessions = [
    { id: 1, subject: "Mathematics", topic: "Calculus", duration: 90, date: "2024-01-15", completed: true },
    { id: 2, subject: "Physics", topic: "Quantum Mechanics", duration: 60, date: "2024-01-15", completed: false },
    { id: 3, subject: "Chemistry", topic: "Organic Compounds", duration: 45, date: "2024-01-16", completed: false },
  ]

  const weeklyProgress = [
    { subject: "Mathematics", hoursStudied: 8, targetHours: 10, progress: 80 },
    { subject: "Physics", hoursStudied: 6, targetHours: 8, progress: 75 },
    { subject: "Chemistry", hoursStudied: 4, targetHours: 6, progress: 67 },
  ]

  const recentNotes = [
    { id: 1, title: "Calculus Derivatives", content: "Key formulas and examples...", date: "2024-01-15" },
    { id: 2, title: "Physics Laws", content: "Newton's laws summary...", date: "2024-01-14" },
    { id: 3, title: "Chemistry Bonds", content: "Ionic vs covalent bonds...", date: "2024-01-13" },
  ]

  const studyGoals = [
    { id: 1, title: "Complete Math Chapter 5", progress: 75, deadline: "2024-01-20", priority: "high" },
    { id: 2, title: "Physics Lab Report", progress: 40, deadline: "2024-01-18", priority: "medium" },
    { id: 3, title: "Chemistry Quiz Prep", progress: 90, deadline: "2024-01-16", priority: "high" },
  ]

  const collaborators = [
    { id: 1, name: "Sarah Chen", subject: "Mathematics", status: "online" },
    { id: 2, name: "Mike Johnson", subject: "Physics", status: "offline" },
    { id: 3, name: "Emma Davis", subject: "Chemistry", status: "studying" },
  ]

  // Formatting helpers
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const systemPrompt = `You are an AI-Powered Study Buddy. Your role is to:
- Help users plan effective study sessions and schedules
- Explain difficult topics and concepts in multiple ways
- Create study guides, summaries, and review materials
- Track learning progress and suggest improvements
- Provide study techniques and memory strategies
- Help with homework and assignment planning
- Offer motivation and accountability for study goals
- Adapt explanations to different learning styles
- Support document analysis and summarization
- Help create concept maps and visual learning aids

Be encouraging, organized, and focus on helping users develop effective study habits and understanding. Current goal: ${currentGoal}`

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <header
        className={`shadow-sm border-b transition-colors duration-300 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
      >
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
                <BookOpen className="h-6 w-6 text-pink-600" />
                <span className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Study Buddy
                </span>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Progress Overview */}
        <Card className={`mb-6 ${darkMode ? "bg-gray-800 border-gray-700" : ""}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Today's Progress</CardTitle>
              <Badge className="bg-pink-100 text-pink-700">Goal: {currentGoal}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>4.5h</div>
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Time Studied</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>3/5</div>
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Goals Completed</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>85%</div>
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Weekly Target</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>7</div>
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Study Streak</div>
              </div>
            </div>
            <Progress value={75} className="mt-4" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[calc(100vh-16rem)]">
          {/* Left Panel - Calendar & Timer */}
          <div className="md:col-span-3 space-y-4">
            {/* Pomodoro Timer */}
            <PomodoroTimer darkMode={darkMode} defaultTime={25} />

            {/* Calendar */}
            <CalendarComponent darkMode={darkMode} />

            {/* Study Goals */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center ${darkMode ? "text-white" : ""}`}>
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Study Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {studyGoals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${darkMode ? "text-white" : ""}`}>{goal.title}</span>
                      <Badge variant={goal.priority === "high" ? "destructive" : "secondary"}>{goal.priority}</Badge>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Due: {goal.deadline}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center - Main Content */}
          <div className="md:col-span-6">
            <Tabs defaultValue="chat" className="h-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="chat">AI Chat</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="concept-map">Concept Map</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-4 h-[calc(100%-3rem)]">
                <Card className={`h-full ${darkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                  <CardHeader>
                    <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Study Assistant</CardTitle>
                  </CardHeader>
                  <div className="flex-1 px-6 pb-6">
                    <ChatInterface
                      title=""
                      description=""
                      icon={<></>}
                      systemPrompt={systemPrompt}
                      placeholderMessage="Ask me about any topic or upload a document for analysis..."
                      suggestedQuestions={[
                        "Help me create a study schedule for my exams",
                        "Explain photosynthesis in simple terms",
                        "Create flashcards for calculus derivatives",
                        "What are the best study techniques for memorization?",
                      ]}
                    />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <Card className={`h-full ${darkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                  <CardHeader>
                    <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Document Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Upload Area */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                    >
                      <Upload className={`h-12 w-12 mx-auto mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                      <p className={`text-lg font-medium mb-2 ${darkMode ? "text-white" : ""}`}>Upload Documents</p>
                      <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        PDF, Word, or text files for AI analysis
                      </p>
                      <input
                        type="file"
                        id="document-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => handleFileUpload(e)}
                      />
                      <label htmlFor="document-upload">
                        <div className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                        </div>
                      </label>
                    </div>

                    {/* Text Input */}
                    <div>
                      <label className={`text-sm font-medium mb-2 block ${darkMode ? "text-white" : ""}`}>
                        Or paste text directly:
                      </label>
                      <Textarea
                        placeholder="Paste your text here for summarization and analysis..."
                        className="min-h-[120px]"
                        value={uploadedText}
                        onChange={(e) => setUploadedText(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button size="sm" onClick={generateSummary} disabled={!uploadedText && !uploadedFile}>
                          <Brain className="h-4 w-4 mr-2" />
                          Summarize
                        </Button>
                        <Button size="sm" variant="outline" onClick={generateFlashcards} disabled={!uploadedText && !uploadedFile}>
                          <FileText className="h-4 w-4 mr-2" />
                          Create Flashcards
                        </Button>
                        <Button size="sm" variant="outline" onClick={generateQuiz} disabled={!uploadedText && !uploadedFile}>
                          <Target className="h-4 w-4 mr-2" />
                          Generate Quiz
                        </Button>
                      </div>
                    </div>

                    {/* Uploaded Document */}
                    {uploadedFile && (
                      <div className={`p-4 rounded border ${darkMode ? "border-gray-600 bg-gray-700" : "bg-gray-50"}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className={`h-6 w-6 mr-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`} />
                            <div>
                              <p className={`font-medium ${darkMode ? "text-white" : ""}`}>{uploadedFile.name}</p>
                              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {(uploadedFile.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => setUploadedFile(null)}>
                            <Circle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Generated Content */}
                    {generatedContent && (
                      <div className={`p-4 rounded border ${darkMode ? "border-gray-600 bg-gray-700" : "bg-gray-50"}`}>
                        <h4 className={`font-medium mb-2 ${darkMode ? "text-white" : ""}`}>
                          {generatedContentType === 'summary' ? 'Summary' : 
                           generatedContentType === 'flashcards' ? 'Flashcards' : 'Quiz'}
                        </h4>
                        {generatedContentType === 'flashcards' ? (
                          <div className="space-y-3">
                            {flashcards.map((flashcard, index) => (
                              <div 
                                key={index} 
                                className={`p-3 rounded border ${darkMode ? "border-gray-500 bg-gray-600" : "border-gray-300 bg-white"}`}
                                onClick={() => toggleFlashcard(index)}
                              >
                                <p className={`font-medium ${darkMode ? "text-white" : ""}`}>
                                  {flashcardsFlipped[index] ? flashcard.answer : flashcard.question}
                                </p>
                                <p className={`text-xs mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                  Click to flip
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : generatedContentType === 'quiz' ? (
                          <div className="space-y-4">
                            {quizQuestions.map((question, qIndex) => (
                              <div key={qIndex} className="space-y-2">
                                <p className={`font-medium ${darkMode ? "text-white" : ""}`}>
                                  {qIndex + 1}. {question.question}
                                </p>
                                <div className="space-y-1 ml-4">
                                  {question.options.map((option, oIndex) => (
                                    <div 
                                      key={oIndex} 
                                      className={`flex items-center space-x-2 p-2 rounded ${
                                        quizAnswers[qIndex] === oIndex
                                          ? (darkMode ? "bg-blue-900" : "bg-blue-50")
                                          : ""
                                      }`}
                                      onClick={() => {
                                        const newAnswers = [...quizAnswers];
                                        newAnswers[qIndex] = oIndex;
                                        setQuizAnswers(newAnswers);
                                      }}
                                    >
                                      <div 
                                        className={`w-4 h-4 rounded-full border ${
                                          quizAnswers[qIndex] === oIndex
                                            ? (darkMode ? "bg-blue-500 border-blue-400" : "bg-blue-500 border-blue-500")
                                            : (darkMode ? "border-gray-500" : "border-gray-300")
                                        }`}
                                      />
                                      <span className={darkMode ? "text-white" : ""}>
                                        {option}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                            {quizQuestions.length > 0 && (
                              <Button onClick={checkQuizAnswers}>
                                Check Answers
                              </Button>
                            )}
                          </div>
                        ) : (
                          <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-800"}`}>
                            {generatedContent}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Recent Summaries */}
                    <div>
                      <h4 className={`font-medium mb-3 ${darkMode ? "text-white" : ""}`}>Recent Summaries</h4>
                      <div className="space-y-2">
                        <div
                          className={`p-3 rounded border ${darkMode ? "border-gray-600 bg-gray-700" : "bg-gray-50"}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-medium ${darkMode ? "text-white" : ""}`}>
                              Chapter 5: Calculus
                            </span>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Key concepts: derivatives, limits, continuity...
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="concept-map" className="mt-4">
                <Card className={`h-full ${darkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>
                      Concept Mapping: {conceptMapTopic}
                    </CardTitle>
                    <Dialog open={showConceptMapForm} onOpenChange={setShowConceptMapForm}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Create New Map
                        </Button>
                      </DialogTrigger>
                      <DialogContent className={darkMode ? "bg-gray-800 text-white" : ""}>
                        <DialogHeader>
                          <DialogTitle>Create Concept Map</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="topic">Topic</Label>
                            <Input 
                              id="topic" 
                              placeholder="e.g., Photosynthesis, Atoms, Cell Structure" 
                              value={newConceptMap.topic} 
                              onChange={(e) => setNewConceptMap({...newConceptMap, topic: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="content">Content (Optional)</Label>
                            <Textarea 
                              id="content"
                              placeholder="Add any text or notes about this topic to help generate a better concept map"
                              value={newConceptMap.content}
                              onChange={(e) => setNewConceptMap({...newConceptMap, content: e.target.value})}
                            />
                          </div>
                          <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setShowConceptMapForm(false)}>Cancel</Button>
                            <Button 
                              onClick={generateConceptMap} 
                              disabled={!newConceptMap.topic || isGeneratingMap}
                            >
                              {isGeneratingMap ? 'Generating...' : 'Generate Map'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {processingError && (
                      <Alert className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{processingError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Concept Map Visualization */}
                    <div 
                      ref={conceptMapRef}
                      className={`border rounded-lg p-2 h-[calc(100vh-26rem)] relative ${
                        darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300"
                      }`}
                    >
                      {/* Simple SVG-based concept map visualization */}
                      <svg width="100%" height="100%" viewBox="0 0 800 600" className="concept-map">
                        {/* Draw links first so they appear behind nodes */}
                        {conceptMapLinks.map((link, index) => {
                          const sourceNode = conceptMapNodes.find(node => node.id === link.source)
                          const targetNode = conceptMapNodes.find(node => node.id === link.target)
                          
                          if (!sourceNode || !targetNode) return null
                          
                          const x1 = sourceNode.x || 0
                          const y1 = sourceNode.y || 0
                          const x2 = targetNode.x || 0
                          const y2 = targetNode.y || 0
                          
                          // Calculate midpoint for label
                          const midX = (x1 + x2) / 2
                          const midY = (y1 + y2) / 2
                          
                          return (
                            <g key={`link-${index}`}>
                              <line 
                                x1={x1} y1={y1} 
                                x2={x2} y2={y2}
                                stroke={darkMode ? "#4a5568" : "#cbd5e0"}
                                strokeWidth="2"
                              />
                              {link.label && (
                                <text 
                                  x={midX} 
                                  y={midY} 
                                  textAnchor="middle" 
                                  dominantBaseline="middle"
                                  fill={darkMode ? "#e2e8f0" : "#4a5568"}
                                  fontSize="12"
                                  className={`bg-${darkMode ? "gray-800" : "white"} px-1`}
                                >
                                  {link.label}
                                </text>
                              )}
                            </g>
                          )
                        })}
                        
                        {/* Draw nodes on top of links */}
                        {conceptMapNodes.map((node) => (
                          <g key={node.id}>
                            <circle 
                              cx={node.x} 
                              cy={node.y} 
                              r={node.id === '1' ? 40 : 30}
                              fill={node.color || (darkMode ? "#4a5568" : "#e2e8f0")}
                              stroke={darkMode ? "#e2e8f0" : "#2d3748"}
                              strokeWidth="1"
                            />
                            <text 
                              x={node.x} 
                              y={node.y} 
                              textAnchor="middle" 
                              dominantBaseline="middle"
                              fill={darkMode ? "#1a202c" : "#fff"}
                              fontSize={node.id === '1' ? "14" : "12"}
                              fontWeight={node.id === '1' ? "bold" : "normal"}
                            >
                              {node.label}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className={`font-medium mb-2 ${darkMode ? "text-white" : ""}`}>About This Concept Map</h4>
                      <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        This concept map visualizes key relationships between concepts in {conceptMapTopic}. 
                        The central node represents the main topic, with related concepts branching outward. 
                        Lines between nodes show relationships.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="mt-4">
                <Card className={`h-full ${darkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                  <CardHeader>
                    <CardTitle className={`text-lg flex items-center ${darkMode ? "text-white" : ""}`}>
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Study Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Weekly Progress */}
                    <div>
                      <h4 className={`font-medium mb-3 ${darkMode ? "text-white" : ""}`}>Weekly Progress</h4>
                      <div className="space-y-3">
                        {weeklyProgress.map((subject, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className={darkMode ? "text-white" : ""}>{subject.subject}</span>
                              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                                {subject.hoursStudied}h / {subject.targetHours}h
                              </span>
                            </div>
                            <Progress value={subject.progress} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Study Patterns */}
                    <div>
                      <h4 className={`font-medium mb-3 ${darkMode ? "text-white" : ""}`}>Study Patterns</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                          <div className={`text-lg font-bold ${darkMode ? "text-white" : "text-blue-600"}`}>
                            9:00 AM
                          </div>
                          <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Peak Focus Time
                          </div>
                        </div>
                        <div className={`p-3 rounded ${darkMode ? "bg-gray-700" : "bg-green-50"}`}>
                          <div className={`text-lg font-bold ${darkMode ? "text-white" : "text-green-600"}`}>
                            45 min
                          </div>
                          <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Avg Session</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Notes & Collaboration */}
          <div className="col-span-3 space-y-4">
            {/* Quick Notes */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Quick Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea placeholder="Jot down quick notes..." className="min-h-[80px]" />
                <Button size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Save Note
                </Button>

                {/* Recent Notes */}
                <div className="space-y-2">
                  {recentNotes.slice(0, 3).map((note) => (
                    <div
                      key={note.id}
                      className={`p-2 rounded border ${darkMode ? "border-gray-600 bg-gray-700" : "bg-gray-50"}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${darkMode ? "text-white" : ""}`}>{note.title}</span>
                        <Button size="sm" variant="ghost">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {note.content.substring(0, 50)}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Study Group */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center ${darkMode ? "text-white" : ""}`}>
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Study Group
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          collaborator.status === "online"
                            ? "bg-green-500"
                            : collaborator.status === "studying"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                        }`}
                      />
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? "text-white" : ""}`}>{collaborator.name}</p>
                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {collaborator.subject}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Friends
                </Button>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {studySessions.map((session) => (
                  <div key={session.id} className="flex items-center space-x-3">
                    {session.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${darkMode ? "text-white" : ""}`}>{session.topic}</p>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {session.subject} • {session.duration}min
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
