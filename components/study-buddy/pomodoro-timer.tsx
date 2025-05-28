"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Play, Pause, RotateCcw } from "lucide-react"

interface PomodoroTimerProps {
  darkMode?: boolean
}

export default function PomodoroTimer({ darkMode = false }: PomodoroTimerProps) {
  const [duration, setDuration] = useState(25) // Duration in minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60) // Time left in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [timerType, setTimerType] = useState<"focus" | "short" | "long">("focus")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/sounds/timer-complete.mp3")
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  // Handle timer countdown
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            // Timer complete
            handleTimerComplete()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  // Update timeLeft when duration changes
  useEffect(() => {
    setTimeLeft(duration * 60)
  }, [duration])

  const handleTimerComplete = () => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    // Play sound notification
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.error("Error playing sound:", err))
    }
  }

  const toggleTimer = () => {
    setIsRunning(prev => !prev)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(duration * 60)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const changeTimerType = (type: string) => {
    const newType = type as "focus" | "short" | "long"
    setTimerType(newType)
    
    let newDuration = 25 // default focus duration
    if (newType === "short") newDuration = 5
    if (newType === "long") newDuration = 15
    
    setDuration(newDuration)
    setTimeLeft(newDuration * 60)
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const progressPercentage = (1 - timeLeft / (duration * 60)) * 100

  return (
    <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
      <CardHeader>
        <CardTitle className={`text-lg flex items-center ${darkMode ? "text-white" : ""}`}>
          <Clock className="h-5 w-5 mr-2 text-pink-600" />
          Pomodoro Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {/* Progress Ring */}
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-32 h-32">
            <circle 
              cx="64" 
              cy="64" 
              r="58"
              fill="none" 
              stroke={darkMode ? "#374151" : "#f3f4f6"} 
              strokeWidth="8"
            />
            <circle 
              cx="64" 
              cy="64" 
              r="58"
              fill="none" 
              stroke={isRunning ? "#ec4899" : "#d1d5db"}
              strokeWidth="8"
              strokeDasharray="364.4"
              strokeDashoffset={364.4 - (364.4 * progressPercentage) / 100}
              strokeLinecap="round"
              transform="rotate(-90 64 64)"
              style={{ transition: "stroke-dashoffset 0.5s" }}
            />
          </svg>
          <div className={`absolute text-4xl font-bold ${darkMode ? "text-white" : "text-pink-600"}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center space-x-2">
          <Button
            size="sm"
            onClick={toggleTimer}
            variant={isRunning ? "destructive" : "default"}
            className="w-20"
          >
            {isRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button size="sm" variant="outline" onClick={resetTimer}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        {/* Timer Types */}
        <div className="grid grid-cols-3 gap-2">
          <Button 
            size="sm" 
            variant={timerType === "focus" ? "default" : "outline"} 
            onClick={() => changeTimerType("focus")}
          >
            Focus
          </Button>
          <Button 
            size="sm" 
            variant={timerType === "short" ? "default" : "outline"} 
            onClick={() => changeTimerType("short")}
          >
            Short Break
          </Button>
          <Button 
            size="sm" 
            variant={timerType === "long" ? "default" : "outline"} 
            onClick={() => changeTimerType("long")}
          >
            Long Break
          </Button>
        </div>

        {/* Custom Duration */}
        <Select value={duration.toString()} onValueChange={val => setDuration(parseInt(val))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Set duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="25">25 minutes</SelectItem>
            <SelectItem value="45">45 minutes</SelectItem>
            <SelectItem value="60">60 minutes</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
} 