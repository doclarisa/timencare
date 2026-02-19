import { useState, useCallback } from 'react';
import { StyleSheet, View, Pressable, FlatList, Modal, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventCard } from '@/components/calendar/event-card';
import { EventForm, type EventFormData } from '@/components/calendar/event-form';
import { useEvents } from '@/hooks/use-events';
import { useNotifications } from '@/hooks/use-notifications';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { type CalendarEvent } from '@/lib/database';
import { addShiftToPhoneCalendar } from '@/lib/calendar-integration';

export default function DayViewScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const {
    getEventsForDate,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();
  const { scheduleMedsReminder } = useNotifications();
  const tint = useThemeColor({}, 'tint');
  const bgColor = useThemeColor({}, 'background');

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const loadEvents = useCallback(() => {
    if (date) {
      setEvents(getEventsForDate(date));
    }
  }, [date, getEventsForDate]);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const formatDateTitle = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSave = async (data: EventFormData) => {
    let savedEvent: CalendarEvent | null = null;
    if (editingEvent) {
      updateEvent({ id: editingEvent.id, ...data });
    } else {
      savedEvent = createEvent(data);
      // Schedule meds reminder if applicable
      if (data.type === 'MEDS' && data.notifyEnabled && savedEvent) {
        await scheduleMedsReminder(savedEvent);
      }
    }
    setShowForm(false);
    setEditingEvent(null);
    loadEvents();

    // Offer to add to phone calendar for new events
    if (savedEvent) {
      Alert.alert(
        'Add to Phone Calendar?',
        'Add this event to your phone calendar with a 15-minute reminder?',
        [
          { text: 'No thanks', style: 'cancel' },
          {
            text: 'Add to Calendar',
            onPress: () => addShiftToPhoneCalendar(savedEvent!),
          },
        ]
      );
    }
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteEvent(id);
    loadEvents();
  };

  const handleAdd = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: date ? formatDateTitle(date) : 'Day View',
        }}
      />
      <ThemedView style={styles.container}>
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyIcon}>{'\uD83D\uDCC5'}</ThemedText>
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              No Events
            </ThemedText>
            <ThemedText style={styles.emptyBody}>
              Tap the + button to add an event for this day.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                onPress={() => handleEdit(item)}
                onDelete={() => handleDelete(item.id)}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}

        {/* FAB */}
        <Pressable
          style={[styles.fab, { backgroundColor: tint }]}
          onPress={handleAdd}
        >
          <ThemedText style={styles.fabText} lightColor="#fff" darkColor="#000">
            +
          </ThemedText>
        </Pressable>

        {/* Event Form Modal */}
        <Modal
          visible={showForm}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalSafe, { backgroundColor: bgColor }]}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              {editingEvent ? 'Edit Event' : 'New Event'}
            </ThemedText>
            <EventForm
              initialDate={date || new Date().toISOString().split('T')[0]}
              existingEvent={editingEvent}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingEvent(null);
              }}
            />
          </SafeAreaView>
        </Modal>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyBody: {
    textAlign: 'center',
    opacity: 0.6,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 34,
  },
  modalSafe: {
    flex: 1,
  },
  modalTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
});
