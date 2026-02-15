import { useCallback, useRef } from 'react';
import {
  scheduleNotification,
  scheduleRepeatingBuzz,
  cancelNotifications,
} from '@/lib/notifications';
import { type CalendarEvent } from '@/lib/database';

export function useNotifications() {
  const scheduledIdsRef = useRef<string[]>([]);

  const scheduleShiftReminders = useCallback(
    async (event: CalendarEvent) => {
      // Cancel any existing scheduled notifications for this shift
      await cancelScheduled();

      const startTime = new Date(event.startAt);
      const endTime = new Date(event.endAt);
      const now = new Date();
      const ids: string[] = [];

      // Schedule shift start notification (5 min before)
      const fiveMinBefore = new Date(startTime.getTime() - 5 * 60 * 1000);
      if (fiveMinBefore > now) {
        const id = await scheduleNotification(
          'Shift Starting Soon',
          `${event.clientName} shift starts in 5 minutes`,
          fiveMinBefore
        );
        ids.push(id);
      }

      // Schedule shift START notification (at exact start time)
      if (startTime > now) {
        const id = await scheduleNotification(
          'Shift Started!',
          `${event.clientName} shift is starting now — open app and tap Start`,
          startTime
        );
        ids.push(id);
      }

      // Schedule shift END notification (at exact end time)
      if (endTime > now) {
        const id = await scheduleNotification(
          'Shift Ended!',
          `${event.clientName} shift has ended — open app to stop alarm`,
          endTime
        );
        ids.push(id);
      }

      // Schedule repeating buzz notifications starting at shift end
      if (endTime > now) {
        const buzzIds = await scheduleRepeatingBuzz(
          'Clock Out Reminder',
          `Don't forget to clock out of ${event.clientName}`,
          endTime,
          30, // every 30 seconds
          10  // max 10 reminders (5 minutes of buzzing)
        );
        ids.push(...buzzIds);
      }

      scheduledIdsRef.current = ids;
    },
    []
  );

  const scheduleMedsReminder = useCallback(
    async (event: CalendarEvent) => {
      const startTime = new Date(event.startAt);
      const now = new Date();

      if (startTime > now) {
        const id = await scheduleNotification(
          'Medication Reminder',
          `Time for: ${event.clientName}`,
          startTime
        );
        scheduledIdsRef.current.push(id);
      }
    },
    []
  );

  const cancelScheduled = useCallback(async () => {
    if (scheduledIdsRef.current.length > 0) {
      await cancelNotifications(scheduledIdsRef.current);
      scheduledIdsRef.current = [];
    }
  }, []);

  return {
    scheduleShiftReminders,
    scheduleMedsReminder,
    cancelScheduled,
  };
}
