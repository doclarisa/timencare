import { type SQLiteDatabase } from 'expo-sqlite';
import { randomUUID } from 'expo-crypto';

/**
 * Seeds the database with sample clients and events.
 * Clients are seeded once. Events are refreshed daily so
 * the timer screen always has something to show.
 */
export function seedSampleData(db: SQLiteDatabase): void {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStr = today.toISOString().split('T')[0];

  // --- Seed clients (once) ---
  const existingClients = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM clients'
  );

  if (!existingClients || existingClients.count === 0) {
    db.runSync(
      `INSERT INTO clients (id, name, colorHex, phone, address, notes, medications, emergencyContact, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        'Sarah Johnson',
        '#3B82F6',
        '(555) 123-4567',
        'West Loop',
        'Prefers morning shifts. Allergic to penicillin.',
        'Lisinopril 10mg - Morning\nMetformin 500mg - With meals',
        'John Johnson (Son) - (555) 987-6543',
        now.toISOString(),
        now.toISOString(),
      ]
    );

    db.runSync(
      `INSERT INTO clients (id, name, colorHex, phone, address, notes, medications, emergencyContact, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        'Michael Chen',
        '#10B981',
        '(555) 234-5678',
        'Lincoln Park',
        'Wheelchair accessible. Enjoys classical music.',
        'Aspirin 81mg - Evening\nVitamin D - Daily',
        'Lisa Chen (Daughter) - (555) 876-5432',
        now.toISOString(),
        now.toISOString(),
      ]
    );

    console.log('Sample clients seeded');
  }

  // --- Ensure today has events ---
  const todayEvents = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM events WHERE date(startAt) = ?`,
    [todayStr]
  );

  if (todayEvents && todayEvents.count > 0) {
    // Already have events for today
    return;
  }

  // Create sample shifts for today
  const event1Start = new Date(today);
  event1Start.setHours(14, 0, 0, 0);
  const event1End = new Date(today);
  event1End.setHours(16, 0, 0, 0);

  db.runSync(
    `INSERT INTO events (id, clientName, startAt, endAt, type, notes, colorHex, notifyEnabled, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      'Sarah Johnson',
      event1Start.toISOString(),
      event1End.toISOString(),
      'WORK',
      'Medication reminder + meal prep.',
      '#3B82F6',
      1,
      now.toISOString(),
      now.toISOString(),
    ]
  );

  const event2Start = new Date(today);
  event2Start.setHours(17, 0, 0, 0);
  const event2End = new Date(today);
  event2End.setHours(19, 0, 0, 0);

  db.runSync(
    `INSERT INTO events (id, clientName, startAt, endAt, type, notes, colorHex, notifyEnabled, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      'Michael Chen',
      event2Start.toISOString(),
      event2End.toISOString(),
      'WORK',
      'Physical therapy exercises + dinner.',
      '#10B981',
      1,
      now.toISOString(),
      now.toISOString(),
    ]
  );

  // Tomorrow event
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const event3Start = new Date(tomorrow);
  event3Start.setHours(10, 0, 0, 0);
  const event3End = new Date(tomorrow);
  event3End.setHours(12, 0, 0, 0);

  db.runSync(
    `INSERT INTO events (id, clientName, startAt, endAt, type, notes, colorHex, notifyEnabled, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      'Sarah Johnson',
      event3Start.toISOString(),
      event3End.toISOString(),
      'WORK',
      '',
      '#3B82F6',
      1,
      now.toISOString(),
      now.toISOString(),
    ]
  );

  console.log('Sample events seeded for today');
}
