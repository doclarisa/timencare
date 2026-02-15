import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, RefreshControl, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTimer } from '@/hooks/use-timer';
import { useNotifications } from '@/hooks/use-notifications';
import { CountdownDisplay } from '@/components/timer/countdown-display';
import { SessionControls} from '@/components/timer/session-controls';
import { ShiftInfo } from '@/components/timer/shift-info';
import { LiveClock } from '@/components/live-clock';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

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
        <ThemedView style={styles.header}>
          <Image
            source={require('@/assets/images/LOGOwebsite1.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText style={styles.tagline}>Shift Timer & Schedule</ThemedText>
        </ThemedView>

        <ThemedView style={styles.clockContainer}>
          <LiveClock />
        </ThemedView>

        {!shift ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyIcon}>
              {'\u23F0'}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              No Shift Scheduled
            </ThemedText>
            <ThemedText style={styles.emptyBody}>
              Add a WORK event for today in the Schedule tab to start tracking time.
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.timerContent}>
            <ShiftInfo shift={shift} status={status} />
            {session && (
              <CountdownDisplay
                secondsRemaining={secondsRemaining}
                status={status}
              />
            )}
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
          </ThemedView>
        )}
      </ScrollView>

      {/* Floating Add Event Button */}
      <Pressable
        style={styles.floatingButton}
        onPress={() => router.push('/calendar')}
      >
        <IconSymbol name="plus.circle.fill" size={48} color="white" />
        <ThemedText style={styles.floatingButtonText}>Add Event</ThemedText>
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
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 60,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  clockContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyBody: {
    textAlign: 'center',
    opacity: 0.6,
    fontSize: 16,
    lineHeight: 22,
  },
  timerContent: {
    flex: 1,
    gap: 24,
    paddingTop: 8,
  },
  clockedInAt: {
    textAlign: 'center',
    opacity: 0.5,
    fontSize: 14,
  },
  floatingButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
});
