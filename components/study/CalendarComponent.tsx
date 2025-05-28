"use client"

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Plus, FileText } from "lucide-react"
import { getEventsForDate, addEvent } from '@/lib/services/google-calendar'

// Types
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  subject?: string;
}

interface CalendarComponentProps {
  darkMode?: boolean;
}

export default function CalendarComponent({ darkMode = false }: CalendarComponentProps) {
  // State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    description: "",
    subject: "",
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000), // Default to 1 hour
  })
  const [isGoogleAuthorized, setIsGoogleAuthorized] = useState(false)

  // Load events when date changes
  useEffect(() => {
    if (selectedDate) {
      loadEventsForDate(selectedDate);
    }
  }, [selectedDate])

  // Check Google Calendar authorization
  useEffect(() => {
    checkGoogleAuth();
    
    // For demo, load mock events initially
    loadMockEvents();
  }, [])

  // Load events for specific date
  const loadEventsForDate = async (date: Date) => {
    setIsLoading(true)
    
    try {
      if (isGoogleAuthorized) {
        // If Google Calendar is authorized, fetch real events
        const googleEvents = await getEventsForDate(date)
        
        // Convert Google Calendar events to our format
        const formattedEvents: CalendarEvent[] = googleEvents.map((event: any) => ({
          id: event.id,
          title: event.summary,
          start: new Date(event.start.dateTime || event.start.date),
          end: new Date(event.end.dateTime || event.end.date),
          description: event.description,
        }))
        
        setEvents(formattedEvents)
      } else {
        // For demo purposes, filter mock events by date
        const eventsForDate = events.filter(event => {
          const eventDate = new Date(event.start)
          return eventDate.getDate() === date.getDate() &&
                 eventDate.getMonth() === date.getMonth() &&
                 eventDate.getFullYear() === date.getFullYear()
        })
        
        setEvents(eventsForDate)
      }
    } catch (error) {
      console.error("Error loading events:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load mock events (for demo)
  const loadMockEvents = () => {
    const today = new Date()
    
    const mockEvents = [
      {
        id: "1",
        title: "Math Study Session",
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
        subject: "Mathematics"
      },
      {
        id: "2",
        title: "Physics Lab Prep",
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0),
        subject: "Physics"
      }
    ]
    
    setEvents(mockEvents)
  }

  // Check if Google Calendar API is authorized
  const checkGoogleAuth = () => {
    if (typeof window !== 'undefined' && window.gapi) {
      try {
        window.gapi.load('client:auth2', () => {
          window.gapi.client.init({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            scope: 'https://www.googleapis.com/auth/calendar'
          }).then(() => {
            // Check if already signed in
            if (window.gapi.auth2?.getAuthInstance().isSignedIn.get()) {
              setIsGoogleAuthorized(true)
            }
          })
        })
      } catch (error) {
        console.error("Error checking Google auth:", error)
      }
    }
  }

  // Handle Google Sign In
  const handleGoogleSignIn = () => {
    if (typeof window !== 'undefined' && window.gapi && window.gapi.auth2) {
      window.gapi.auth2.getAuthInstance().signIn().then(() => {
        setIsGoogleAuthorized(true)
        if (selectedDate) {
          loadEventsForDate(selectedDate)
        }
      })
    }
  }

  // Add event
  const addEventToCalendar = async () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) return
    
    try {
      if (isGoogleAuthorized) {
        // Add to Google Calendar
        const addedEvent = await addEvent({
          title: newEvent.title,
          description: newEvent.description,
          start: newEvent.start,
          end: newEvent.end,
          attendees: newEvent.subject ? [{ email: `${newEvent.subject}@example.com` }] : undefined
        })
        
        if (addedEvent) {
          // Convert the returned event to our format
          const formattedEvent: CalendarEvent = {
            id: addedEvent.id || Math.random().toString(),
            title: addedEvent.summary || newEvent.title || "",
            start: new Date(addedEvent.start?.dateTime || newEvent.start || new Date()),
            end: new Date(addedEvent.end?.dateTime || newEvent.end || new Date()),
            description: addedEvent.description,
            subject: newEvent.subject
          }
          
          setEvents([...events, formattedEvent])
        }
      } else {
        // For demo, just add to local state
        const event: CalendarEvent = {
          id: Math.random().toString(36).substring(7),
          title: newEvent.title || "",
          description: newEvent.description,
          subject: newEvent.subject,
          start: newEvent.start || new Date(),
          end: newEvent.end || new Date(new Date().getTime() + 60 * 60 * 1000)
        }
        
        setEvents([...events, event])
      }
      
      // Reset and close dialog
      setShowAddEvent(false)
      setNewEvent({
        title: "",
        description: "",
        subject: "",
        start: new Date(),
        end: new Date(new Date().getTime() + 60 * 60 * 1000)
      })
      
    } catch (error) {
      console.error("Error adding event:", error)
    }
  }

  // Format event time for display
  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Get events for selected date
  const getEventsForSelectedDate = () => {
    if (!selectedDate) return []
    
    return events.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.getDate() === selectedDate.getDate() &&
             eventDate.getMonth() === selectedDate.getMonth() &&
             eventDate.getFullYear() === selectedDate.getFullYear()
    })
  }

  return (
    <>
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
                    events.some(event => 
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
                    const hasEvents = events.some(event => 
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
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Event
              </Button>
            </div>
            
            {isLoading ? (
              <div className={`text-sm p-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading events...
              </div>
            ) : selectedDate && getEventsForSelectedDate().length > 0 ? (
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
              
              {events.length > 0 ? (
                <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1">
                  {events
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
          </div>
        </CardContent>
      </Card>

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
              <Button onClick={addEventToCalendar} disabled={!newEvent.title}>
                {isGoogleAuthorized ? 'Add to Google Calendar' : 'Add Event'}
              </Button>
            </div>
            {!isGoogleAuthorized && (
              <div className="text-center pt-2">
                <Button variant="outline" size="sm" onClick={handleGoogleSignIn}>
                  Connect to Google Calendar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 