import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <ThemedText style={styles.time}>{formatTime(time)}</ThemedText>
      <ThemedText style={styles.date}>{formatDate(time)}</ThemedText>
    </>
  );
}

const styles = StyleSheet.create({
  time: {
    fontSize: 48,
    fontWeight: '200',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  date: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
});
