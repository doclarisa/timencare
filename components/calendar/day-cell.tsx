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
    paddingVertical: 8,
    borderRadius: 12,
    minHeight: 52,
    margin: 1,
  },
  todayCell: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  dayText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1F2937',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
    height: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
