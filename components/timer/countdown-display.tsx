import { StyleSheet, View, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { ThemedText } from '@/components/themed-text';
import { StatusColors } from '@/constants/theme';
import { type TimerStatus } from '@/hooks/use-timer';

interface CountdownDisplayProps {
  secondsRemaining: number;
  status: TimerStatus;
  totalShiftSeconds?: number;
}

function formatDuration(totalSeconds: number): string {
  const abs = Math.abs(totalSeconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function CountdownDisplay({ secondsRemaining, status, totalShiftSeconds }: CountdownDisplayProps) {
  const opacity = useSharedValue(1);

  const isAlarm = status === 'start_alarm' || status === 'end_alarm';

  useEffect(() => {
    if (isAlarm) {
      opacity.value = withRepeat(withTiming(0.3, { duration: 500 }), -1, true);
    } else {
      cancelAnimation(opacity);
      opacity.value = 1;
    }
  }, [isAlarm, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const timeString = formatDuration(secondsRemaining);

  let label = 'SHIFT DURATION';
  let timeColor = '#1F2937';

  if (status === 'waiting') {
    label = 'SHIFT DURATION';
    timeColor = '#1F2937';
  } else if (status === 'start_alarm') {
    label = 'SHIFT STARTING — TAP START';
    timeColor = StatusColors.warning;
  } else if (status === 'active') {
    label = 'TIME REMAINING';
    timeColor = '#1F2937';
    if (secondsRemaining <= 300) {
      timeColor = StatusColors.warning;
    }
  } else if (status === 'paused') {
    label = 'PAUSED';
    timeColor = '#6B7280';
  } else if (status === 'end_alarm') {
    label = 'SHIFT ENDED — TAP STOP';
    timeColor = StatusColors.danger;
  } else if (status === 'completed') {
    label = 'SHIFT COMPLETE';
    timeColor = StatusColors.success;
  }

  return (
    <View>
      <ThemedText style={[styles.label, isAlarm && { color: StatusColors.danger }]}>
        {label}
      </ThemedText>

      <Animated.Text style={[styles.time, { color: timeColor }, isAlarm && animatedStyle]}>
        {timeString}
      </Animated.Text>

      {totalShiftSeconds ? (
        <ThemedText style={styles.totalShift}>
          Total shift: <ThemedText style={styles.totalShiftBold}>{formatDuration(totalShiftSeconds)}</ThemedText>
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 16,
  },
  time: {
    fontSize: 72,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
    marginBottom: 8,
  },
  totalShift: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 24,
  },
  totalShiftBold: {
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
