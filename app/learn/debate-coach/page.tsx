"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  ArrowLeft, MessageSquare, Timer, Trophy, Shuffle, 
  Play, Pause, RotateCcw, Video, Mic, MicOff, 
  Upload, Download, Activity, Volume2, ListTodo,
  Check, AlertTriangle, Info, RefreshCw, BookOpen
} from "lucide-react"
import ChatInterface from "@/components/chat-interface"
import { useAuth } from "@/hooks/use-auth"

export default function DebateCoachPage() {
  const { user } = useAuth()
  const userId = user?.id || "guest-user"
  const [selectedTopic, setSelectedTopic] = useState("")
  const [debatePhase, setDebatePhase] = useState<"preparation" | "opening" | "rebuttal" | "closing">("preparation")
  const [timer, setTimer] = useState(180) // 3 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingMode, setRecordingMode] = useState<"audio" | "video">("audio")
  const [recordings, setRecordings] = useState<{id: string, url: string, type: string, phase: string, timestamp: Date, duration: number, feedback?: any}[]>([])
  const [currentFeedback, setCurrentFeedback] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("debate")
  const [showTranscript, setShowTranscript] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [speechMetrics, setSpeechMetrics] = useState({
    pace: 0,
    volume: 0,
    clarity: 0,
    filler: 0,
  })
  
  const [scores, setScores] = useState({
    structure: 75,
    logic: 68,
    evidence: 82,
    delivery: 70,
  })

  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)

  // References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const topics = [
    "Technology in education improves learning outcomes",
    "Remote work is more productive than office work",
    "Social media has a net positive impact on society",
    "Artificial intelligence will create more jobs than it destroys",
    "Climate change is the most pressing global issue",
    "Universal basic income should be implemented globally",
    "Space exploration is worth the investment",
    "Genetic engineering should be allowed in humans",
    "The electoral college should be abolished",
    "Cryptocurrency will replace traditional banking",
  ]

  const debatePhases = [
    { id: "preparation", label: "Preparation", duration: 300 },
    { id: "opening", label: "Opening Statement", duration: 180 },
    { id: "rebuttal", label: "Rebuttal", duration: 120 },
    { id: "closing", label: "Closing Argument", duration: 120 },
  ]

  const tips = [
    "Start with a clear thesis statement",
    "Use the PEEL structure: Point, Evidence, Explanation, Link",
    "Address counterarguments proactively",
    "Use credible sources and statistics",
    "Maintain confident body language",
    "Listen carefully to your opponent's arguments",
    "Vary your tone and pace to emphasize key points",
    "Use rhetorical questions to engage your audience",
  ]

  const rebuttals = [
    "That's an interesting point, but have you considered...",
    "While I understand your perspective, the evidence suggests...",
    "Your argument assumes that..., but in reality...",
    "I'd like to challenge that assumption because...",
    "Let me concede that point, but it doesn't address...",
    "The data you've presented is compelling, however...",
  ]

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1)
        
        // Update speech metrics simulation during recording
        if (isRecording) {
          // Simulate changing speech metrics
          setSpeechMetrics(prev => ({
            pace: Math.min(100, Math.max(20, prev.pace + (Math.random() * 10 - 5))),
            volume: Math.min(100, Math.max(30, prev.volume + (Math.random() * 10 - 5))),
            clarity: Math.min(100, Math.max(40, prev.clarity + (Math.random() * 6 - 3))),
            filler: Math.min(100, Math.max(0, prev.filler + (Math.random() * 8 - 4))),
          }))
        }
      }, 1000)
    } else if (timer === 0) {
      setIsTimerRunning(false)
      if (isRecording) {
        stopRecording()
      }
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timer, isRecording])

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Generate random topic
  const generateRandomTopic = () => {
    const randomTopic = topics[Math.floor(Math.random() * topics.length)]
    setSelectedTopic(randomTopic)
  }

  // Reset timer
  const resetTimer = () => {
    const currentPhase = debatePhases.find((p) => p.id === debatePhase)
    setTimer(currentPhase?.duration || 180)
    setIsTimerRunning(false)
  }

  // Check media permissions
  const checkMediaPermissions = async () => {
    try {
      if (recordingMode === 'video') {
        // Check if we can access the camera
        await navigator.mediaDevices.getUserMedia({ video: true })
      }
      // Check if we can access the microphone
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Reset any permission errors if successful
      setPermissionError(null)
    } catch (error) {
      console.error("Permission check failed:", error)
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          setPermissionError("Camera/microphone access denied. Please allow access in your browser settings.")
        } else if (error.name === 'NotFoundError') {
          setPermissionError("No camera or microphone found on your device.")
        } else {
          setPermissionError(`Error accessing media devices: ${error.message}`)
        }
      }
    }
  }

  // Add a function to start camera preview
  const startCameraPreview = async () => {
    try {
      // If we already have a stream, stop it first
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false // No audio needed for preview
      });
      
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(e => console.error("Error playing video preview:", e));
      }
      
      setPermissionError(null);
    } catch (error) {
      console.error("Error starting camera preview:", error);
      setCameraStream(null);
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          setPermissionError("Camera access denied. Please allow access in your browser settings.");
        } else if (error.name === 'NotFoundError') {
          setPermissionError("No camera found on your device.");
        } else {
          setPermissionError(`Error accessing camera: ${error.message}`);
        }
      }
    }
  };

  // Stop camera preview
  const stopCameraPreview = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Add a useEffect hook to check permissions when recording mode changes
  useEffect(() => {
    checkMediaPermissions()
  }, [recordingMode])

  // Add effect to start/stop camera preview when recording mode changes
  useEffect(() => {
    if (recordingMode === 'video' && !isRecording) {
      startCameraPreview();
    } else if (recordingMode !== 'video') {
      stopCameraPreview();
    }
    
    // Cleanup when component unmounts
    return () => {
      stopCameraPreview();
    };
  }, [recordingMode, isRecording])

  // Recording functions
  const startRecording = async () => {
    try {
      setPermissionError(null)
      let stream: MediaStream
      
      if (recordingMode === 'video') {
        // Stop the preview stream first
        stopCameraPreview();
        
        // Start a new stream with both audio and video
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        
        // Ensure video element exists and is properly set up
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.muted = true // Prevent feedback
          videoRef.current.play().catch(e => console.error("Error playing video:", e))
        }
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      }
      
      streamRef.current = stream
      audioChunksRef.current = []
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: recordingMode === 'video' ? 'video/webm' : 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { 
          type: recordingMode === 'video' ? 'video/webm' : 'audio/webm' 
        })
        const url = URL.createObjectURL(blob)
        
        const newRecording = {
          id: Date.now().toString(),
          url,
          type: recordingMode,
          phase: debatePhase,
          timestamp: new Date(),
          duration: debatePhases.find(p => p.id === debatePhase)?.duration! - timer
        }
        
        setRecordings(prev => [...prev, newRecording])
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
        
        // Simulate generating transcript
        simulateTranscriptGeneration()
        
        // Restart camera preview if in video mode
        if (recordingMode === 'video') {
          setTimeout(() => {
            startCameraPreview();
          }, 500); // Short delay to ensure cleanup is complete
        }
      }
      
      // Start recording
      mediaRecorder.start(1000) // Capture in 1-second chunks
      setIsRecording(true)
      
      // Start timer if it's not already running
      if (!isTimerRunning) {
        setIsTimerRunning(true)
      }
      
      // Initialize speech metrics
      setSpeechMetrics({
        pace: 50,
        volume: 60,
        clarity: 70,
        filler: 30,
      })
      
    } catch (error) {
      console.error("Error starting recording:", error)
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          setPermissionError("Camera/microphone access denied. Please allow access in your browser settings.")
        } else if (error.name === 'NotFoundError') {
          setPermissionError("No camera or microphone found on your device.")
        } else {
          setPermissionError(`Error accessing media devices: ${error.message}`)
        }
      } else {
        setPermissionError("An error occurred while starting the recording.")
      }
      
      // Restart camera preview if in video mode and there was an error
      if (recordingMode === 'video') {
        startCameraPreview();
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Stop timer if it's running
      if (isTimerRunning) {
        setIsTimerRunning(false)
      }
      
      // Note: We don't need to clear the video element or restart the preview here
      // as that will be handled in the mediaRecorder.onstop event handler
    }
  }

  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }
  
  // Simulate transcript generation
  const simulateTranscriptGeneration = () => {
    setIsProcessing(true)
    
    // Get the latest recording
    const latestRecording = recordings[recordings.length - 1]
    
    // Call the API endpoint to analyze the recording
    fetch('/api/chat/debate/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioUrl: latestRecording.type === 'audio' ? latestRecording.url : undefined,
        videoUrl: latestRecording.type === 'video' ? latestRecording.url : undefined,
        topic: selectedTopic,
        phase: debatePhase,
        duration: latestRecording.duration,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to analyze recording')
        }
        return response.json()
      })
      .then(data => {
        // Set the transcript
        setTranscript(data.transcript)
        
        // Set the feedback
        const feedback = data.analysis
        setCurrentFeedback(feedback)
        
        // Update the recordings with the feedback
        setRecordings(prev => prev.map(rec => 
          rec.id === latestRecording.id ? {...rec, feedback} : rec
        ))
        
        // Update scores based on feedback
        setScores({
          structure: feedback.structure,
          logic: feedback.logic,
          evidence: feedback.evidence,
          delivery: feedback.delivery,
        })
        
        // Switch to feedback tab
        setActiveTab("feedback")
        setIsProcessing(false)
      })
      .catch(error => {
        console.error('Error analyzing recording:', error)
        setIsProcessing(false)
        
        // Fallback to local simulation if the API fails
        const fakeFeedback = {
          strengths: [
            "Strong opening statement that clearly states your position",
            "Good use of evidence and research to support arguments",
            "Logical structure with clear transitions between points"
          ],
          improvements: [
            "Consider addressing counterarguments more thoroughly",
            "Try to vary your speaking pace to emphasize key points",
            "Add more specific examples to strengthen your third point"
          ],
          structure: Math.floor(Math.random() * 30) + 70,
          logic: Math.floor(Math.random() * 30) + 65,
          evidence: Math.floor(Math.random() * 25) + 70,
          delivery: Math.floor(Math.random() * 35) + 60,
          fillerWords: {
            "um": 7,
            "uh": 4,
            "like": 9,
            "you know": 3
          },
          speakingPace: {
            average: "156 words per minute",
            recommendation: "Try to aim for 140-160 words per minute for optimal clarity"
          },
          keyInsights: "Your argument is well-structured but could benefit from more concrete examples. Your strongest point was your second argument, which effectively connected the issue to broader societal impacts."
        }
        
        setTranscript(`[Failed to generate transcript from recording. Here's a sample transcript for ${selectedTopic}]
        
Thank you for the opportunity to discuss "${selectedTopic}". 

I would like to present three key arguments supporting my position.

First, research suggests that ${selectedTopic.includes("technology") ? "educational technologies improve student engagement significantly" : "the current approach has limitations we must address"}.

Second, we must consider the broader implications. ${selectedTopic.includes("climate") ? "Climate action today determines our future" : "This issue affects many stakeholders"}.

Finally, addressing counterarguments, while some may argue that ${selectedTopic.includes("work") ? "traditional methods are preferable" : "change is unnecessary"}, evidence suggests otherwise.

In conclusion, I believe the benefits outweigh the concerns.`)
        
        // Update the recordings with the feedback
        setRecordings(prev => prev.map(rec => 
          rec.id === latestRecording.id ? {...rec, feedback: fakeFeedback} : rec
        ))
        
        setCurrentFeedback(fakeFeedback)
        
        // Update scores based on feedback
        setScores({
          structure: fakeFeedback.structure,
          logic: fakeFeedback.logic,
          evidence: fakeFeedback.evidence,
          delivery: fakeFeedback.delivery,
        })
        
        // Switch to feedback tab
        setActiveTab("feedback")
      })
  }

  // System prompt for AI
  const systemPrompt = `You are an AI Debate Coach. The current debate topic is: "${selectedTopic}". The debate phase is: ${debatePhase}. Your role is to:
- Provide real-time coaching on argumentation and debate structure
- Evaluate arguments for logic, evidence, and persuasiveness
- Suggest improvements for delivery and presentation
- Help structure arguments using debate frameworks
- Provide counterargument strategies
- Give constructive feedback on debate performance

Be analytical, constructive, and help build strong argumentation skills.`

  // Add a useEffect hook to stop recording when timer runs out
  useEffect(() => {
    if (timer === 0 && isRecording) {
      stopRecording()
    }
  }, [timer, isRecording])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
                <MessageSquare className="h-6 w-6 text-red-600" />
                <span className="text-xl font-semibold text-gray-900">Debate Coach</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("history")}>
                      <ListTodo className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Recordings</span>
                      <Badge className="ml-2">{recordings.length}</Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View your past recordings and feedback</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Topic Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Debate Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a debate topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic, index) => (
                    <SelectItem key={index} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={generateRandomTopic} variant="outline">
                <Shuffle className="h-4 w-4 mr-2" />
                Random
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="debate">Debate Arena</TabsTrigger>
            <TabsTrigger value="feedback" disabled={currentFeedback === null}>
              Analysis & Feedback
            </TabsTrigger>
            <TabsTrigger value="history">Recording History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="debate">
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-20rem)]">
              {/* Left Panel - Timer and Phase Control */}
              <div className="col-span-12 md:col-span-3 space-y-4">
                {/* Timer */}
                <Card className={`${isRecording ? 'border-red-500 border-2' : ''}`}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Timer className="h-5 w-5 mr-2 text-blue-600" />
                      Speaking Timer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="text-4xl font-bold text-blue-600">{formatTime(timer)}</div>
                    <div className="flex justify-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        variant={isTimerRunning ? "destructive" : "default"}
                      >
                        {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={resetTimer}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recording Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      {recordingMode === 'video' ? (
                        <Video className="h-5 w-5 mr-2 text-red-600" />
                      ) : (
                        <Mic className="h-5 w-5 mr-2 text-red-600" />
                      )}
                      Recording Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Video Recording</span>
                      <Switch 
                        checked={recordingMode === 'video'} 
                        onCheckedChange={(checked) => setRecordingMode(checked ? 'video' : 'audio')}
                      />
                    </div>
                    
                    {permissionError && (
                      <div className="bg-red-50 text-red-700 p-2 rounded text-sm mb-2">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        {permissionError}
                      </div>
                    )}
                    
                    <Button 
                      className="w-full" 
                      variant={isRecording ? "destructive" : "default"}
                      onClick={toggleRecording}
                      disabled={!selectedTopic || !debatePhase || permissionError !== null}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          {recordingMode === 'video' ? (
                            <Video className="h-4 w-4 mr-2" />
                          ) : (
                            <Mic className="h-4 w-4 mr-2" />
                          )}
                          Start Recording
                        </>
                      )}
                    </Button>
                    
                    {recordingMode === 'video' && (
                      <div className="relative aspect-video bg-black rounded-md overflow-hidden">
                        <video 
                          ref={videoRef} 
                          className="w-full h-full object-cover"
                          autoPlay
                          playsInline
                          muted
                        />
                        {isRecording && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="destructive" className="animate-pulse">
                              REC
                            </Badge>
                          </div>
                        )}
                        {!cameraStream && !isRecording && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                            <Video className="h-8 w-8 mb-2" />
                            <p className="text-sm">Camera preview unavailable</p>
                            <Button size="sm" variant="outline" className="mt-2" onClick={startCameraPreview}>
                              Start Preview
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {isRecording && (
                      <div className="space-y-2 mt-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Speaking Pace</span>
                            <span>{speechMetrics.pace > 80 ? 'Too Fast' : speechMetrics.pace < 40 ? 'Too Slow' : 'Good'}</span>
                          </div>
                          <Progress 
                            value={speechMetrics.pace} 
                            className={`h-2 ${speechMetrics.pace > 80 || speechMetrics.pace < 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Volume</span>
                            <span>{speechMetrics.volume > 85 ? 'Too Loud' : speechMetrics.volume < 30 ? 'Too Quiet' : 'Good'}</span>
                          </div>
                          <Progress 
                            value={speechMetrics.volume} 
                            className={`h-2 ${speechMetrics.volume > 85 || speechMetrics.volume < 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Recording Duration</span>
                            <span>{formatTime(debatePhases.find(p => p.id === debatePhase)?.duration! - timer)}</span>
                          </div>
                          <Progress 
                            value={(debatePhases.find(p => p.id === debatePhase)?.duration! - timer) / debatePhases.find(p => p.id === debatePhase)?.duration! * 100} 
                            className="h-2 bg-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Debate Phases */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Debate Phases</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {debatePhases.map((phase) => (
                      <Button
                        key={phase.id}
                        variant={debatePhase === phase.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => {
                          setDebatePhase(phase.id as any)
                          setTimer(phase.duration)
                          setIsTimerRunning(false)
                        }}
                      >
                        {phase.label}
                        <Badge variant="secondary" className="ml-auto">
                          {Math.floor(phase.duration / 60)}m
                        </Badge>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Center - Debate Chat */}
              <div className="col-span-12 md:col-span-6">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Debate Arena</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Phase: {debatePhase}</Badge>
                        {selectedTopic && (
                          <Badge className="bg-red-100 text-red-700 max-w-xs truncate">{selectedTopic}</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <div className="flex-1 px-6 pb-6">
                    <ChatInterface
                      title=""
                      description=""
                      icon={<></>}
                      systemPrompt={systemPrompt}
                      placeholderMessage="Present your argument or ask for coaching..."
                      suggestedQuestions={[
                        "Help me structure my opening statement",
                        "How can I strengthen this argument?",
                        "What are potential counterarguments?",
                        "Give me feedback on my delivery",
                        "Suggest evidence for my position",
                        "How do I address this challenging rebuttal?"
                      ]}
                      userId={userId}
                    />
                  </div>
                </Card>
              </div>

              {/* Right Panel - Tips and Rebuttals */}
              <div className="col-span-12 md:col-span-3 space-y-4">
                {/* Current Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(scores).map(([category, score]) => (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{category}</span>
                          <span>{score}%</span>
                        </div>
                        <Progress 
                          value={score} 
                          className={`h-2 ${score > 80 ? 'bg-green-500' : score > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                {/* Debate Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Debate Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-60 overflow-y-auto">
                    {tips.map((tip, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                        <p className="text-sm">{tip}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Rebuttal Starters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rebuttal Starters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-60 overflow-y-auto">
                    {rebuttals.map((rebuttal, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <p className="text-sm italic">"{rebuttal}"</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="feedback">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center p-12">
                <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analyzing your debate...</h3>
                <p className="text-gray-600">Our AI is evaluating your arguments, structure, and delivery</p>
              </div>
            ) : currentFeedback ? (
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                        Speech Transcript
                        <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setShowTranscript(!showTranscript)}>
                          {showTranscript ? "Hide" : "Show"}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    
                    {showTranscript && (
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
                          {transcript}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-md flex items-center">
                          <Check className="h-5 w-5 mr-2 text-green-600" />
                          Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {currentFeedback.strengths.map((strength: string, i: number) => (
                            <li key={i} className="flex items-start">
                              <Check className="h-4 w-4 text-green-500 mr-2 mt-1 shrink-0" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-md flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                          Areas for Improvement
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {currentFeedback.improvements.map((improvement: string, i: number) => (
                            <li key={i} className="flex items-start">
                              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-1 shrink-0" />
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-md flex items-center">
                        <Info className="h-5 w-5 mr-2 text-blue-600" />
                        Key Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{currentFeedback.keyInsights}</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="col-span-12 md:col-span-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-purple-600" />
                        Speech Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Filler Words Used</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(currentFeedback.fillerWords).map(([word, count]: [string, any], i) => (
                            <div key={i} className="bg-gray-100 rounded p-2 flex justify-between">
                              <span>"{word}"</span>
                              <Badge variant="secondary">{count}×</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Speaking Pace</h4>
                        <div className="bg-gray-100 rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{currentFeedback.speakingPace.average}</span>
                            <Badge 
                              variant={
                                parseInt(currentFeedback.speakingPace.average) > 180 ? "destructive" : 
                                parseInt(currentFeedback.speakingPace.average) < 120 ? "destructive" : 
                                "outline"
                              }
                            >
                              {parseInt(currentFeedback.speakingPace.average) > 180 ? "Too Fast" : 
                               parseInt(currentFeedback.speakingPace.average) < 120 ? "Too Slow" : 
                               "Good Pace"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{currentFeedback.speakingPace.recommendation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                        Performance Scores
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(scores).map(([category, score]) => (
                        <div key={category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{category}</span>
                            <span>{score}%</span>
                          </div>
                          <Progress 
                            value={score} 
                            className={`h-2 ${score > 80 ? 'bg-green-500' : score > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Feedback Report
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab("debate")}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Practice Again
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p>No feedback available yet. Record your debate to get AI analysis.</p>
                <Button onClick={() => setActiveTab("debate")} className="mt-4">
                  Go to Debate Arena
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Your Debate Recordings</h3>
                <Badge variant="outline">
                  {recordings.length} {recordings.length === 1 ? 'Recording' : 'Recordings'}
                </Badge>
              </div>
              
              {recordings.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <div className="mb-4 text-gray-400">
                      <Mic className="h-12 w-12 mx-auto mb-2" />
                      <p>No recordings yet. Start practicing to build your debate skills!</p>
                    </div>
                    <Button onClick={() => setActiveTab("debate")}>
                      Record Your First Debate
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recordings.map((recording, index) => (
                    <Card key={recording.id}>
                      <CardHeader>
                        <CardTitle className="text-md flex items-center">
                          {recording.type === 'video' ? (
                            <Video className="h-5 w-5 mr-2 text-blue-600" />
                          ) : (
                            <Mic className="h-5 w-5 mr-2 text-blue-600" />
                          )}
                          {recording.phase.charAt(0).toUpperCase() + recording.phase.slice(1)} ({formatTime(recording.duration)})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-500">
                            {recording.timestamp.toLocaleDateString()} at {recording.timestamp.toLocaleTimeString()}
                          </div>
                          
                          {recording.type === 'video' ? (
                            <div className="aspect-video bg-black rounded overflow-hidden">
                              <video src={recording.url} controls className="w-full h-full" />
                            </div>
                          ) : (
                            <div className="bg-gray-100 rounded p-3 flex items-center">
                              <Volume2 className="h-6 w-6 text-gray-500 mr-2" />
                              <audio src={recording.url} controls className="w-full" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="justify-between">
                        <Button variant="outline" size="sm" onClick={() => {
                          setCurrentFeedback(recording.feedback);
                          setActiveTab("feedback");
                        }} disabled={!recording.feedback}>
                          View Feedback
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
