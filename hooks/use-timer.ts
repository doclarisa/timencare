import { useState, useEffect, useCallback, useRef } from 'react';
import { Vibration } from 'react-native';
import { useDatabase } from '@/contexts/database-context';
import { generateId, type CalendarEvent, type Session } from '@/lib/database';
import { useEvents } from '@/hooks/use-events';

export type TimerStatus = 'idle' | 'waiting' | 'active' | 'overtime' | 'alerting';

interface TimerState {
  /** Current work shift for today (if any) */
  shift: CalendarEvent | null;
  /** Active session (clocked in but not out) */
  session: Session | null;
  /** Seconds remaining until shift end (negative = overtime) */
  secondsRemaining: number;
  /** Timer status */
  status: TimerStatus;
  /** Clock in to current shift */
  clockIn: () => void;
  /** Clock out of current session */
  clockOut: () => void;
  /** Acknowledge / dismiss alerting */
  acknowledge: () => void;
  /** Refresh shift data */
  refresh: () => void;
}

export function useTimer(): TimerState {
  const db = useDatabase();
  const { getTodayWorkShifts } = useEvents();
  const [shift, setShift] = useState<CalendarEvent | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const vibrationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadShift = useCallback(() => {
    const shifts = getTodayWorkShifts();
    if (shifts.length === 0) {
      setShift(null);
      setSession(null);
      setStatus('idle');
      return;
    }

    // Use the next upcoming shift, or current one
    const now = new Date();
    const upcoming = shifts.find((s) => new Date(s.endAt) > now) ?? shifts[shifts.length - 1];
    setShift(upcoming);

    // Check for active session
    const activeSession = db.getFirstSync<Session>(
      `SELECT * FROM sessions WHERE eventId = ? AND clockOutAt IS NULL ORDER BY clockInAt DESC LIMIT 1`,
      [upcoming.id]
    );

    if (activeSession) {
      setSession(activeSession);
      setStatus('active');
    } else {
      setSession(null);
      setStatus('waiting');
    }
  }, [db, getTodayWorkShifts]);

  // Calculate seconds remaining
  useEffect(() => {
    if (!shift || !session) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const tick = () => {
      const endTime = new Date(shift.endAt).getTime();
      const now = Date.now();
      const remaining = Math.floor((endTime - now) / 1000);
      setSecondsRemaining(remaining);

      if (remaining <= 0 && status !== 'alerting') {
        setStatus('alerting');
      } else if (remaining > 0 && remaining <= 300 && status === 'active') {
        setStatus('overtime');
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shift, session, status]);

  // Vibration when alerting
  useEffect(() => {
    if (status === 'alerting') {
      // Vibrate every 15 seconds
      Vibration.vibrate([0, 1000, 500, 1000]);
      vibrationRef.current = setInterval(() => {
        Vibration.vibrate([0, 1000, 500, 1000]);
      }, 15000);
    } else {
      if (vibrationRef.current) {
        clearInterval(vibrationRef.current);
        vibrationRef.current = null;
      }
      Vibration.cancel();
    }

    return () => {
      if (vibrationRef.current) {
        clearInterval(vibrationRef.current);
        vibrationRef.current = null;
      }
    };
  }, [status]);

  const clockIn = useCallback(() => {
    if (!shift) return;

    const now = new Date().toISOString();
    const id = generateId();
    db.runSync(
      `INSERT INTO sessions (id, eventId, clockInAt, createdAt) VALUES (?, ?, ?, ?)`,
      [id, shift.id, now, now]
    );

    const newSession: Session = {
      id,
      eventId: shift.id,
      clockInAt: now,
      clockOutAt: null,
      createdAt: now,
    };

    setSession(newSession);
    setStatus('active');
  }, [db, shift]);

  const clockOut = useCallback(() => {
    if (!session) return;

    const now = new Date().toISOString();
    db.runSync(
      `UPDATE sessions SET clockOutAt = ? WHERE id = ?`,
      [now, session.id]
    );

    setSession(null);
    setStatus('waiting');
    setSecondsRemaining(0);
    Vibration.cancel();
  }, [db, session]);

  const acknowledge = useCallback(() => {
    setStatus(session ? 'active' : 'waiting');
    Vibration.cancel();
  }, [session]);

  // Initial load
  useEffect(() => {
    loadShift();
  }, [loadShift]);

  return {
    shift,
    session,
    secondsRemaining,
    status,
    clockIn,
    clockOut,
    acknowledge,
    refresh: loadShift,
  };
}
