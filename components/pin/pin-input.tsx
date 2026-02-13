import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StatusColors } from '@/constants/theme';

interface PinInputProps {
  pinLength?: 4 | 5 | 6;
  onComplete: (pin: string) => void;
  title: string;
  error?: string;
}

const NUMBERS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
];

export function PinInput({
  pinLength = 4,
  onComplete,
  title,
  error,
}: PinInputProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');

  // Shake animation on error
  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  useEffect(() => {
    if (error) {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      setDigits([]);
    }
  }, [error, shakeX]);

  const handlePress = useCallback(
    (key: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (key === 'del') {
        setDigits((prev) => prev.slice(0, -1));
        return;
      }

      if (key === '') return;

      setDigits((prev) => {
        const next = [...prev, key];
        if (next.length === pinLength) {
          setTimeout(() => onComplete(next.join('')), 100);
        }
        return next.length <= pinLength ? next : prev;
      });
    },
    [pinLength, onComplete]
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>

      {error ? (
        <ThemedText style={[styles.error, { color: StatusColors.danger }]}>
          {error}
        </ThemedText>
      ) : (
        <ThemedText style={styles.subtitle}>
          Enter {pinLength}-digit PIN
        </ThemedText>
      )}

      {/* PIN dots */}
      <Animated.View style={[styles.dotsRow, shakeStyle]}>
        {Array.from({ length: pinLength }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i < digits.length ? tint : 'transparent',
                borderColor: tint,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Number pad */}
      <View style={styles.pad}>
        {NUMBERS.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.padRow}>
            {row.map((key) => (
              <Pressable
                key={key || 'empty'}
                style={({ pressed }) => [
                  styles.padButton,
                  key === '' && styles.padButtonEmpty,
                  pressed && key !== '' && { backgroundColor: tint + '20' },
                ]}
                onPress={() => handlePress(key)}
                disabled={key === ''}
              >
                {key === 'del' ? (
                  <ThemedText style={styles.padButtonText}>
                    &#9003;
                  </ThemedText>
                ) : (
                  <ThemedText style={styles.padButtonText}>{key}</ThemedText>
                )}
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 32,
  },
  error: {
    fontSize: 16,
    marginBottom: 32,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 48,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  pad: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  padRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  padButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  padButtonEmpty: {
    opacity: 0,
  },
  padButtonText: {
    fontSize: 28,
    fontWeight: '500',
  },
});
