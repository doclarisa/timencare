import { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView, RefreshControl, Image, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTimer } from '@/hooks/use-timer';
import { useNotifications } from '@/hooks/use-notifications';
import { CountdownDisplay } from '@/components/timer/countdown-display';
import { SessionControls } from '@/components/timer/session-controls';
import { ShiftInfo } from '@/components/timer/shift-info';
import { LiveClock } from '@/components/live-clock';
import { ClientProfileModal } from '@/components/client-profile-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { type Client } from '@/lib/database';

export default function TimerScreen() {
  const router = useRouter();
  const {
    shift,
    session,
    secondsRemaining,
    status,
    clockIn,
    clockOut,
    acknowledge,
    refresh,
  } = useTimer();
  const { scheduleShiftReminders, cancelScheduled } = useNotifications();
  const bgColor = useThemeColor({}, 'background');
  const [refreshing, setRefreshing] = useState(false);
  const [profileClient, setProfileClient] = useState<Client | null>(null);

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
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyIcon}>{'\uD83D\uDCC5'}</ThemedText>
            <ThemedText style={styles.emptyTitle}>No Shifts Today</ThemedText>
            <ThemedText style={styles.emptyBody}>
              Add a shift to get started
            </ThemedText>
            <Pressable
              style={styles.emptyButton}
              onPress={() => {
                const today = new Date().toISOString().split('T')[0];
                router.push(`/day/${today}`);
              }}
            >
              <ThemedText style={styles.emptyButtonText}>+ Add First Shift</ThemedText>
            </Pressable>
          </ThemedView>
        ) : (
          <View style={styles.timerContent}>
            <ShiftInfo shift={shift} status={status} onClientPress={setProfileClient} />

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

            {session && (
              <ThemedText style={styles.clockedInAt}>
                Clocked in at {new Date(session.clockInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </ThemedText>
            )}
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

      {/* Floating Add Button */}
      <Pressable
        style={styles.fab}
        onPress={() => {
          const today = new Date().toISOString().split('T')[0];
          router.push(`/day/${today}`);
        }}
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  logo: {
    width: 160,
    height: 44,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyBody: {
    textAlign: 'center',
    fontSize: 15,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  // Timer content
  timerContent: {
    gap: 16,
    paddingTop: 16,
  },
  clockedInAt: {
    textAlign: 'center',
    fontSize: 13,
    color: '#9CA3AF',
  },
  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 6,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  fabPlus: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  fabLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});
