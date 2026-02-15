import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, RefreshControl, Image, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTimer } from '@/hooks/use-timer';
import { useNotifications } from '@/hooks/use-notifications';
import { CountdownDisplay } from '@/components/timer/countdown-display';
import { SessionControls } from '@/components/timer/session-controls';
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
            <ThemedText style={styles.emptyIcon}>{'\uD83D\uDCC5'}</ThemedText>
            <ThemedText style={styles.emptyTitle}>No Shifts Today</ThemedText>
            <ThemedText style={styles.emptyBody}>
              Add a shift to get started
            </ThemedText>
            <Pressable
              style={styles.emptyButton}
              onPress={() => router.push('/calendar')}
            >
              <ThemedText style={styles.emptyButtonText}>+ Add First Shift</ThemedText>
            </Pressable>
          </ThemedView>
        ) : (
          <ThemedView style={styles.timerContent}>
            <ShiftInfo shift={shift} status={status} />

            <CountdownDisplay
              secondsRemaining={secondsRemaining}
              status={status}
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

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Pressable
                style={styles.quickActionBlue}
                onPress={() => router.push('/calendar')}
              >
                <IconSymbol name="calendar.badge.clock" size={24} color="white" />
                <ThemedText style={styles.quickActionText}>Full Schedule</ThemedText>
              </Pressable>
            </View>
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
    paddingBottom: 140,
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
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyBody: {
    textAlign: 'center',
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 28,
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  // Timer content
  timerContent: {
    flex: 1,
    gap: 20,
    paddingTop: 8,
  },
  clockedInAt: {
    textAlign: 'center',
    opacity: 0.5,
    fontSize: 14,
  },
  // Quick actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  quickActionBlue: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  // Floating button
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
