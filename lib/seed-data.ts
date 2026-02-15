import { type SQLiteDatabase } from 'expo-sqlite';
import { randomUUID } from 'expo-crypto';

/**
 * Seeds the database with sample events and clients for testing.
 * Only runs if the database is empty.
 */
export function seedSampleData(db: SQLiteDatabase): void {
  // Check if we already have events
  const existingEvents = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM events'
  );

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Seed clients if table is empty
  const existingClients = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM clients'
  );

  if (!existingClients || existingClients.count === 0) {
    // Client 1: Sarah Johnson
    db.runSync(
      `INSERT INTO clients (id, name, colorHex, phone, address, notes, medications, emergencyContact, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        'Sarah Johnson',
        '#3B82F6',
        '(555) 123-4567',
        '123 Oak Street, Apt 4B',
        'Prefers morning shifts. Allergic to penicillin.',
        'Lisinopril 10mg - Morning\nMetformin 500mg - With meals',
        'John Johnson (Son) - (555) 987-6543',
        now.toISOString(),
        now.toISOString(),
      ]
    );

    // Client 2: Michael Chen
    db.runSync(
      `INSERT INTO clients (id, name, colorHex, phone, address, notes, medications, emergencyContact, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        'Michael Chen',
        '#10B981',
        '(555) 234-5678',
        '456 Maple Avenue',
        'Wheelchair accessible. Enjoys classical music.',
        'Aspirin 81mg - Evening\nVitamin D - Daily',
        'Lisa Chen (Daughter) - (555) 876-5432',
        now.toISOString(),
        now.toISOString(),
      ]
    );

    console.log('✅ Sample clients seeded successfully');
  }

  if (existingEvents && existingEvents.count > 0) {
    // Already have event data, don't seed
    return;
  }

  // Event 1: Sarah Johnson - Today, 2 PM - 4 PM
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
      'Reminder: Bring medication logs',
      '#3B82F6',
      1,
      now.toISOString(),
      now.toISOString(),
    ]
  );

  // Event 2: Michael Chen - Today, 5 PM - 7 PM
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
      '',
      '#10B981',
      1,
      now.toISOString(),
      now.toISOString(),
    ]
  );

  // Event 3: Sarah Johnson - Tomorrow, 10 AM - 12 PM
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

  console.log('✅ Sample events seeded successfully');
}
