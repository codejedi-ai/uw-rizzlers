export interface Event {
  id: string;
  title: string;
  description: string;
  link: string;
  x: number;
  y: number;
  color: string;
  buttonColor: string;
  type: 'event' | 'community';
  time?: string; // Only for events
  createdAt: Date;
}

export interface BulletinBoardState {
  events: Event[];
  selectedEvent: Event | null;
  isDragging: boolean;
}
