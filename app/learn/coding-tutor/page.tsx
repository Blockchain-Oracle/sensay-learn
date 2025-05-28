"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Code, Play, Send, CheckCircle, Circle, Lightbulb, MessageSquare, Save } from "lucide-react"
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { rust } from '@codemirror/lang-rust'
import { githubDark } from '@uiw/codemirror-theme-github'

// Type definitions
type Challenge = {
  id: number;
  title: string;
  description: string;
  starterCode: string;
  solution: string;
  difficulty: string;
  points: number;
}

type LanguageCode = 'javascript' | 'python' | 'rust' | 'solidity' | 'go';

type TutorialSection = {
  content: string;
  examples: string[];
}

// Sample starter code for different languages
const starterCode: Record<LanguageCode, string> = {
  javascript: `// Welcome to JavaScript!\nfunction greetUser(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greetUser("World"));`,
  python: `# Welcome to Python!\ndef greet_user(name):\n    return f"Hello, {name}!"\n\nprint(greet_user("World"))`,
  rust: `// Welcome to Rust!\nfn main() {\n    println!("Hello, World!");\n}`,
  solidity: `// Welcome to Solidity!\npragma solidity ^0.8.0;\n\ncontract Greeter {\n    string public greeting;\n\n    constructor() {\n        greeting = "Hello, World!";\n    }\n\n    function setGreeting(string memory _greeting) public {\n        greeting = _greeting;\n    }\n\n    function greet() public view returns (string memory) {\n        return greeting;\n    }\n}`,
  go: `// Welcome to Go!\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
}

// Sample code challenges for different languages
const codeChallenges: Record<LanguageCode, Challenge[]> = {
  javascript: [
    {
      id: 1,
      title: "FizzBuzz Challenge",
      description: "Write a function that prints numbers from 1 to n. For multiples of 3, print 'Fizz'. For multiples of 5, print 'Buzz'. For multiples of both 3 and 5, print 'FizzBuzz'.",
      starterCode: `function fizzBuzz(n) {\n  // Your code here\n}\n\n// Test with n = 15\nconsole.log(fizzBuzz(15));`,
      solution: `function fizzBuzz(n) {\n  const result = [];\n  for (let i = 1; i <= n; i++) {\n    if (i % 3 === 0 && i % 5 === 0) {\n      result.push("FizzBuzz");\n    } else if (i % 3 === 0) {\n      result.push("Fizz");\n    } else if (i % 5 === 0) {\n      result.push("Buzz");\n    } else {\n      result.push(i);\n    }\n  }\n  return result;\n}\n\n// Test with n = 15\nconsole.log(fizzBuzz(15));`,
      difficulty: "Easy",
      points: 100
    },
    {
      id: 2,
      title: "Palindrome Checker",
      description: "Write a function that checks if a given string is a palindrome (reads the same forward and backward, ignoring spaces, punctuation, and capitalization).",
      starterCode: `function isPalindrome(str) {\n  // Your code here\n}\n\n// Test cases\nconsole.log(isPalindrome("racecar"));  // true\nconsole.log(isPalindrome("hello"));    // false`,
      solution: `function isPalindrome(str) {\n  // Remove non-alphanumeric characters and convert to lowercase\n  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');\n  // Compare with reversed string\n  return cleanStr === cleanStr.split('').reverse().join('');\n}\n\n// Test cases\nconsole.log(isPalindrome("racecar"));  // true\nconsole.log(isPalindrome("hello"));    // false`,
      difficulty: "Medium",
      points: 200
    }
  ],
  python: [
    {
      id: 1, 
      title: "Sum of Even Numbers",
      description: "Write a function that returns the sum of all even numbers in a given list of integers.",
      starterCode: `def sum_even_numbers(numbers):\n    # Your code here\n    pass\n\n# Test cases\nprint(sum_even_numbers([1, 2, 3, 4, 5, 6]))  # Should return 12 (2+4+6)\nprint(sum_even_numbers([1, 3, 5]))           # Should return 0`,
      solution: `def sum_even_numbers(numbers):\n    return sum(num for num in numbers if num % 2 == 0)\n\n# Test cases\nprint(sum_even_numbers([1, 2, 3, 4, 5, 6]))  # Should return 12 (2+4+6)\nprint(sum_even_numbers([1, 3, 5]))           # Should return 0`,
      difficulty: "Easy",
      points: 100
    }
  ],
  rust: [],
  solidity: [],
  go: []
}

// Tutorial content for different languages
const tutorialContent: Record<LanguageCode, Record<string, TutorialSection>> = {
  javascript: {
    "Variables and Data Types": {
      content: "JavaScript has several data types: String, Number, Boolean, Object, Array, Null, and Undefined. Variables can be declared using let, const, or var.",
      examples: [
        "let name = 'John'; // String",
        "const age = 30; // Number",
        "let isActive = true; // Boolean",
        "const person = { name: 'John', age: 30 }; // Object",
        "const numbers = [1, 2, 3, 4]; // Array"
      ]
    },
    "Functions and Scope": {
      content: "Functions in JavaScript are blocks of reusable code. JavaScript has function scope and block scope.",
      examples: [
        "function add(a, b) { return a + b; }",
        "const multiply = (a, b) => a * b;",
        "// Block scope example",
        "if (true) {",
        "  let blockVar = 'only available in this block';",
        "  var functionVar = 'available throughout function';",
        "}"
      ]
    }
  },
  python: {
    "Variables and Data Types": {
      content: "Python has several built-in data types: string, int, float, bool, list, tuple, dict, and set.",
      examples: [
        "name = 'John'  # string",
        "age = 30  # int",
        "height = 5.11  # float",
        "is_student = True  # bool",
        "numbers = [1, 2, 3, 4]  # list",
        "person = {'name': 'John', 'age': 30}  # dict"
      ]
    }
  },
  rust: {},
  solidity: {},
  go: {}
}

// Define interface for Pyodide
interface PyodideInterface {
  runPython: (code: string) => any;
}

// Declare global Pyodide loader
declare global {
  interface Window {
    loadPyodide: (options: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

export default function CodingTutorPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("javascript")
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const [code, setCode] = useState(starterCode.javascript)
  const [output, setOutput] = useState("")
  const [activeTab, setActiveTab] = useState("lessons")
  const [activeLesson, setActiveLesson] = useState<string | null>(null)
  const [activeChallengeId, setActiveChallengeId] = useState<number | null>(null)
  const [userQuestion, setUserQuestion] = useState("")
  const [aiResponses, setAiResponses] = useState([
    "Need help with this concept? Ask me anything!"
  ])
  const [isExecuting, setIsExecuting] = useState(false)
  const [isPyodideLoading, setIsPyodideLoading] = useState(false)
  const pyodideRef = useRef<PyodideInterface | null>(null)
  const outputRef = useRef("")

  // List of supported languages
  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "solidity", label: "Solidity" },
    { value: "rust", label: "Rust" },
    { value: "go", label: "Go" },
  ]

  // Sample lessons data
  const lessons = [
    { id: 1, title: "Variables and Data Types", completed: true, difficulty: "Beginner" },
    { id: 2, title: "Functions and Scope", completed: true, difficulty: "Beginner" },
    { id: 3, title: "Arrays and Objects", completed: false, difficulty: "Intermediate" },
    { id: 4, title: "Async Programming", completed: false, difficulty: "Advanced" },
    { id: 5, title: "Error Handling", completed: false, difficulty: "Intermediate" },
  ]

  // Update code when language changes
  useEffect(() => {
    if (activeChallengeId) {
      const challenges = codeChallenges[selectedLanguage] || [];
      const challenge = challenges.find(c => c.id === activeChallengeId);
      if (challenge) {
        setCode(challenge.starterCode);
      } else {
        setCode(starterCode[selectedLanguage] || "");
        setActiveChallengeId(null);
      }
    } else {
      setCode(starterCode[selectedLanguage] || "");
    }
    setOutput("");
  }, [selectedLanguage, activeChallengeId]);

  // Get the appropriate language extension for CodeMirror
  const getLanguageExtension = () => {
    switch (selectedLanguage) {
      case 'javascript':
        return javascript();
      case 'python':
        return python();
      case 'rust':
        return rust();
      default:
        return javascript();
    }
  }

  // Load Pyodide script
  useEffect(() => {
    if (!window.loadPyodide && !document.getElementById('pyodide-script')) {
      const script = document.createElement('script');
      script.id = 'pyodide-script';
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        if (document.getElementById('pyodide-script')) {
          document.getElementById('pyodide-script')?.remove();
        }
      };
    }
  }, []);

  // Load Pyodide for Python execution when needed
  const loadPyodideInstance = async () => {
    if (selectedLanguage === 'python' && !pyodideRef.current && window.loadPyodide && !isPyodideLoading) {
      try {
        setIsPyodideLoading(true);
        setOutput("Loading Python environment...");
        pyodideRef.current = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
        });
        setOutput("Python environment loaded successfully! You can now run your code.");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setOutput(`Error loading Python environment: ${errorMessage}`);
        console.error("Error loading Pyodide:", error);
      } finally {
        setIsPyodideLoading(false);
      }
    }
  };

  // Execute code
  const runCode = async () => {
    setIsExecuting(true);
    setOutput("Running code...");
    outputRef.current = "";

    try {
      if (selectedLanguage === 'javascript') {
        // Execute JavaScript code
        const originalConsoleLog = console.log;
        let logOutput = "";
        
        // Override console.log to capture output
        console.log = (...args) => {
          const output = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          logOutput += output + '\n';
          originalConsoleLog(...args);
        };
        
        try {
          // Create a function from the code and execute it
          const executeFn = new Function(code);
          executeFn();
          setOutput(logOutput || "Code executed successfully (no output)");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          setOutput(`Error: ${errorMessage}`);
        } finally {
          // Restore original console.log
          console.log = originalConsoleLog;
        }
      } else if (selectedLanguage === 'python') {
        // Check if Pyodide is loaded, if not, load it
        if (!pyodideRef.current) {
          await loadPyodideInstance();
          
          // If still not loaded, show error
          if (!pyodideRef.current) {
            setOutput("Unable to load Python environment. Please try again later.");
            setIsExecuting(false);
            return;
          }
        }
        
        // Execute Python code with Pyodide
        try {
          // Redirect Python stdout to capture output
          pyodideRef.current.runPython(`
            import sys
            from io import StringIO
            sys.stdout = StringIO()
          `);
          
          // Run the actual code
          pyodideRef.current.runPython(code);
          
          // Get the captured output
          const stdout = pyodideRef.current.runPython("sys.stdout.getvalue()");
          setOutput(stdout || "Code executed successfully (no output)");
          
          // Reset stdout
          pyodideRef.current.runPython("sys.stdout = sys.__stdout__");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          setOutput(`Error: ${errorMessage}`);
        }
      } else {
        setOutput(`Execution of ${selectedLanguage} code is not supported in the browser.`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setOutput(`Error: ${errorMessage}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Load a lesson
  const loadLesson = (lessonTitle: string) => {
    setActiveLesson(lessonTitle);
    setActiveChallengeId(null);
    
    // If we have content for this lesson in the selected language
    if (tutorialContent[selectedLanguage] && tutorialContent[selectedLanguage][lessonTitle]) {
      const lessonData = tutorialContent[selectedLanguage][lessonTitle];
      const languageLabel = languages.find(l => l.value === selectedLanguage)?.label || selectedLanguage;
      
      // Update AI instructor with lesson content
      setAiResponses([
        `<strong>${lessonTitle} in ${languageLabel}</strong>: ${lessonData.content}`,
        `Examples:`,
        ...lessonData.examples.map(ex => `<code>${ex}</code>`)
      ]);
      
      // Reset code to language default
      setCode(starterCode[selectedLanguage]);
    } else {
      setAiResponses([`Lesson content for ${lessonTitle} in ${selectedLanguage} is not available yet.`]);
    }
  };

  // Load a challenge
  const loadChallenge = (challengeId: number) => {
    setActiveLesson(null);
    setActiveChallengeId(challengeId);
    
    const challenges = codeChallenges[selectedLanguage] || [];
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (challenge) {
      setCode(challenge.starterCode);
      setAiResponses([
        `<strong>${challenge.title}</strong>`,
        challenge.description,
        `Difficulty: ${challenge.difficulty}`,
        `Points: ${challenge.points}`,
        `Try to solve this challenge and run your code to test it.`
      ]);
    }
  };

  // Ask a question to the AI
  const askQuestion = () => {
    if (!userQuestion.trim()) return;
    
    // Simulate AI response (in a real app, this would call an API)
    setAiResponses(prev => [
      ...prev, 
      `<strong>You:</strong> ${userQuestion}`,
      `<strong>AI:</strong> I'll help you with "${userQuestion}". In ${selectedLanguage}, you can approach this by focusing on the core concepts first. Let me know if you need more specific guidance.`
    ]);
    
    setUserQuestion("");
  };

  // Get challenges for the selected language
  const getChallenges = () => {
    return codeChallenges[selectedLanguage] || [];
  };

  // Function to get hints based on the selected language and active content
  const getHints = () => {
    if (activeChallengeId) {
      // Return hints specific to the active challenge
      return [
        "Break down the problem into smaller steps",
        "Test your solution with different inputs",
        "Consider edge cases in your implementation"
      ];
    } else {
      // Return general hints for the selected language
      switch (selectedLanguage) {
        case 'javascript':
          return [
            "Remember to use const for variables that won't change",
            "Template literals use backticks and ${} for interpolation",
            "Don't forget to handle edge cases in your functions"
          ];
        case 'python':
          return [
            "Python uses indentation for code blocks, not curly braces",
            "Use list comprehensions for concise code",
            "Remember that Python is case-sensitive"
          ];
        default:
          return [
            "Practice is key to mastering programming",
            "Don't be afraid to experiment with the code",
            "Read documentation to understand language features"
          ];
      }
    }
  };

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
                <Code className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-semibold text-gray-900">Coding Tutor</span>
              </div>
            </div>

            {/* Language Selector */}
            <Select value={selectedLanguage} onValueChange={(value: LanguageCode) => setSelectedLanguage(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
          {/* Left Panel - Lessons and Challenges */}
          <div className="col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
                <TabsTrigger value="challenges">Challenges</TabsTrigger>
              </TabsList>

              <TabsContent value="lessons" className="mt-4">
                <Card className="h-[calc(100vh-12rem)]">
                  <CardHeader>
                    <CardTitle className="text-lg">{languages.find(l => l.value === selectedLanguage)?.label} Lessons</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 overflow-auto">
                    {lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={`flex items-center space-x-3 p-3 hover:bg-gray-50 rounded cursor-pointer ${activeLesson === lesson.title ? 'bg-blue-50' : ''}`}
                        onClick={() => loadLesson(lesson.title)}
                      >
                        {lesson.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{lesson.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {lesson.difficulty}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="challenges" className="mt-4">
                <Card className="h-[calc(100vh-12rem)]">
                  <CardHeader>
                    <CardTitle className="text-lg">Coding Challenges</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 overflow-auto">
                    {getChallenges().map((challenge) => (
                      <div 
                        key={challenge.id} 
                        className={`p-3 border rounded hover:bg-gray-50 cursor-pointer ${activeChallengeId === challenge.id ? 'bg-blue-50 border-blue-300' : ''}`}
                        onClick={() => loadChallenge(challenge.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{challenge.title}</p>
                          <Badge
                            variant={
                              challenge.difficulty === "Easy"
                                ? "default"
                                : challenge.difficulty === "Medium"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{challenge.points} points</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Center - Code Editor and AI Explanation */}
          <div className="col-span-6 space-y-4">
            {/* AI Explanation Area */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Instructor</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[200px] overflow-auto">
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  {aiResponses.map((response, index) => (
                    <p key={index} className="text-sm" dangerouslySetInnerHTML={{ __html: response }}></p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card className="flex-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Code Editor</CardTitle>
                  <div className="flex space-x-2">
                    <Button onClick={runCode} size="sm" disabled={isExecuting || (selectedLanguage === 'python' && isPyodideLoading)}>
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                    <Button variant="outline" size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded overflow-hidden">
                  <CodeMirror
                    value={code}
                    height="300px"
                    theme={githubDark}
                    extensions={[getLanguageExtension()]}
                    onChange={(value) => setCode(value)}
                    className="text-sm"
                  />
                </div>

                {/* Output */}
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm min-h-[100px] max-h-[200px] overflow-auto">
                  <div className="text-gray-500 mb-2">Output:</div>
                  <pre>{output || "Click 'Run' to execute your code"}</pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Hints and Settings */}
          <div className="col-span-3 space-y-4">
            {/* Explanation Mode Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Advanced Mode</p>
                    <p className="text-xs text-gray-600">More detailed explanations</p>
                  </div>
                  <Switch checked={isAdvancedMode} onCheckedChange={setIsAdvancedMode} />
                </div>
              </CardContent>
            </Card>

            {/* Hints */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                  Hints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[200px] overflow-auto">
                {getHints().map((hint, index) => (
                  <div key={index} className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                    <p className="text-sm">{hint}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Chat-based Help */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Ask for Help
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Textarea 
                      placeholder="Type your question..." 
                      className="flex-1 min-h-[60px] resize-none"
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          askQuestion();
                        }
                      }}
                    />
                    <Button size="sm" onClick={askQuestion}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
