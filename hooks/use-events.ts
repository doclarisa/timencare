import { useCallback } from 'react';
import { useDatabase } from '@/contexts/database-context';
import { generateId, type CalendarEvent, type EventType } from '@/lib/database';

interface CreateEventInput {
  clientName: string;
  startAt: string;
  endAt: string;
  type: EventType;
  notes?: string;
  colorHex?: string;
  notifyEnabled?: boolean;
}

interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}

export function useEvents() {
  const db = useDatabase();

  const getEventsForDate = useCallback(
    (dateStr: string): CalendarEvent[] => {
      return db.getAllSync<CalendarEvent>(
        `SELECT *, CAST(notifyEnabled AS INTEGER) as notifyEnabled
         FROM events
         WHERE date(startAt) = ?
         ORDER BY startAt ASC`,
        [dateStr]
      ).map(normalizeEvent);
    },
    [db]
  );

  const getEventsForMonth = useCallback(
    (year: number, month: number): CalendarEvent[] => {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

      return db.getAllSync<CalendarEvent>(
        `SELECT *, CAST(notifyEnabled AS INTEGER) as notifyEnabled
         FROM events
         WHERE date(startAt) >= ? AND date(startAt) < ?
         ORDER BY startAt ASC`,
        [startDate, endDate]
      ).map(normalizeEvent);
    },
    [db]
  );

  const getTodayWorkShifts = useCallback((): CalendarEvent[] => {
    const today = new Date().toISOString().split('T')[0];
    return db.getAllSync<CalendarEvent>(
      `SELECT *, CAST(notifyEnabled AS INTEGER) as notifyEnabled
       FROM events
       WHERE date(startAt) = ? AND type = 'WORK'
       ORDER BY startAt ASC`,
      [today]
    ).map(normalizeEvent);
  }, [db]);

  const getEventById = useCallback(
    (id: string): CalendarEvent | null => {
      const row = db.getFirstSync<CalendarEvent>(
        `SELECT *, CAST(notifyEnabled AS INTEGER) as notifyEnabled
         FROM events WHERE id = ?`,
        [id]
      );
      return row ? normalizeEvent(row) : null;
    },
    [db]
  );

  const createEvent = useCallback(
    (input: CreateEventInput): CalendarEvent => {
      const now = new Date().toISOString();
      const id = generateId();
      const event: CalendarEvent = {
        id,
        clientName: input.clientName,
        startAt: input.startAt,
        endAt: input.endAt,
        type: input.type,
        notes: input.notes ?? null,
        colorHex: input.colorHex ?? '#4A90D9',
        notifyEnabled: input.notifyEnabled ?? false,
        createdAt: now,
        updatedAt: now,
      };

      db.runSync(
        `INSERT INTO events (id, clientName, startAt, endAt, type, notes, colorHex, notifyEnabled, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event.id,
          event.clientName,
          event.startAt,
          event.endAt,
          event.type,
          event.notes,
          event.colorHex,
          event.notifyEnabled ? 1 : 0,
          event.createdAt,
          event.updatedAt,
        ]
      );

      return event;
    },
    [db]
  );

  const updateEvent = useCallback(
    (input: UpdateEventInput): void => {
      const now = new Date().toISOString();
      const fields: string[] = ['updatedAt = ?'];
      const values: (string | number | null)[] = [now];

      if (input.clientName !== undefined) {
        fields.push('clientName = ?');
        values.push(input.clientName);
      }
      if (input.startAt !== undefined) {
        fields.push('startAt = ?');
        values.push(input.startAt);
      }
      if (input.endAt !== undefined) {
        fields.push('endAt = ?');
        values.push(input.endAt);
      }
      if (input.type !== undefined) {
        fields.push('type = ?');
        values.push(input.type);
      }
      if (input.notes !== undefined) {
        fields.push('notes = ?');
        values.push(input.notes ?? null);
      }
      if (input.colorHex !== undefined) {
        fields.push('colorHex = ?');
        values.push(input.colorHex);
      }
      if (input.notifyEnabled !== undefined) {
        fields.push('notifyEnabled = ?');
        values.push(input.notifyEnabled ? 1 : 0);
      }

      values.push(input.id);
      db.runSync(
        `UPDATE events SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    },
    [db]
  );

  const deleteEvent = useCallback(
    (id: string): void => {
      db.runSync('DELETE FROM sessions WHERE eventId = ?', [id]);
      db.runSync('DELETE FROM events WHERE id = ?', [id]);
    },
    [db]
  );

  return {
    getEventsForDate,
    getEventsForMonth,
    getTodayWorkShifts,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}

function normalizeEvent(row: CalendarEvent): CalendarEvent {
  return {
    ...row,
    notifyEnabled: Boolean(row.notifyEnabled),
  };
}
