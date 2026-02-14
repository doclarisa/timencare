import { useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MonthGrid } from '@/components/calendar/month-grid';
import { useEvents } from '@/hooks/use-events';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFocusEffect } from '@react-navigation/native';
import { type CalendarEvent } from '@/lib/database';

export default function CalendarScreen() {
  const router = useRouter();
  const { getEventsForMonth } = useEvents();
  const bgColor = useThemeColor({}, 'background');

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const loadEvents = useCallback(() => {
    const result = getEventsForMonth(year, month);
    setEvents(result);
  }, [year, month, getEventsForMonth]);

  // Reload events when screen gains focus or month changes
  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    router.push(`/day/${dateStr}`);
  };

  const handleChangeMonth = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
    setSelectedDate(null);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]} edges={['top']}>
      <MonthGrid
        year={year}
        month={month}
        events={events}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        onChangeMonth={handleChangeMonth}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});
