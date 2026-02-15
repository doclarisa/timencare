import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { CalendarView } from '../components/CalendarView';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { Event } from '../types';

const CalendarScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const { fetchEvents } = useOfflineSync();

  useEffect(() => {
    const loadEvents = async () => {
      const storedEvents = await fetchEvents();
      setEvents(storedEvents);
    };

    loadEvents();
  }, [fetchEvents]);

  const handleAddEvent = () => {
    // Logic to add a new event
  };

  const handleEditEvent = (eventId: string) => {
    // Logic to edit an existing event
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar</Text>
      <CalendarView events={events} onEditEvent={handleEditEvent} />
      <Button title="Add Event" onPress={handleAddEvent} />
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text>{item.title}</Text>
            <Text>{item.date}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  eventCard: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
});

export default CalendarScreen;