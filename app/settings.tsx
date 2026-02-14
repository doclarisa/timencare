import { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PinInput } from '@/components/pin/pin-input';
import { useAuth } from '@/contexts/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getNotificationPermissionStatus, requestNotificationPermissions } from '@/lib/notifications';
import { StatusColors } from '@/constants/theme';

type SettingsMode = 'menu' | 'change-pin-verify' | 'change-pin-new' | 'change-pin-confirm';

export default function SettingsScreen() {
  const router = useRouter();
  const { authenticate, createPin, lock } = useAuth();
  const borderColor = useThemeColor({}, 'icon');

  const [mode, setMode] = useState<SettingsMode>('menu');
  const [newPin, setNewPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [notifStatus, setNotifStatus] = useState('unknown');

  useEffect(() => {
    getNotificationPermissionStatus().then(setNotifStatus);
  }, []);

  const handleVerifyPin = async (pin: string) => {
    const valid = await authenticate(pin);
    if (valid) {
      setPinError('');
      setMode('change-pin-new');
    } else {
      setPinError('Wrong PIN');
    }
  };

  const handleNewPin = (pin: string) => {
    setNewPin(pin);
    setPinError('');
    setMode('change-pin-confirm');
  };

  const handleConfirmPin = async (pin: string) => {
    if (pin === newPin) {
      await createPin(pin);
      Alert.alert('PIN Changed', 'Your PIN has been updated.');
      setMode('menu');
      setNewPin('');
      setPinError('');
    } else {
      setPinError('PINs do not match');
      setMode('change-pin-new');
      setNewPin('');
    }
  };

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermissions();
    setNotifStatus(granted ? 'granted' : 'denied');
  };

  if (mode === 'change-pin-verify') {
    return (
      <PinInput
        title="Enter Current PIN"
        onComplete={handleVerifyPin}
        error={pinError}
      />
    );
  }

  if (mode === 'change-pin-new') {
    return (
      <PinInput
        title="Enter New PIN"
        onComplete={handleNewPin}
        error={pinError}
      />
    );
  }

  if (mode === 'change-pin-confirm') {
    return (
      <PinInput
        title="Confirm New PIN"
        onComplete={handleConfirmPin}
        error={pinError}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Change PIN */}
      <Pressable
        style={[styles.row, { borderBottomColor: borderColor + '20' }]}
        onPress={() => setMode('change-pin-verify')}
      >
        <ThemedText style={styles.rowLabel}>Change PIN</ThemedText>
        <ThemedText style={[styles.rowChevron, { color: borderColor }]}>{'\u276F'}</ThemedText>
      </Pressable>

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

      {/* Lock App */}
      <Pressable
        style={[styles.row, { borderBottomColor: borderColor + '20' }]}
        onPress={() => {
          lock();
          router.dismiss();
        }}
      >
        <ThemedText style={[styles.rowLabel, { color: StatusColors.danger }]}>
          Lock App
        </ThemedText>
      </Pressable>

      {/* Version */}
      <View style={styles.footer}>
        <ThemedText style={[styles.version, { color: borderColor }]}>
          TimeNCare v1.0.0
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
