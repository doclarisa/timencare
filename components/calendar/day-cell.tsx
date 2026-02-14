import { Pressable, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface DayCellProps {
  day: number | null;
  isToday: boolean;
  isSelected: boolean;
  eventColors: string[];
  onPress: () => void;
}

export function DayCell({ day, isToday, isSelected, eventColors, onPress }: DayCellProps) {
  const tint = useThemeColor({}, 'tint');

  if (day === null) {
    return <View style={styles.cell} />;
  }

  return (
    <Pressable
      style={[
        styles.cell,
        isSelected && { backgroundColor: tint + '20' },
        isToday && styles.todayCell,
      ]}
      onPress={onPress}
    >
      <ThemedText
        style={[
          styles.dayText,
          isToday && { color: tint, fontWeight: '700' },
          isSelected && { color: tint },
        ]}
      >
        {day}
      </ThemedText>
      <View style={styles.dotsRow}>
        {eventColors.slice(0, 3).map((color, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: color }]} />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    minHeight: 48,
  },
  todayCell: {
    borderWidth: 1,
    borderColor: 'rgba(10, 126, 164, 0.3)',
  },
  dayText: {
    fontSize: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
    height: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
