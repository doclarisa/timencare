import { useEffect } from 'react';
import { AsyncStorage } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('events.db');

const useOfflineSync = () => {
  useEffect(() => {
    // Create a table for events if it doesn't exist
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, date TEXT, startTime TEXT, endTime TEXT);'
      );
    });

    // Load events from local storage
    const loadEvents = async () => {
      try {
        const storedEvents = await AsyncStorage.getItem('events');
        if (storedEvents) {
          const events = JSON.parse(storedEvents);
          events.forEach(event => {
            db.transaction(tx => {
              tx.executeSql(
                'INSERT INTO events (title, date, startTime, endTime) VALUES (?, ?, ?, ?);',
                [event.title, event.date, event.startTime, event.endTime]
              );
            });
          });
        }
      } catch (error) {
        console.error('Error loading events from storage:', error);
      }
    };

    loadEvents();
  }, []);

  const saveEvent = async (event) => {
    try {
      await AsyncStorage.setItem('events', JSON.stringify(event));
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO events (title, date, startTime, endTime) VALUES (?, ?, ?, ?);',
          [event.title, event.date, event.startTime, event.endTime]
        );
      });
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const getEvents = async () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM events;',
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      });
    });
  };

  return { saveEvent, getEvents };
};

export default useOfflineSync;