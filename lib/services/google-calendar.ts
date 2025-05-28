import { google } from "googleapis";

// Google Calendar API scopes
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

/**
 * Initialize Google Calendar API client
 * @returns Initialized Google Calendar API client
 */
export const initGoogleCalendar = async () => {
  try {
    // Get credentials from environment variables
    const credentials = {
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      client_email: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL,
      project_id: process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID,
      private_key: process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY,
    };

    // Create authentication client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

    // Initialize calendar client
    const calendar = google.calendar({ version: "v3", auth });
    return calendar;
  } catch (error) {
    console.error("Error initializing Google Calendar API:", error);
    return null;
  }
};

/**
 * Get events from Google Calendar for a specific date
 * @param date Date to get events for
 * @returns List of events
 */
export const getEventsForDate = async (date: Date) => {
  const calendar = await initGoogleCalendar();
  if (!calendar) return [];

  try {
    // Create start and end of day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Get events
    const response = await calendar.events.list({
      calendarId: process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID || 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
};

/**
 * Add an event to Google Calendar
 * @param event Event to add
 * @returns Created event or null if failed
 */
export const addEvent = async (event: {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  attendees?: { email: string }[];
}) => {
  const calendar = await initGoogleCalendar();
  if (!calendar) return null;

  try {
    const response = await calendar.events.insert({
      calendarId: process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID || 'primary',
      requestBody: {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: event.attendees,
        reminders: {
          useDefault: true,
        },
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error adding event to calendar:", error);
    return null;
  }
};

/**
 * Get available time slots for a specific date
 * @param date Date to get available time slots for
 * @param slotDuration Duration of each slot in minutes
 * @param startHour Start hour of day (0-23)
 * @param endHour End hour of day (0-23)
 * @returns List of available time slots
 */
export const getAvailableTimeSlots = async (
  date: Date,
  slotDuration = 30,
  startHour = 8,
  endHour = 17
) => {
  // Get events for the day
  const events = await getEventsForDate(date);
  
  // Generate all possible time slots
  const slots: Date[] = [];
  const slotDate = new Date(date);
  slotDate.setHours(startHour, 0, 0, 0);
  
  while (slotDate.getHours() < endHour) {
    slots.push(new Date(slotDate));
    slotDate.setMinutes(slotDate.getMinutes() + slotDuration);
  }
  
  // Filter out slots that overlap with events
  const availableSlots = slots.filter(slot => {
    const slotEnd = new Date(slot);
    slotEnd.setMinutes(slot.getMinutes() + slotDuration);
    
    // Check if this slot conflicts with any event
    return !events.some(event => {
      const eventStart = new Date(event.start?.dateTime || '');
      const eventEnd = new Date(event.end?.dateTime || '');
      
      // Check if the slot overlaps with the event
      return (slot < eventEnd && slotEnd > eventStart);
    });
  });
  
  return availableSlots;
}; 