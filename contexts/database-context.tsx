import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { type SQLiteDatabase } from 'expo-sqlite';
import { openDatabase } from '@/lib/database';

const DatabaseContext = createContext<SQLiteDatabase | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const db = useMemo(() => openDatabase(), []);

  return (
    <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>
  );
}

export function useDatabase(): SQLiteDatabase {
  const db = useContext(DatabaseContext);
  if (!db) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return db;
}
