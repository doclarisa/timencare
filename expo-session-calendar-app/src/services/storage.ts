import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('events.db');

export const init = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY NOT NULL, title TEXT NOT NULL, date TEXT NOT NULL);'
    );
  });
};

export const insertEvent = (title: string, date: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO events (title, date) VALUES (?, ?);',
        [title, date],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const fetchEvents = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM events;',
        [],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateEvent = (id: number, title: string, date: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE events SET title = ?, date = ? WHERE id = ?;',
        [title, date, id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteEvent = (id: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM events WHERE id = ?;',
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};