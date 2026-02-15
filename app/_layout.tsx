import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { DatabaseProvider, useDatabase } from '@/contexts/database-context';
import { requestNotificationPermissions, scheduleNotification, scheduleRepeatingBuzz } from '@/lib/notifications';
import { type CalendarEvent } from '@/lib/database';

// Configure notification handler so notifications show when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const colorScheme = useColorScheme();

  const db = useDatabase();

  // Request notification permissions and schedule today's shift notifications on app start
  useEffect(() => {
    requestNotificationPermissions().then(async (granted) => {
      if (!granted) return;

      try {
        const today = new Date().toISOString().split('T')[0];
        const shifts = db.getAllSync<CalendarEvent>(
          `SELECT * FROM events WHERE date(startAt) = ? AND type = 'WORK' ORDER BY startAt ASC`,
          [today]
        );

        const now = new Date();
        for (const shift of shifts) {
          const startTime = new Date(shift.startAt);
          const endTime = new Date(shift.endAt);

          // 5 min before start
          const fiveMinBefore = new Date(startTime.getTime() - 5 * 60 * 1000);
          if (fiveMinBefore > now) {
            await scheduleNotification(
              'Shift Starting Soon',
              `${shift.clientName} shift starts in 5 minutes`,
              fiveMinBefore
            );
          }

          // At exact start time
          if (startTime > now) {
            await scheduleNotification(
              'Shift Started!',
              `${shift.clientName} shift is starting now — open app and tap Start`,
              startTime
            );
          }

          // At exact end time
          if (endTime > now) {
            await scheduleNotification(
              'Shift Ended!',
              `${shift.clientName} shift has ended — open app to stop alarm`,
              endTime
            );
          }

          // Repeating reminders after end
          if (endTime > now) {
            await scheduleRepeatingBuzz(
              'Clock Out Reminder',
              `Don't forget to clock out of ${shift.clientName}`,
              endTime,
              30,
              10
            );
          }
        }
      } catch (err) {
        console.warn('Failed to schedule startup notifications:', err);
      }
    });
  }, [db]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen
            name="pin"
            options={{ gestureEnabled: false, animation: 'fade' }}
          />
        ) : (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="settings"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Settings',
              }}
            />
            <Stack.Screen
              name="day/[date]"
              options={{
                headerShown: true,
                title: 'Day View',
              }}
            />
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <RootLayoutNav />
      </DatabaseProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
