import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { type TimerStatus } from '@/hooks/use-timer';

interface SessionControlsProps {
  status: TimerStatus;
  onClockIn: () => void;
  onClockOut: () => void;
  onAcknowledge: () => void;
}

export function SessionControls({
  status,
  onClockIn,
  onClockOut,
  onAcknowledge,
}: SessionControlsProps) {
  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    action();
  };

  if (status === 'alerting') {
    return (
      <View style={styles.container}>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnWarning, pressed && styles.pressed]}
          onPress={() => handlePress(onAcknowledge)}
        >
          <ThemedText style={styles.btnLabel}>Dismiss</ThemedText>
          <ThemedText style={styles.btnSub}>Stop alert</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnDanger, pressed && styles.pressed]}
          onPress={() => handlePress(onClockOut)}
        >
          <ThemedText style={styles.btnLabel}>Clock Out</ThemedText>
          <ThemedText style={styles.btnSub}>End shift</ThemedText>
        </Pressable>
      </View>
    );
  }

  if (status === 'active' || status === 'overtime') {
    return (
      <View style={styles.container}>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnDanger, pressed && styles.pressed]}
          onPress={() => handlePress(onClockOut)}
        >
          <ThemedText style={styles.btnLabel}>Clock Out</ThemedText>
          <ThemedText style={styles.btnSub}>End shift</ThemedText>
        </Pressable>
      </View>
    );
  }

  if (status === 'waiting') {
    return (
      <View style={styles.container}>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnSuccess, pressed && styles.pressed]}
          onPress={() => handlePress(onClockIn)}
        >
          <ThemedText style={styles.btnLabel}>Start</ThemedText>
          <ThemedText style={styles.btnSub}>Clock in</ThemedText>
        </Pressable>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSuccess: {
    backgroundColor: '#EF4444',
  },
  btnDanger: {
    backgroundColor: '#1F2937',
  },
  btnWarning: {
    backgroundColor: '#F59E0B',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  btnLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
  btnSub: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});
