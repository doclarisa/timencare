import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimer } from '@/hooks/use-timer';
import { useNotifications } from '@/hooks/use-notifications';
import { CountdownDisplay } from '@/components/timer/countdown-display';
import { SessionControls } from '@/components/timer/session-controls';
import { ShiftInfo } from '@/components/timer/shift-info';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function TimerScreen() {
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
        <ThemedText type="title" style={styles.header}>
          Timer
        </ThemedText>

        {!shift ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyIcon}>
              {'\u23F0'}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              No Shift Scheduled
            </ThemedText>
            <ThemedText style={styles.emptyBody}>
              Add a WORK event for today in the Calendar tab to start tracking time.
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
    paddingBottom: 24,
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
});
