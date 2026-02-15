import { useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { DayCell } from '@/components/calendar/day-cell';
import { type CalendarEvent } from '@/lib/database';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface MonthGridProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
  onChangeMonth: (year: number, month: number) => void;
}

export function MonthGrid({
  year,
  month,
  events,
  selectedDate,
  onSelectDate,
  onChangeMonth,
}: MonthGridProps) {
  const iconColor = useThemeColor({}, 'icon');

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Build event color map by day
  const eventColorsByDay = useMemo(() => {
    const map: Record<number, string[]> = {};
    for (const event of events) {
      const day = parseInt(event.startAt.split('T')[0].split('-')[2], 10);
      if (!map[day]) map[day] = [];
      if (!map[day].includes(event.colorHex)) {
        map[day].push(event.colorHex);
      }
    }
    return map;
  }, [events]);

  // Build grid
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  const goPrev = () => {
    if (month === 1) onChangeMonth(year - 1, 12);
    else onChangeMonth(year, month - 1);
  };

  const goNext = () => {
    if (month === 12) onChangeMonth(year + 1, 1);
    else onChangeMonth(year, month + 1);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Month header */}
      <View style={styles.header}>
        <Pressable onPress={goPrev} style={styles.navButton}>
          <ThemedText style={styles.navArrow}>{'\u276E'}</ThemedText>
        </Pressable>
        <ThemedText style={styles.monthTitle}>
          {MONTH_NAMES[month - 1]} {year}
        </ThemedText>
        <Pressable onPress={goNext} style={styles.navButton}>
          <ThemedText style={styles.navArrow}>{'\u276F'}</ThemedText>
        </Pressable>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((wd) => (
          <View key={wd} style={styles.weekdayCell}>
            <ThemedText style={[styles.weekdayText, { color: iconColor }]}>
              {wd}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Day grid */}
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((day, colIdx) => {
            const dateStr = day
              ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              : '';
            return (
              <DayCell
                key={colIdx}
                day={day}
                isToday={dateStr === todayStr}
                isSelected={dateStr === selectedDate}
                eventColors={day ? eventColorsByDay[day] ?? [] : []}
                onPress={() => day && onSelectDate(dateStr)}
              />
            );
          })}
        </View>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  navButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  navArrow: {
    fontSize: 18,
    fontWeight: '700',
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingBottom: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  weekdayText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
  },
});
