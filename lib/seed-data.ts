import { type SQLiteDatabase } from 'expo-sqlite';
import { randomUUID } from 'expo-crypto';

/**
 * Seeds the database with sample shifts for testing
 * Only runs if the database is empty
 */
export function seedSampleData(db: SQLiteDatabase): void {
  // Check if we already have events
  const existing = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM events'
  );

  if (existing && existing.count > 0) {
    // Already have data, don't seed
    return;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Sample shift 1: Today, 9 AM - 5 PM
  const shift1Start = new Date(today);
  shift1Start.setHours(9, 0, 0, 0);
  const shift1End = new Date(today);
  shift1End.setHours(17, 0, 0, 0);

  db.runSync(
    `INSERT INTO events (id, clientName, startAt, endAt, type, notes, colorHex, notifyEnabled, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      'Sarah Johnson',
      shift1Start.toISOString(),
      shift1End.toISOString(),
      'WORK',
      'Regular shift - assisted living facility',
      '#4A90D9', // Blue
      1,
      now.toISOString(),
      now.toISOString(),
    ]
  );

  // Sample shift 2: Tomorrow, 10 AM - 6 PM
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const shift2Start = new Date(tomorrow);
  shift2Start.setHours(10, 0, 0, 0);
  const shift2End = new Date(tomorrow);
  shift2End.setHours(18, 0, 0, 0);

  db.runSync(
    `INSERT INTO events (id, clientName, startAt, endAt, type, notes, colorHex, notifyEnabled, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      'Robert Martinez',
      shift2Start.toISOString(),
      shift2End.toISOString(),
      'WORK',
      'Home care visit - medication management',
      '#7B68EE', // Purple
      1,
      now.toISOString(),
      now.toISOString(),
    ]
  );

  // Sample medication reminder: Today, 2 PM
  const medsTime = new Date(today);
  medsTime.setHours(14, 0, 0, 0);
  const medsEndTime = new Date(medsTime);
  medsEndTime.setMinutes(15);

  db.runSync(
    `INSERT INTO events (id, clientName, startAt, endAt, type, notes, colorHex, notifyEnabled, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      'Mary Williams - Insulin',
      medsTime.toISOString(),
      medsEndTime.toISOString(),
      'MEDS',
      'Afternoon insulin dose',
      '#E8833A', // Orange
      1,
      now.toISOString(),
      now.toISOString(),
    ]
  );

  console.log('✅ Sample data seeded successfully');
}
