import { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MonthGrid } from '@/components/calendar/month-grid';
import { useEvents } from '@/hooks/use-events';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { type CalendarEvent } from '@/lib/database';

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatShiftDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function CalendarScreen() {
  const router = useRouter();
  const { getEventsForMonth, deleteEvent } = useEvents();
  const bgColor = useThemeColor({}, 'background');

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const loadEvents = useCallback(() => {
    const result = getEventsForMonth(year, month);
    setEvents(result);
  }, [year, month, getEventsForMonth]);

  // Reload events when screen gains focus or month changes
  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    router.push(`/day/${dateStr}`);
  };

  const handleChangeMonth = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
    setSelectedDate(null);
  };

  const handleDeleteEvent = (eventId: string, clientName: string) => {
    Alert.alert(
      'Delete Shift',
      `Delete shift for ${clientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteEvent(eventId);
            loadEvents();
          },
        },
      ]
    );
  };

  const eventType = (type: string) => {
    switch (type) {
      case 'WORK': return 'Work';
      case 'MEDS': return 'Meds';
      default: return 'Other';
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Schedule heading */}
        <ThemedText style={styles.heading}>SCHEDULE</ThemedText>

        {/* Calendar card */}
        <ThemedView style={styles.calendarCard}>
          <MonthGrid
            year={year}
            month={month}
            events={events}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onChangeMonth={handleChangeMonth}
          />
        </ThemedView>

        {/* All Shifts List */}
        <ThemedView style={styles.shiftsCard}>
          <ThemedText style={styles.shiftsTitle}>
            {'\uD83D\uDCCB'} All Shifts
          </ThemedText>

          {events.length === 0 ? (
            <ThemedView style={styles.noShifts}>
              <ThemedText style={styles.noShiftsText}>
                No shifts this month. Tap a date to add one.
              </ThemedText>
            </ThemedView>
          ) : (
            events.map((event) => (
              <Pressable
                key={event.id}
                style={[styles.shiftCard, { borderLeftColor: event.colorHex }]}
                onPress={() => {
                  const dateStr = event.startAt.split('T')[0];
                  router.push(`/day/${dateStr}`);
                }}
              >
                <View style={styles.shiftCardHeader}>
                  <View style={styles.shiftCardLeft}>
                    <ThemedText style={styles.shiftCardName}>
                      {event.clientName}
                    </ThemedText>
                    <ThemedText style={styles.shiftCardDate}>
                      {formatShiftDate(event.startAt)}
                    </ThemedText>
                  </View>

                  <View style={styles.shiftCardActions}>
                    <Pressable
                      style={styles.shiftActionButton}
                      onPress={() => {
                        const dateStr = event.startAt.split('T')[0];
                        router.push(`/day/${dateStr}`);
                      }}
                    >
                      <IconSymbol name="chevron.right" size={20} color="#4B5563" />
                    </Pressable>

                    <Pressable
                      style={styles.shiftActionButton}
                      onPress={() => handleDeleteEvent(event.id, event.clientName)}
                    >
                      <ThemedText style={styles.deleteIcon}>{'\uD83D\uDDD1\uFE0F'}</ThemedText>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.shiftCardInfo}>
                  <View style={styles.shiftTimeBadge}>
                    <IconSymbol name="timer" size={14} color="#6B7280" />
                    <ThemedText style={[styles.shiftTimeText, { color: event.colorHex }]}>
                      {formatTime(event.startAt)} - {formatTime(event.endAt)}
                    </ThemedText>
                  </View>

                  <View style={styles.shiftTypeBadge}>
                    <ThemedText style={styles.shiftTypeText}>
                      {eventType(event.type)}
                    </ThemedText>
                  </View>
                </View>

                {event.notes ? (
                  <ThemedText style={styles.shiftNotes}>
                    {'\uD83D\uDCCB'} {event.notes}
                  </ThemedText>
                ) : null}
              </Pressable>
            ))
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heading: {
    fontSize: 42,
    fontWeight: '900',
    color: '#3B82F6',
    textAlign: 'center',
    paddingTop: 16,
    paddingBottom: 12,
  },
  // Calendar card
  calendarCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
    paddingBottom: 8,
  },
  // Shifts list
  shiftsCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  shiftsTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  noShifts: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noShiftsText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Individual shift card
  shiftCard: {
    borderLeftWidth: 4,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  shiftCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  shiftCardLeft: {
    flex: 1,
  },
  shiftCardName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  shiftCardDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  shiftCardActions: {
    flexDirection: 'row',
    gap: 4,
  },
  shiftActionButton: {
    padding: 8,
    borderRadius: 8,
  },
  deleteIcon: {
    fontSize: 18,
  },
  shiftCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  shiftTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  shiftTimeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  shiftTypeBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  shiftTypeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  shiftNotes: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
});
