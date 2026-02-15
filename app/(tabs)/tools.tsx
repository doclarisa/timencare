import { useState, useEffect } from 'react';
import { StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getNotificationPermissionStatus, requestNotificationPermissions } from '@/lib/notifications';
import { StatusColors } from '@/constants/theme';

export default function ToolsScreen() {
  const router = useRouter();
  const { lock } = useAuth();
  const bgColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');

  const [notifStatus, setNotifStatus] = useState('unknown');

  useEffect(() => {
    getNotificationPermissionStatus().then(setNotifStatus);
  }, []);

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermissions();
    setNotifStatus(granted ? 'granted' : 'denied');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]} edges={['top']}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.heading}>TOOLS</ThemedText>
          <ThemedText style={styles.subtitle}>Settings & Preferences</ThemedText>
        </ThemedView>

        {/* Settings Card */}
        <ThemedView style={styles.card}>
          {/* Alert Settings */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Alert Settings</ThemedText>
            <ThemedView style={[styles.row, { borderBottomColor: borderColor + '20' }]}>
              <ThemedText style={styles.rowLabel}>Shift Start Warning</ThemedText>
              <ThemedText style={styles.rowValue}>15 min</ThemedText>
            </ThemedView>
            <ThemedView style={[styles.row, { borderBottomColor: borderColor + '20' }]}>
              <ThemedText style={styles.rowLabel}>Shift End Warning</ThemedText>
              <ThemedText style={styles.rowValue}>15 min</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Notifications */}
          <Pressable
            style={[styles.row, { borderBottomColor: borderColor + '20' }]}
            onPress={handleRequestNotifications}
          >
            <ThemedText style={styles.rowLabel}>Notifications</ThemedText>
            <ThemedText
              style={[
                styles.rowValue,
                {
                  color:
                    notifStatus === 'granted'
                      ? StatusColors.success
                      : notifStatus === 'denied'
                      ? StatusColors.danger
                      : borderColor,
                },
              ]}
            >
              {notifStatus === 'granted' ? 'Enabled' : notifStatus === 'denied' ? 'Denied' : 'Tap to enable'}
            </ThemedText>
          </Pressable>

          {/* Change PIN */}
          <Pressable
            style={[styles.row, { borderBottomColor: borderColor + '20' }]}
            onPress={() => router.push('/settings')}
          >
            <ThemedText style={styles.rowLabel}>Change PIN</ThemedText>
            <ThemedText style={[styles.rowChevron, { color: borderColor }]}>{'\u276F'}</ThemedText>
          </Pressable>

          {/* Lock App */}
          <Pressable
            style={styles.row}
            onPress={() => lock()}
          >
            <ThemedText style={[styles.rowLabel, { color: StatusColors.danger }]}>
              Lock App
            </ThemedText>
          </Pressable>
        </ThemedView>

        {/* Version Footer */}
        <ThemedView style={styles.footer}>
          <ThemedText style={[styles.version, { color: borderColor }]}>
            TimeNCare v1.0.0
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 48,
    fontWeight: '900',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.5,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.4,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  rowLabel: {
    fontSize: 17,
  },
  rowValue: {
    fontSize: 15,
  },
  rowChevron: {
    fontSize: 16,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 32,
  },
  version: {
    fontSize: 14,
  },
});
