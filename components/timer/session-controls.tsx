import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { StatusColors } from '@/constants/theme';
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
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: StatusColors.warning },
            pressed && styles.pressed,
          ]}
          onPress={() => handlePress(onAcknowledge)}
        >
          <ThemedText style={styles.buttonText} lightColor="#fff" darkColor="#fff">
            Dismiss Alert
          </ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: StatusColors.danger },
            pressed && styles.pressed,
          ]}
          onPress={() => handlePress(onClockOut)}
        >
          <ThemedText style={styles.buttonText} lightColor="#fff" darkColor="#fff">
            Clock Out
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  if (status === 'active' || status === 'overtime') {
    return (
      <View style={styles.container}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonLarge,
            { backgroundColor: StatusColors.danger },
            pressed && styles.pressed,
          ]}
          onPress={() => handlePress(onClockOut)}
        >
          <ThemedText style={styles.buttonTextLarge} lightColor="#fff" darkColor="#fff">
            Clock Out
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  if (status === 'waiting') {
    return (
      <View style={styles.container}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonLarge,
            { backgroundColor: StatusColors.success },
            pressed && styles.pressed,
          ]}
          onPress={() => handlePress(onClockIn)}
        >
          <ThemedText style={styles.buttonTextLarge} lightColor="#fff" darkColor="#fff">
            Clock In
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: 32,
    width: '100%',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonLarge: {
    paddingVertical: 20,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextLarge: {
    fontSize: 22,
    fontWeight: '700',
  },
});
