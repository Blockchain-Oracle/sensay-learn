"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Calendar as CalendarIcon } from "lucide-react"

// Add type for calendar events
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  subject?: string;
}

interface StudyCalendarProps {
  darkMode?: boolean;
}

export default function StudyCalendar({ darkMode = false }: StudyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [isGoogleAuthorized, setIsGoogleAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // New event form state
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    description: "",
    subject: "",
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000), // Default to 1 hour
  })

  // Initialize Google Calendar API
  useEffect(() => {
    const loadGoogleApi = () => {
      if (typeof window !== 'undefined' && !window.gapi) {
        const script = document.createElement('script')
        script.src = 'https://apis.google.com/js/api.js'
        script.onload = initGoogleCalendarApi
        document.body.appendChild(script)
      } else if (window.gapi) {
        initGoogleCalendarApi()
      }
    }
    
    loadGoogleApi()
    
    // Load mock events for demo purposes
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
  }, [])

  // Initialize Google Calendar API
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
          if (window.gapi.auth2?.getAuthInstance()?.isSignedIn.get()) {
            setIsGoogleAuthorized(true)
            loadCalendarEvents()
          }
        }).catch((error: Error) => {
          console.error("Error initializing Google API:", error)
        })
      })
    }
  }

  // Handle Google Sign In
  const handleGoogleSignIn = () => {
    setIsLoading(true)
    if (window.gapi && window.gapi.auth2) {
      window.gapi.auth2.getAuthInstance().signIn()
        .then(() => {
          setIsGoogleAuthorized(true)
          loadCalendarEvents()
          setIsLoading(false)
        })
        .catch((error: Error) => {
          console.error("Error signing in with Google:", error)
          setIsLoading(false)
        })
    } else {
      console.error("Google API not loaded")
      setIsLoading(false)
    }
  }

  // Load calendar events from Google Calendar
  const loadCalendarEvents = () => {
    setIsLoading(true)
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
          description: event.description,
          subject: event.description?.split(':')[0] || ''
        }))
        setCalendarEvents(events)
        setIsLoading(false)
      }).catch((error: Error) => {
        console.error("Error loading calendar events:", error)
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }

  // Add event to Google Calendar
  const addEventToGoogleCalendar = () => {
    if (!newEvent.title) return
    
    setIsLoading(true)
    
    if (window.gapi && window.gapi.client && isGoogleAuthorized) {
      const event = {
        'summary': newEvent.title,
        'description': newEvent.description || `${newEvent.subject || 'Study session'}`,
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
        setIsLoading(false)
      }).catch((error: Error) => {
        console.error("Error adding event to Google Calendar:", error)
        setIsLoading(false)
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
      setIsLoading(false)
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

  // Format event time
  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>Study Calendar</CardTitle>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-[240px] justify-start text-left font-normal ${
                !selectedDate && "text-muted-foreground"
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                if (date) {
                  // Set the new event start and end times
                  const startDate = new Date(date);
                  startDate.setHours(9, 0, 0, 0);
                  const endDate = new Date(date);
                  endDate.setHours(10, 0, 0, 0);
                  
                  setNewEvent({
                    ...newEvent,
                    start: startDate,
                    end: endDate
                  });
                }
              }}
              initialFocus
              modifiers={{
                event: date => 
                  calendarEvents.some(event => 
                    date && 
                    event.start.getDate() === date.getDate() &&
                    event.start.getMonth() === date.getMonth() &&
                    event.start.getFullYear() === date.getFullYear()
                  )
              }}
              modifiersStyles={{
                event: { 
                  fontWeight: 'bold',
                  border: darkMode ? '2px solid #6366f1' : '2px solid #818cf8',
                  backgroundColor: darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(129, 140, 248, 0.1)'
                }
              }}
              components={{
                Day: ({ day, ...props }) => {
                  // Check if date has events
                  const hasEvents = calendarEvents.some(event => 
                    day.date && 
                    event.start.getDate() === day.date.getDate() &&
                    event.start.getMonth() === day.date.getMonth() &&
                    event.start.getFullYear() === day.date.getFullYear()
                  );
                  
                  return (
                    <div
                      {...props}
                      className={`relative ${props.className} cursor-pointer`}
                    >
                      {props.children}
                      {hasEvents && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></div>
                      )}
                    </div>
                  );
                },
              }}
            />
          </PopoverContent>
        </Popover>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Calendar day events */}
          <div className="flex justify-between items-center">
            <h4 className={`font-medium text-sm ${darkMode ? "text-white" : ""}`}>
              Events on {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "No date selected"}
            </h4>
            
            <Button 
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => {
                if (selectedDate) {
                  // Set the new event start and end times
                  const startDate = new Date(selectedDate);
                  startDate.setHours(9, 0, 0, 0);
                  const endDate = new Date(selectedDate);
                  endDate.setHours(10, 0, 0, 0);
                  
                  setNewEvent({
                    ...newEvent,
                    start: startDate,
                    end: endDate
                  });
                  setShowAddEvent(true);
                }
              }}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          </div>
          
          {selectedDate && getEventsForSelectedDate().length > 0 ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {getEventsForSelectedDate().map(event => (
                <div 
                  key={event.id}
                  className={`p-2 rounded text-sm flex justify-between items-start ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : ''}`}>{event.title}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatEventTime(event.start)} - {formatEventTime(event.end)}
                    </div>
                    {event.subject && (
                      <Badge variant="outline" className="mt-1">
                        {event.subject}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => {
                    // Edit event functionality
                    setNewEvent({
                      ...event,
                    });
                    setShowAddEvent(true);
                  }}>
                    <div className="sr-only">Edit</div>
                    <FileText className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : selectedDate ? (
            <div className={`text-sm p-4 text-center rounded border ${darkMode ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>
              No events scheduled for this day
            </div>
          ) : (
            <div className={`text-sm p-4 text-center rounded border ${darkMode ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>
              Select a date to see events
            </div>
          )}
          
          {/* Upcoming events section */}
          <div className="mt-4">
            <h4 className={`font-medium text-sm mb-2 ${darkMode ? "text-white" : ""}`}>
              Upcoming Events
            </h4>
            
            {calendarEvents.length > 0 ? (
              <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1">
                {calendarEvents
                  .filter(event => new Date(event.start) >= new Date())
                  .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                  .slice(0, 3)
                  .map(event => (
                    <div 
                      key={event.id}
                      className={`p-2 rounded text-xs ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className={`font-medium ${darkMode ? 'text-white' : ''}`}>
                          {event.title}
                        </span>
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {format(new Date(event.start), "MMM d")}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No upcoming events
              </div>
            )}
          </div>

          {/* Google Calendar Integration */}
          {!isGoogleAuthorized && (
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full"
              >
                Connect to Google Calendar
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Event Dialog */}
      <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
        <DialogContent className={`sm:max-w-[425px] ${darkMode ? "bg-gray-800 text-white" : ""}`}>
          <DialogHeader>
            <DialogTitle>{newEvent.id ? 'Edit Study Session' : 'Add Study Session'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Session Title</Label>
              <Input 
                id="title" 
                placeholder="Math Study" 
                value={newEvent.title} 
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select 
                value={newEvent.subject} 
                onValueChange={(value) => setNewEvent({...newEvent, subject: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                placeholder="Study session details..."
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input 
                  type="time"
                  value={newEvent.start ? `${newEvent.start.getHours().toString().padStart(2, '0')}:${newEvent.start.getMinutes().toString().padStart(2, '0')}` : ''}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number)
                    const newDate = new Date(newEvent.start || new Date())
                    newDate.setHours(hours, minutes)
                    setNewEvent({...newEvent, start: newDate})
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input 
                  type="time"
                  value={newEvent.end ? `${newEvent.end.getHours().toString().padStart(2, '0')}:${newEvent.end.getMinutes().toString().padStart(2, '0')}` : ''}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number)
                    const newDate = new Date(newEvent.end || new Date())
                    newDate.setHours(hours, minutes)
                    setNewEvent({...newEvent, end: newDate})
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setShowAddEvent(false)}>Cancel</Button>
              <Button 
                onClick={addEventToGoogleCalendar} 
                disabled={!newEvent.title || isLoading}
              >
                {isGoogleAuthorized ? 'Add to Google Calendar' : 'Add Event'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 