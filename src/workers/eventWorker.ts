// Event Worker - Handles fetching and processing event data
import { Event } from '../types/Event';

// Simulate API endpoints (replace with real endpoints later)
const API_BASE_URL = 'https://api.uwrizzlords.com'; // Replace with actual API

interface WorkerMessage {
  type: 'FETCH_EVENTS' | 'FETCH_EVENT' | 'CREATE_EVENT' | 'UPDATE_EVENT' | 'DELETE_EVENT';
  payload?: any;
}

interface WorkerResponse {
  type: 'EVENTS_LOADED' | 'EVENT_LOADED' | 'EVENT_CREATED' | 'EVENT_UPDATED' | 'EVENT_DELETED' | 'ERROR';
  payload?: any;
  error?: string;
}

// Mock data for development (replace with real API calls)
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Hackathon Workshop',
    description: 'Learn web development and build cool projects',
    link: 'https://luma.com/events/hackathon-workshop',
    x: 100,
    y: 100,
    color: '#E6F3FF',
    buttonColor: '#007bff',
    type: 'event',
    time: '2024-01-15T10:00',
    createdAt: new Date('2024-01-10')
  },
  {
    id: '2',
    title: 'Study Group',
    description: 'CS 142 study session in the library',
    link: 'https://discord.gg/studygroup',
    x: 300,
    y: 200,
    color: '#F0FFF0',
    buttonColor: '#28a745',
    type: 'community',
    createdAt: new Date('2024-01-11')
  },
  {
    id: '3',
    title: 'Game Night',
    description: 'Board games and pizza in the common room',
    link: 'https://app.getriver.io/events/game-night',
    x: 500,
    y: 150,
    color: '#FFF8DC',
    buttonColor: '#ffc107',
    type: 'event',
    time: '2024-01-20T18:00',
    createdAt: new Date('2024-01-12')
  }
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch all events
async function fetchEvents(): Promise<Event[]> {
  try {
    // Simulate API call delay
    await delay(500);
    
    // In production, replace with actual API call:
    // const response = await fetch(`${API_BASE_URL}/events`);
    // const events = await response.json();
    // return events;
    
    return mockEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events');
  }
}

// Fetch single event by ID
async function fetchEvent(id: string): Promise<Event | null> {
  try {
    await delay(200);
    
    // In production:
    // const response = await fetch(`${API_BASE_URL}/events/${id}`);
    // const event = await response.json();
    // return event;
    
    const event = mockEvents.find(e => e.id === id);
    return event || null;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw new Error('Failed to fetch event');
  }
}

// Create new event
async function createEvent(eventData: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
  try {
    console.log(`Creating ${eventData.type}: "${eventData.title}"`);
    await delay(300);
    
    // In production:
    // const response = await fetch(`${API_BASE_URL}/events`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(eventData)
    // });
    // const event = await response.json();
    // return event;
    
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    console.log(`✅ Successfully created ${eventData.type} "${newEvent.title}" (ID: ${newEvent.id}) in database`);
    return newEvent;
  } catch (error) {
    console.error(`❌ Failed to create ${eventData.type} "${eventData.title}" in database:`, error);
    throw new Error('Failed to create event');
  }
}

// Update existing event
async function updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
  try {
    await delay(300);
    
    // In production:
    // const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(eventData)
    // });
    // const event = await response.json();
    // return event;
    
    const existingEvent = mockEvents.find(e => e.id === id);
    if (!existingEvent) {
      throw new Error('Event not found');
    }
    
    const updatedEvent = { ...existingEvent, ...eventData };
    return updatedEvent;
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event');
  }
}

// Delete event
async function deleteEvent(id: string): Promise<boolean> {
  try {
    await delay(200);
    
    // In production:
    // const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    //   method: 'DELETE'
    // });
    // return response.ok;
    
    const index = mockEvents.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Event not found');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('Failed to delete event');
  }
}

// Handle worker messages
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;
  
  try {
    let response: WorkerResponse;
    
    switch (type) {
      case 'FETCH_EVENTS':
        const events = await fetchEvents();
        response = { type: 'EVENTS_LOADED', payload: events };
        break;
        
      case 'FETCH_EVENT':
        const event = await fetchEvent(payload.id);
        response = { type: 'EVENT_LOADED', payload: event };
        break;
        
      case 'CREATE_EVENT':
        const newEvent = await createEvent(payload);
        response = { type: 'EVENT_CREATED', payload: newEvent };
        break;
        
      case 'UPDATE_EVENT':
        const updatedEvent = await updateEvent(payload.id, payload.data);
        response = { type: 'EVENT_UPDATED', payload: updatedEvent };
        break;
        
      case 'DELETE_EVENT':
        const deleted = await deleteEvent(payload.id);
        response = { type: 'EVENT_DELETED', payload: { id: payload.id, success: deleted } };
        break;
        
      default:
        response = { type: 'ERROR', error: 'Unknown message type' };
    }
    
    self.postMessage(response);
  } catch (error) {
    const errorResponse: WorkerResponse = {
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    self.postMessage(errorResponse);
  }
});

// Export for TypeScript
export {};
