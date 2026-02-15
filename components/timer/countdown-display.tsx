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
}

export function CountdownDisplay({ secondsRemaining, status }: CountdownDisplayProps) {
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

  const isActive = status === 'active';
  const isOvertime = status === 'alerting' || isNegative;
  const isWarning = status === 'overtime' || (secondsRemaining > 0 && secondsRemaining <= 300);

  const label = isActive || isWarning
    ? '\u23F1\uFE0F TIME REMAINING'
    : isOvertime
    ? '\uD83D\uDEA8 OVERTIME'
    : '\u23F0 STARTS IN';

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <Animated.Text
        style={[
          styles.time,
          isOvertime && { color: StatusColors.danger },
          isWarning && { color: StatusColors.warning },
          animatedStyle,
        ]}
      >
        {timeString}
      </Animated.Text>
      {isActive && !isWarning && !isOvertime && (
        <View style={styles.activeBadge}>
          <ThemedText style={styles.activeBadgeText}>{'\u2705'} Shift Active</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  time: {
    fontSize: 56,
    fontWeight: '900',
    color: 'white',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  activeBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  activeBadgeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
