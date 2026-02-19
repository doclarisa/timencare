import * as Calendar from 'expo-calendar';
import { Platform, Alert } from 'react-native';
import { type CalendarEvent } from '@/lib/database';

/** Request calendar permissions. Returns true if granted. */
export async function requestCalendarPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

/** Get (or create) a writable calendar ID for this device */
async function getDefaultCalendarId(): Promise<string | null> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  if (Platform.OS === 'android') {
    // Find the primary Google calendar or the first writable one
    const primary = calendars.find(
      (c) => c.isPrimary && c.allowsModifications
    );
    if (primary) return primary.id;

    const writable = calendars.find((c) => c.allowsModifications);
    if (writable) return writable.id;

    // No writable calendar found
    return null;
  }

  // iOS: use the default calendar
  const defaultCalendar = await Calendar.getDefaultCalendarAsync();
  if (defaultCalendar) return defaultCalendar.id;

  const writable = calendars.find((c) => c.allowsModifications);
  return writable?.id ?? null;
}

/** Add a CalendarEvent (shift) to the phone's native calendar with a 15-min reminder */
export async function addShiftToPhoneCalendar(
  event: CalendarEvent
): Promise<string | null> {
  const granted = await requestCalendarPermission();
  if (!granted) {
    Alert.alert(
      'Permission Required',
      'Calendar access is needed to add shift reminders. Please enable it in Settings.'
    );
    return null;
  }

  const calendarId = await getDefaultCalendarId();
  if (!calendarId) {
    Alert.alert(
      'No Calendar Found',
      'Could not find a writable calendar on this device.'
    );
    return null;
  }

  const startDate = new Date(event.startAt);
  const endDate = new Date(event.endAt);

  const title = `${event.clientName} — ${event.type === 'WORK' ? 'Shift' : event.type === 'MEDS' ? 'Medication' : 'Event'}`;

  const notes = [
    event.notes ?? '',
    `Type: ${event.type}`,
    'Created by TimeNCare',
  ]
    .filter(Boolean)
    .join('\n');

  const calendarEventId = await Calendar.createEventAsync(calendarId, {
    title,
    startDate,
    endDate,
    notes,
    alarms: [{ relativeOffset: -15 }], // 15 minutes before
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  return calendarEventId;
}
