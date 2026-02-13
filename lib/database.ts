import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import { randomUUID } from 'expo-crypto';

// --- Types ---

export type EventType = 'WORK' | 'MEDS' | 'OTHER';

export interface CalendarEvent {
  id: string;
  clientName: string;
  startAt: string;
  endAt: string;
  type: EventType;
  notes: string | null;
  colorHex: string;
  notifyEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  eventId: string;
  clockInAt: string;
  clockOutAt: string | null;
  createdAt: string;
}

// --- Database Setup ---

function runMigrations(db: SQLiteDatabase): void {
  const result = db.getFirstSync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        clientName TEXT NOT NULL,
        startAt TEXT NOT NULL,
        endAt TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('WORK','MEDS','OTHER')),
        notes TEXT,
        colorHex TEXT NOT NULL DEFAULT '#4A90D9',
        notifyEnabled INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        eventId TEXT NOT NULL REFERENCES events(id),
        clockInAt TEXT NOT NULL,
        clockOutAt TEXT,
        createdAt TEXT NOT NULL
      );

      PRAGMA user_version = 1;
    `);
  }
}

export function openDatabase(): SQLiteDatabase {
  const db = openDatabaseSync('timencare.db');
  runMigrations(db);
  return db;
}

export function generateId(): string {
  return randomUUID();
}
