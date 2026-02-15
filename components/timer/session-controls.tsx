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

  const isActive = status === 'active' || status === 'overtime';
  const isAlerting = status === 'alerting';

  return (
    <View style={styles.row}>
      {/* START button */}
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          styles.startBtn,
          pressed && styles.pressed,
          isActive && styles.disabled,
        ]}
        onPress={() => handlePress(onClockIn)}
        disabled={isActive}
      >
        <ThemedText style={styles.startLabel}>Start</ThemedText>
        <ThemedText style={styles.startSub}>Resume timer</ThemedText>
      </Pressable>

      {/* PAUSE button */}
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          styles.pauseBtn,
          pressed && styles.pressed,
          !isActive && !isAlerting && styles.disabled,
        ]}
        onPress={() => handlePress(isAlerting ? onAcknowledge : onClockOut)}
        disabled={!isActive && !isAlerting}
      >
        <ThemedText style={styles.pauseLabel}>Pause</ThemedText>
        <ThemedText style={styles.pauseSub}>Hold</ThemedText>
      </Pressable>

      {/* RESET button */}
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          styles.resetBtn,
          pressed && styles.pressed,
          !isActive && !isAlerting && styles.disabled,
        ]}
        onPress={() => handlePress(onClockOut)}
        disabled={!isActive && !isAlerting}
      >
        <ThemedText style={styles.resetLabel}>Reset</ThemedText>
        <ThemedText style={styles.resetSub}>Clear</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.45,
  },
  // Start - Red/Pink
  startBtn: {
    backgroundColor: '#EF4444',
  },
  startLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  startSub: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  // Pause - Dark
  pauseBtn: {
    backgroundColor: '#1F2937',
  },
  pauseLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  pauseSub: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  // Reset - Light
  resetBtn: {
    backgroundColor: '#F3F4F6',
  },
  resetLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  resetSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
});
