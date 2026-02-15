import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeStr = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const dateStr = time.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <ThemedText style={styles.time}>{timeStr}</ThemedText>
      <ThemedText style={styles.date}>{dateStr}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    fontVariant: ['tabular-nums'],
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
