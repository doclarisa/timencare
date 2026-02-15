import { Event } from '../types';

const calendarEvents: Event[] = [];

export const addEvent = (event: Event) => {
    calendarEvents.push(event);
};

export const editEvent = (updatedEvent: Event) => {
    const index = calendarEvents.findIndex(event => event.id === updatedEvent.id);
    if (index !== -1) {
        calendarEvents[index] = updatedEvent;
    }
};

export const getEvents = (date: string): Event[] => {
    return calendarEvents.filter(event => event.date === date);
};

export const deleteEvent = (eventId: string) => {
    const index = calendarEvents.findIndex(event => event.id === eventId);
    if (index !== -1) {
        calendarEvents.splice(index, 1);
    }
};