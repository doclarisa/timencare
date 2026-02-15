import { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView, RefreshControl, Image, Pressable, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimer } from '@/hooks/use-timer';
import { useEvents } from '@/hooks/use-events';
import { useNotifications } from '@/hooks/use-notifications';
import { CountdownDisplay } from '@/components/timer/countdown-display';
import { SessionControls } from '@/components/timer/session-controls';
import { ShiftInfo } from '@/components/timer/shift-info';
import { LiveClock } from '@/components/live-clock';
import { ClientProfileModal } from '@/components/client-profile-modal';
import { EventForm, type EventFormData } from '@/components/calendar/event-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { type Client } from '@/lib/database';

export default function TimerScreen() {
  const {
    shift,
    secondsRemaining,
    status,
    clockIn,
    clockOut,
    acknowledge,
    refresh,
  } = useTimer();
  const { createEvent } = useEvents();
  const { scheduleShiftReminders, cancelScheduled } = useNotifications();
  const bgColor = useThemeColor({}, 'background');
  const [refreshing, setRefreshing] = useState(false);
  const [profileClient, setProfileClient] = useState<Client | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Calculate total shift duration in seconds
  const totalShiftSeconds = useMemo(() => {
    if (!shift) return 0;
    const start = new Date(shift.startAt).getTime();
    const end = new Date(shift.endAt).getTime();
    return Math.floor((end - start) / 1000);
  }, [shift?.startAt, shift?.endAt]);

  // Schedule notifications when shift loads
  useEffect(() => {
    if (shift) {
      scheduleShiftReminders(shift);
    }
    return () => {
      cancelScheduled();
    };
  }, [shift?.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleSaveEvent = async (data: EventFormData) => {
    const newEvent = createEvent(data);
    setShowAddForm(false);
    refresh(); // Reload timer to pick up new shift
    // Schedule notifications for the new event
    if (newEvent) {
      await scheduleShiftReminders(newEvent);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/LOGOwebsite1.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <LiveClock />
        </View>

        {!shift ? (
          /* Empty state */
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyIcon}>{'\uD83D\uDCC5'}</ThemedText>
            <ThemedText style={styles.emptyTitle}>No Shifts Today</ThemedText>
            <ThemedText style={styles.emptyBody}>
              Tap Add to create a shift
            </ThemedText>
          </ThemedView>
        ) : (
          /* Shift active layout */
          <View style={styles.timerContent}>
            {/* Card 1: Current Shift */}
            <ShiftInfo shift={shift} status={status} onClientPress={setProfileClient} />

            {/* Card 2: Time Remaining + Controls */}
            <View style={styles.timeCard}>
              <CountdownDisplay
                secondsRemaining={secondsRemaining}
                status={status}
                totalShiftSeconds={totalShiftSeconds}
              />

              <SessionControls
                status={status}
                onClockIn={clockIn}
                onClockOut={clockOut}
                onAcknowledge={acknowledge}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Client Profile Modal */}
      {profileClient && (
        <ClientProfileModal
          visible={!!profileClient}
          client={profileClient}
          onClose={() => setProfileClient(null)}
        />
      )}

      {/* Add Event Form Modal — opens directly */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: bgColor }]}>
          <ThemedText style={styles.modalTitle}>New Event</ThemedText>
          <EventForm
            initialDate={today}
            onSave={handleSaveEvent}
            onCancel={() => setShowAddForm(false)}
          />
        </SafeAreaView>
      </Modal>

      {/* Floating Add Button — opens form directly */}
      <Pressable
        style={styles.fab}
        onPress={() => setShowAddForm(true)}
      >
        <ThemedText style={styles.fabPlus}>+</ThemedText>
        <ThemedText style={styles.fabLabel}>Add</ThemedText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 160,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logo: {
    width: 160,
    height: 44,
  },
  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 120,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptyBody: {
    fontSize: 16,
    color: '#6B7280',
  },
  // Timer content
  timerContent: {
    gap: 20,
    paddingTop: 20,
  },
  // Time Remaining card
  timeCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  // Modal
  modalSafe: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  fabPlus: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
  },
  fabLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: 'white',
  },
});
