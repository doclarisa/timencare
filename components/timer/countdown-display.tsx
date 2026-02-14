import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { ThemedView } from '@/components/themed-view';
import { StatusColors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { type TimerStatus } from '@/hooks/use-timer';

interface CountdownDisplayProps {
  secondsRemaining: number;
  status: TimerStatus;
}

export function CountdownDisplay({ secondsRemaining, status }: CountdownDisplayProps) {
  const textColor = useThemeColor({}, 'text');
  const opacity = useSharedValue(1);

  // Blink when alerting
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
  const absSeconds = Math.abs(secondsRemaining);
  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = absSeconds % 60;

  const timeString = `${isNegative ? '-' : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  let color = textColor;
  if (status === 'alerting' || isNegative) {
    color = StatusColors.danger;
  } else if (status === 'overtime' || (secondsRemaining > 0 && secondsRemaining <= 300)) {
    color = StatusColors.warning;
  }

  return (
    <ThemedView style={styles.container}>
      <Animated.Text style={[styles.time, { color }, animatedStyle]}>
        {timeString}
      </Animated.Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  time: {
    fontSize: 64,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
});
