"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw, Clock } from "lucide-react"

interface PomodoroTimerProps {
  defaultTime?: number // in minutes
  darkMode?: boolean
}

export default function PomodoroTimer({ defaultTime = 25, darkMode = false }: PomodoroTimerProps) {
  const [time, setTime] = useState(defaultTime * 60) // Convert minutes to seconds
  const [isRunning, setIsRunning] = useState(false)
  const [timerDuration, setTimerDuration] = useState(defaultTime.toString())
  
  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime - 1)
      }, 1000)
    } else if (time === 0) {
      setIsRunning(false)
      // Play sound when timer finishes
      const audio = new Audio('/sounds/timer-end.mp3')
      audio.play().catch(e => console.error("Error playing sound:", e))
    }
    
    // Cleanup interval on component unmount or when timer stops
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, time])
  
  // Format time to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }
  
  // Handle start/pause
  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }
  
  // Handle reset
  const resetTimer = () => {
    setIsRunning(false)
    setTime(parseInt(timerDuration) * 60)
  }
  
  // Handle duration change
  const handleDurationChange = (value: string) => {
    setTimerDuration(value)
    setTime(parseInt(value) * 60)
    setIsRunning(false)
  }
  
  return (
    <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
      <CardHeader>
        <CardTitle className={`text-lg flex items-center ${darkMode ? "text-white" : ""}`}>
          <Clock className="h-5 w-5 mr-2 text-pink-600" />
          Pomodoro Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className={`text-4xl font-bold ${darkMode ? "text-white" : "text-pink-600"}`}>
          {formatTime(time)}
        </div>
        <div className="flex justify-center space-x-2">
          <Button
            size="sm"
            onClick={toggleTimer}
            variant={isRunning ? "destructive" : "default"}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={resetTimer}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <Select value={timerDuration} onValueChange={handleDurationChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select duration" />
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