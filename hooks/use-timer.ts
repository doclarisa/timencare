import { useState, useEffect, useCallback, useRef } from 'react';
import { Vibration } from 'react-native';
import { useDatabase } from '@/contexts/database-context';
import { generateId, type CalendarEvent, type Session } from '@/lib/database';
import { useEvents } from '@/hooks/use-events';
import { playAlarm, stopAlarm, loadAlarmSound, loadVolume, type AlarmSoundId } from '@/lib/alarm-sounds';

/**
 * Timer statuses:
 * - idle: no shift today
 * - waiting: shift exists but start time hasn't arrived yet (shows full duration)
 * - start_alarm: shift start time arrived, alarm playing, waiting for user to press Start
 * - active: user pressed Start, countdown running
 * - paused: user pressed Pause, countdown frozen
 * - end_alarm: countdown reached 0, alarm playing, waiting for user to press Stop
 * - completed: user pressed Stop after end alarm, shift done
 */
export type TimerStatus =
  | 'idle'
  | 'waiting'
  | 'start_alarm'
  | 'active'
  | 'paused'
  | 'end_alarm'
  | 'completed';

interface TimerState {
  shift: CalendarEvent | null;
  session: Session | null;
  secondsRemaining: number;
  totalShiftSeconds: number;
  status: TimerStatus;
  /** Press Start: stops start alarm, begins countdown */
  clockIn: () => void;
  /** Press Pause: freezes countdown */
  pause: () => void;
  /** Press Resume: resumes countdown from where it was */
  resume: () => void;
  /** Press Stop: stops end alarm, marks shift complete */
  clockOut: () => void;
  /** Reset: go back to waiting state */
  reset: () => void;
  refresh: () => void;
}

export function useTimer(): TimerState {
  const db = useDatabase();
  const { getTodayWorkShifts } = useEvents();
  const [shift, setShift] = useState<CalendarEvent | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [totalShiftSeconds, setTotalShiftSeconds] = useState(0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alarmSoundRef = useRef<AlarmSoundId>('chime');
  const alarmVolumeRef = useRef<number>(1.0);

  // Load alarm settings
  useEffect(() => {
    loadAlarmSound().then((s) => { alarmSoundRef.current = s; });
    loadVolume().then((v) => { alarmVolumeRef.current = v / 100; });
  }, []);

  const clearAllIntervals = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (startCheckRef.current) {
      clearInterval(startCheckRef.current);
      startCheckRef.current = null;
    }
  }, []);

  const loadShift = useCallback(() => {
    clearAllIntervals();
    stopAlarm();
    Vibration.cancel();

    const shifts = getTodayWorkShifts();
    if (shifts.length === 0) {
      setShift(null);
      setSession(null);
      setStatus('idle');
      setSecondsRemaining(0);
      setTotalShiftSeconds(0);
      return;
    }

    // Use the next upcoming shift, or current one
    const now = new Date();
    const upcoming = shifts.find((s) => new Date(s.endAt) > now) ?? shifts[shifts.length - 1];
    setShift(upcoming);

    // Calculate total shift duration
    const start = new Date(upcoming.startAt).getTime();
    const end = new Date(upcoming.endAt).getTime();
    const durationSec = Math.floor((end - start) / 1000);
    setTotalShiftSeconds(durationSec);
    setSecondsRemaining(durationSec);

    // Check for active session
    try {
      const activeSession = db.getFirstSync<Session>(
        `SELECT * FROM sessions WHERE eventId = ? AND clockOutAt IS NULL ORDER BY clockInAt DESC LIMIT 1`,
        [upcoming.id]
      );

      if (activeSession) {
        setSession(activeSession);
        // If there's an active session, resume countdown from where it was
        // Calculate elapsed time since clock in
        const clockInTime = new Date(activeSession.clockInAt).getTime();
        const elapsed = Math.floor((Date.now() - clockInTime) / 1000);
        const remaining = Math.max(0, durationSec - elapsed);
        setSecondsRemaining(remaining);
        if (remaining <= 0) {
          setStatus('end_alarm');
        } else {
          setStatus('active');
        }
      } else {
        setSession(null);
        // Check if shift start time has already passed
        if (now.getTime() >= start) {
          setStatus('start_alarm');
        } else {
          setStatus('waiting');
        }
      }
    } catch {
      setSession(null);
      setStatus('waiting');
    }
  }, [db, getTodayWorkShifts, clearAllIntervals]);

  // Check if shift start time has arrived (when in 'waiting' status)
  useEffect(() => {
    if (status !== 'waiting' || !shift) return;

    const checkStartTime = () => {
      const startTime = new Date(shift.startAt).getTime();
      if (Date.now() >= startTime) {
        setStatus('start_alarm');
      }
    };

    checkStartTime(); // Check immediately
    startCheckRef.current = setInterval(checkStartTime, 1000);

    return () => {
      if (startCheckRef.current) {
        clearInterval(startCheckRef.current);
        startCheckRef.current = null;
      }
    };
  }, [status, shift]);

  // Play alarm when start_alarm or end_alarm
  useEffect(() => {
    if (status === 'start_alarm' || status === 'end_alarm') {
      playAlarm(alarmSoundRef.current, alarmVolumeRef.current);
      Vibration.vibrate([0, 1000, 500, 1000]);
      const vibInterval = setInterval(() => {
        Vibration.vibrate([0, 1000, 500, 1000]);
      }, 4000);

      return () => {
        clearInterval(vibInterval);
      };
    } else {
      // Stop any playing alarm when leaving alarm states
      stopAlarm();
      Vibration.cancel();
    }
  }, [status]);

  // Countdown interval when active
  useEffect(() => {
    if (status !== 'active') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          // Shift ended
          setStatus('end_alarm');
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status]);

  // Clock in: stop start alarm, begin countdown
  const clockIn = useCallback(() => {
    if (!shift) return;

    stopAlarm();
    Vibration.cancel();

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

    // If currently paused, don't reset the remaining time
    if (status !== 'paused') {
      setSecondsRemaining(totalShiftSeconds);
    }

    setStatus('active');
  }, [db, shift, status, totalShiftSeconds]);

  // Pause: freeze countdown
  const pause = useCallback(() => {
    if (status !== 'active') return;
    setStatus('paused');
  }, [status]);

  // Resume: continue countdown from where paused
  const resume = useCallback(() => {
    if (status !== 'paused') return;
    setStatus('active');
  }, [status]);

  // Clock out / Stop: stop end alarm, mark complete
  const clockOut = useCallback(() => {
    stopAlarm();
    Vibration.cancel();

    if (session) {
      const now = new Date().toISOString();
      db.runSync(
        `UPDATE sessions SET clockOutAt = ? WHERE id = ?`,
        [now, session.id]
      );
    }

    setSession(null);
    setStatus('completed');
  }, [db, session]);

  // Reset: go back to initial state for this shift
  const reset = useCallback(() => {
    stopAlarm();
    Vibration.cancel();

    if (session && !session.clockOutAt) {
      const now = new Date().toISOString();
      db.runSync(
        `UPDATE sessions SET clockOutAt = ? WHERE id = ?`,
        [now, session.id]
      );
    }

    setSession(null);
    setSecondsRemaining(totalShiftSeconds);

    if (shift) {
      const now = Date.now();
      const startTime = new Date(shift.startAt).getTime();
      if (now >= startTime) {
        setStatus('start_alarm');
      } else {
        setStatus('waiting');
      }
    } else {
      setStatus('idle');
    }
  }, [db, session, shift, totalShiftSeconds]);

  // Initial load
  useEffect(() => {
    loadShift();
  }, [loadShift]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllIntervals();
      stopAlarm();
      Vibration.cancel();
    };
  }, [clearAllIntervals]);

  return {
    shift,
    session,
    secondsRemaining,
    totalShiftSeconds,
    status,
    clockIn,
    pause,
    resume,
    clockOut,
    reset,
    refresh: loadShift,
  };
}
