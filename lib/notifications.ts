import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

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
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: 'date' as const, date: triggerDate },
    ...(identifier ? { identifier } : {}),
  });
}

export async function scheduleRepeatingBuzz(
  title: string,
  body: string,
  startDate: Date,
  intervalSeconds: number = 15,
  maxCount: number = 60
): Promise<string[]> {
  const ids: string[] = [];
  const now = Date.now();

  for (let i = 0; i < maxCount; i++) {
    const triggerTime = startDate.getTime() + i * intervalSeconds * 1000;
    if (triggerTime <= now) continue;

    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { type: 'date' as const, date: new Date(triggerTime) },
    });
    ids.push(id);
  }

  return ids;
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function cancelNotifications(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id))
  );
}
