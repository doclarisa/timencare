import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { type TimerStatus } from '@/hooks/use-timer';

interface SessionControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function SessionControls({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
}: SessionControlsProps) {
  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    action();
  };

  const isActive = status === 'active';
  const isPaused = status === 'paused';
  const isStartAlarm = status === 'start_alarm';
  const isEndAlarm = status === 'end_alarm';
  const isCompleted = status === 'completed';

  // Start button: enabled during start_alarm or paused
  const startEnabled = isStartAlarm || isPaused;
  // Pause button: enabled during active
  const pauseEnabled = isActive;
  // Stop/Reset button: enabled during end_alarm, active, paused, or completed
  const stopEnabled = isEndAlarm || isActive || isPaused || isCompleted;

  const startLabel = isStartAlarm ? 'Start' : isPaused ? 'Resume' : 'Start';
  const startSub = isStartAlarm ? 'Stop alarm & go' : isPaused ? 'Continue timer' : 'Begin shift';

  const stopLabel = isEndAlarm ? 'Stop' : 'Reset';
  const stopSub = isEndAlarm ? 'Stop alarm' : 'Clear timer';

  const handleStartPress = () => {
    if (isStartAlarm) {
      handlePress(onStart);
    } else if (isPaused) {
      handlePress(onResume);
    }
  };

  const handleStopPress = () => {
    if (isEndAlarm) {
      handlePress(onStop);
    } else {
      handlePress(onReset);
    }
  };

  return (
    <View style={styles.row}>
      {/* START / RESUME button */}
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          styles.startBtn,
          pressed && startEnabled && styles.pressed,
          !startEnabled && styles.disabled,
        ]}
        onPress={handleStartPress}
        disabled={!startEnabled}
      >
        <ThemedText style={styles.startLabel}>{startLabel}</ThemedText>
        <ThemedText style={styles.startSub}>{startSub}</ThemedText>
      </Pressable>

      {/* PAUSE button */}
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          styles.pauseBtn,
          pressed && pauseEnabled && styles.pressed,
          !pauseEnabled && styles.disabled,
        ]}
        onPress={() => handlePress(onPause)}
        disabled={!pauseEnabled}
      >
        <ThemedText style={styles.pauseLabel}>Pause</ThemedText>
        <ThemedText style={styles.pauseSub}>Hold timer</ThemedText>
      </Pressable>

      {/* STOP / RESET button */}
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          isEndAlarm ? styles.stopBtn : styles.resetBtn,
          pressed && stopEnabled && styles.pressed,
          !stopEnabled && styles.disabled,
        ]}
        onPress={handleStopPress}
        disabled={!stopEnabled}
      >
        <ThemedText style={isEndAlarm ? styles.stopLabel : styles.resetLabel}>
          {stopLabel}
        </ThemedText>
        <ThemedText style={isEndAlarm ? styles.stopSub : styles.resetSub}>
          {stopSub}
        </ThemedText>
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
  // Stop - Orange (when end alarm)
  stopBtn: {
    backgroundColor: '#F97316',
  },
  stopLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  stopSub: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
});
