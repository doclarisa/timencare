export type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
};

export type SessionState = 'active' | 'inactive' | 'paused';

export type Timer = {
  duration: number; // in seconds
  remaining: number; // in seconds
  state: SessionState;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  time: string;
};