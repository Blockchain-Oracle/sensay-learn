"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  FlaskConical,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share,
  AlertTriangle,
  Beaker,
  Microscope,
  Thermometer,
  Scale,
  Timer,
  BarChart3,
  BookOpen,
  CheckCircle,
  Eye,
  Save,
} from "lucide-react"
import ChatInterface from "@/components/chat-interface"

export default function ScienceLabPage() {
  const [selectedExperiment, setSelectedExperiment] = useState("")
  const [experimentPhase, setExperimentPhase] = useState<"setup" | "running" | "analysis" | "complete">("setup")
  const [temperature, setTemperature] = useState([25])
  const [pH, setPH] = useState([7])
  const [volume, setVolume] = useState([100])
  const [isExperimentRunning, setIsExperimentRunning] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const experiments = [
    {
      id: "acid-base",
      title: "Acid-Base Titration",
      category: "Chemistry",
      difficulty: "Intermediate",
      duration: "30 min",
      description: "Determine the concentration of an unknown acid using a standard base solution",
      safety: ["Wear safety goggles", "Use fume hood", "Handle acids carefully"],
      equipment: ["Burette", "Conical flask", "Pipette", "pH indicator"],
    },
    {
      id: "pendulum",
      title: "Simple Pendulum",
      category: "Physics",
      difficulty: "Beginner",
      duration: "20 min",
      description: "Study the relationship between pendulum length and period",
      safety: ["Secure pendulum properly", "Clear workspace"],
      equipment: ["Pendulum bob", "String", "Ruler", "Stopwatch"],
    },
    {
      id: "photosynthesis",
      title: "Photosynthesis Rate",
      category: "Biology",
      difficulty: "Advanced",
      duration: "45 min",
      description: "Measure oxygen production in aquatic plants under different light conditions",
      safety: ["Handle plants gently", "Use appropriate lighting"],
      equipment: ["Aquatic plants", "Light source", "Measuring cylinder", "Thermometer"],
    },
    {
      id: "density",
      title: "Density Determination",
      category: "Physics",
      difficulty: "Beginner",
      duration: "25 min",
      description: "Calculate density of various materials using mass and volume measurements",
      safety: ["Handle materials carefully", "Clean up spills immediately"],
      equipment: ["Balance", "Measuring cylinder", "Various materials"],
    },
  ]

  const labEquipment = [
    { id: "beaker", name: "Beaker", icon: Beaker, available: true },
    { id: "microscope", name: "Microscope", icon: Microscope, available: true },
    { id: "thermometer", name: "Thermometer", icon: Thermometer, available: true },
    { id: "scale", name: "Digital Scale", icon: Scale, available: false },
    { id: "timer", name: "Timer", icon: Timer, available: true },
  ]

  const experimentSteps = [
    { id: 1, title: "Set up equipment", description: "Arrange all necessary equipment on the lab bench" },
    { id: 2, title: "Prepare solutions", description: "Measure and prepare required chemical solutions" },
    { id: 3, title: "Record initial readings", description: "Take baseline measurements before starting" },
    { id: 4, title: "Begin experiment", description: "Start the experimental procedure" },
    { id: 5, title: "Monitor progress", description: "Observe and record changes during the experiment" },
    { id: 6, title: "Collect data", description: "Gather all experimental data and measurements" },
    { id: 7, title: "Clean up", description: "Properly dispose of materials and clean equipment" },
  ]

  const dataPoints = [
    { time: 0, value: 0, unit: "mL" },
    { time: 5, value: 12, unit: "mL" },
    { time: 10, value: 24, unit: "mL" },
    { time: 15, value: 35, unit: "mL" },
    { time: 20, value: 45, unit: "mL" },
  ]

  const currentExperiment = experiments.find((exp) => exp.id === selectedExperiment)

  const toggleStep = (stepId: number) => {
    setCompletedSteps((prev) => (prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]))
  }

  const systemPrompt = `You are a Virtual Science Lab instructor. The current experiment is: "${currentExperiment?.title || "none selected"}". The experiment phase is: ${experimentPhase}. Your role is to:
- Guide users through simulated science experiments safely
- Explain scientific concepts and principles behind experiments
- Provide step-by-step instructions for virtual lab procedures
- Help users understand observations and draw conclusions
- Teach scientific method and experimental design
- Cover various science fields: chemistry, physics, biology, earth science
- Ensure safety awareness even in virtual experiments
- Encourage scientific curiosity and critical thinking

Current experiment parameters: Temperature: ${temperature[0]}°C, pH: ${pH[0]}, Volume: ${volume[0]}mL. Be enthusiastic about science while maintaining accuracy and safety awareness.`

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
                <FlaskConical className="h-6 w-6 text-cyan-600" />
                <span className="text-xl font-semibold text-gray-900">Virtual Science Lab</span>
              </div>
            </div>

            {/* Experiment Selector */}
            <Select value={selectedExperiment} onValueChange={setSelectedExperiment}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select an experiment" />
              </SelectTrigger>
              <SelectContent>
                {experiments.map((exp) => (
                  <SelectItem key={exp.id} value={exp.id}>
                    {exp.title} ({exp.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {!selectedExperiment ? (
          /* Experiment Selection */
          <div className="text-center py-12">
            <FlaskConical className="h-16 w-16 mx-auto mb-6 text-cyan-600" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Experiment</h1>
            <p className="text-lg text-gray-600 mb-8">
              Select from our library of interactive science experiments across multiple disciplines.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {experiments.map((experiment) => (
                <Card
                  key={experiment.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  onClick={() => setSelectedExperiment(experiment.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{experiment.category}</Badge>
                      <Badge
                        variant={
                          experiment.difficulty === "Beginner"
                            ? "default"
                            : experiment.difficulty === "Intermediate"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {experiment.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{experiment.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{experiment.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Duration: {experiment.duration}</span>
                      <span>{experiment.equipment.length} tools needed</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Experiment Interface */
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
            {/* Left Panel - Equipment & Safety */}
            <div className="col-span-3 space-y-4">
              {/* Safety Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    Safety Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentExperiment?.safety.map((guideline, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{guideline}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Virtual Equipment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lab Equipment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {labEquipment.map((equipment) => {
                    const IconComponent = equipment.icon
                    return (
                      <div
                        key={equipment.id}
                        className={`flex items-center space-x-3 p-2 rounded border ${
                          equipment.available
                            ? "border-green-200 bg-green-50 cursor-pointer hover:bg-green-100"
                            : "border-gray-200 bg-gray-50 opacity-50"
                        }`}
                      >
                        <IconComponent
                          className={`h-5 w-5 ${equipment.available ? "text-green-600" : "text-gray-400"}`}
                        />
                        <span className={`text-sm ${equipment.available ? "text-gray-900" : "text-gray-500"}`}>
                          {equipment.name}
                        </span>
                        {equipment.available && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Experiment Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Procedure Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {experimentSteps.map((step) => (
                    <div key={step.id} className="flex items-start space-x-3">
                      <Checkbox
                        checked={completedSteps.includes(step.id)}
                        onCheckedChange={() => toggleStep(step.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Center - Simulation & Controls */}
            <div className="col-span-6">
              <Tabs defaultValue="simulation" className="h-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="simulation">Simulation</TabsTrigger>
                  <TabsTrigger value="data">Data Analysis</TabsTrigger>
                  <TabsTrigger value="chat">AI Instructor</TabsTrigger>
                </TabsList>

                <TabsContent value="simulation" className="mt-4 h-[calc(100%-3rem)]">
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{currentExperiment?.title}</CardTitle>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => setIsExperimentRunning(!isExperimentRunning)}
                            variant={isExperimentRunning ? "destructive" : "default"}
                          >
                            {isExperimentRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="outline">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Simulation Viewer */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-8 text-center border-2 border-dashed border-cyan-200">
                        <FlaskConical className="h-24 w-24 mx-auto mb-4 text-cyan-600" />
                        <p className="text-lg font-medium text-gray-900 mb-2">Interactive Simulation</p>
                        <p className="text-sm text-gray-600 mb-4">
                          3D visualization of {currentExperiment?.title} in progress
                        </p>
                        <Badge className="bg-cyan-100 text-cyan-700">Phase: {experimentPhase}</Badge>
                      </div>

                      {/* Variable Controls */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Temperature: {temperature[0]}°C</label>
                          <Slider value={temperature} onValueChange={setTemperature} max={100} min={0} step={1} />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">pH: {pH[0]}</label>
                          <Slider value={pH} onValueChange={setPH} max={14} min={0} step={0.1} />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Volume: {volume[0]}mL</label>
                          <Slider value={volume} onValueChange={setVolume} max={500} min={0} step={10} />
                        </div>
                      </div>

                      {/* Real-time Observations */}
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center mb-2">
                          <Eye className="h-5 w-5 text-yellow-600 mr-2" />
                          <span className="font-medium">Observations</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          Solution color changing from clear to pink. Temperature rising steadily. pH decreasing as
                          titration progresses.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="data" className="mt-4">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                        Data Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Data Table */}
                      <div>
                        <h4 className="font-medium mb-3">Collected Data</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium">Time (min)</th>
                                <th className="px-4 py-2 text-left text-sm font-medium">Volume (mL)</th>
                                <th className="px-4 py-2 text-left text-sm font-medium">pH</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dataPoints.map((point, index) => (
                                <tr key={index} className="border-t">
                                  <td className="px-4 py-2 text-sm">{point.time}</td>
                                  <td className="px-4 py-2 text-sm">{point.value}</td>
                                  <td className="px-4 py-2 text-sm">{(7 - point.time * 0.1).toFixed(1)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Graph Placeholder */}
                      <div className="bg-gray-50 rounded-lg p-8 text-center border">
                        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-900 mb-2">Data Visualization</p>
                        <p className="text-sm text-gray-600 mb-4">Interactive graphs and charts of your results</p>
                        <Button size="sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Generate Graph
                        </Button>
                      </div>

                      {/* Analysis Tools */}
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                        <Button size="sm" variant="outline">
                          <Save className="h-4 w-4 mr-2" />
                          Save Results
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="chat" className="mt-4 h-[calc(100%-3rem)]">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">AI Lab Instructor</CardTitle>
                    </CardHeader>
                    <div className="flex-1 px-6 pb-6">
                      <ChatInterface
                        title=""
                        description=""
                        icon={<></>}
                        systemPrompt={systemPrompt}
                        placeholderMessage="Ask about the experiment or request guidance..."
                        suggestedQuestions={[
                          "Explain what's happening in this reaction",
                          "Why did the color change occur?",
                          "How do I interpret these results?",
                          "What should I conclude from this data?",
                        ]}
                      />
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel - Materials & Quiz */}
            <div className="col-span-3 space-y-4">
              {/* Materials Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Required Materials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentExperiment?.equipment.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Progress Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Experiment Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Steps Completed</span>
                      <span>
                        {completedSteps.length}/{experimentSteps.length}
                      </span>
                    </div>
                    <Progress value={(completedSteps.length / experimentSteps.length) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Data Collection</span>
                      <span>{dataPoints.length}/10</span>
                    </div>
                    <Progress value={(dataPoints.length / 10) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Quiz */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                    Knowledge Check
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-purple-50 p-3 rounded border">
                    <p className="text-sm font-medium mb-2">What causes the color change in this titration?</p>
                    <div className="space-y-1">
                      <label className="flex items-center space-x-2 text-sm">
                        <input type="radio" name="quiz1" />
                        <span>pH indicator</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <input type="radio" name="quiz1" />
                        <span>Temperature change</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <input type="radio" name="quiz1" />
                        <span>Concentration change</span>
                      </label>
                    </div>
                  </div>
                  <Button size="sm" className="w-full">
                    Submit Answer
                  </Button>
                </CardContent>
              </Card>

              {/* Lab Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lab Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full mb-2">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share className="h-4 w-4 mr-2" />
                    Share Results
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
