import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set up Android notification channel (required for Android 8+)
async function ensureChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('shift-alerts', {
      name: 'Shift Alerts',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 500, 250, 500],
      enableVibrate: true,
      enableLights: true,
    });
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  await ensureChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getNotificationPermissionStatus(): Promise<string> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function scheduleNotification(
  title: string,
  body: string,
  triggerDate: Date,
  identifier?: string
): Promise<string> {
  await ensureChannel();

  const trigger: Notifications.DateTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: triggerDate.getTime(), // use timestamp number, not Date object
    ...(Platform.OS === 'android' ? { channelId: 'shift-alerts' } : {}),
  };

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger,
    ...(identifier ? { identifier } : {}),
  });

  console.log(`[Notification] Scheduled "${title}" at ${triggerDate.toLocaleTimeString()} → id: ${id}`);
  return id;
}

export async function scheduleRepeatingBuzz(
  title: string,
  body: string,
  startDate: Date,
  intervalSeconds: number = 30,
  maxCount: number = 10
): Promise<string[]> {
  await ensureChannel();
  const ids: string[] = [];
  const now = Date.now();

  for (let i = 1; i <= maxCount; i++) {
    const triggerTime = startDate.getTime() + i * intervalSeconds * 1000;
    if (triggerTime <= now) continue;

    const trigger: Notifications.DateTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerTime,
      ...(Platform.OS === 'android' ? { channelId: 'shift-alerts' } : {}),
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger,
    });
    ids.push(id);
  }

  console.log(`[Notification] Scheduled ${ids.length} repeating buzzes starting at ${startDate.toLocaleTimeString()}`);
  return ids;
}

/** Schedule a test notification N seconds from now — for verifying notifications work */
export async function scheduleTestNotification(delaySec: number = 10): Promise<string> {
  await ensureChannel();

  const triggerDate = new Date(Date.now() + delaySec * 1000);

  const trigger: Notifications.DateTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: triggerDate.getTime(),
    ...(Platform.OS === 'android' ? { channelId: 'shift-alerts' } : {}),
  };

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test Notification',
      body: `This fired ${delaySec}s after scheduling. Notifications are working!`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger,
  });

  console.log(`[Notification] TEST scheduled for ${triggerDate.toLocaleTimeString()} → id: ${id}`);
  return id;
}

/** Get all currently scheduled notifications (for debugging) */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function cancelNotifications(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id))
  );
}
