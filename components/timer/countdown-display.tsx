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

  useEffect(() => {
    if (status === 'alerting') {
      opacity.value = withRepeat(withTiming(0.3, { duration: 500 }), -1, true);
    } else {
      cancelAnimation(opacity);
      opacity.value = 1;
    }
  }, [status, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const isNegative = secondsRemaining < 0;
  const timeString = `${isNegative ? '-' : ''}${formatDuration(secondsRemaining)}`;

  const isOvertime = status === 'alerting' || isNegative;
  const isWarning = status === 'overtime' || (secondsRemaining > 0 && secondsRemaining <= 300);

  const label = isOvertime
    ? 'OVERTIME'
    : (status === 'active' || isWarning)
    ? 'TIME REMAINING'
    : 'STARTS IN';

  const timeColor = isOvertime
    ? StatusColors.danger
    : isWarning
    ? StatusColors.warning
    : '#1F2937';

  return (
    <View>
      <ThemedText style={[styles.label, isOvertime && { color: StatusColors.danger }]}>
        {label}
      </ThemedText>

      <Animated.Text style={[styles.time, { color: timeColor }, animatedStyle]}>
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
