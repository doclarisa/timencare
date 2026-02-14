import { Pressable, View, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { type CalendarEvent } from '@/lib/database';

interface EventCardProps {
  event: CalendarEvent;
  onPress: () => void;
  onDelete: () => void;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function EventCard({ event, onPress, onDelete }: EventCardProps) {
  const borderColor = useThemeColor({}, 'icon');

  const handleLongPress = () => {
    Alert.alert(
      'Delete Event',
      `Delete "${event.clientName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <Pressable onPress={onPress} onLongPress={handleLongPress}>
      <ThemedView style={[styles.card, { borderColor: borderColor + '20' }]}>
        <View style={[styles.stripe, { backgroundColor: event.colorHex }]} />
        <View style={styles.content}>
          <View style={styles.topRow}>
            <ThemedText style={styles.clientName} numberOfLines={1}>
              {event.clientName}
            </ThemedText>
            <View style={[styles.typeBadge, { backgroundColor: event.colorHex + '20' }]}>
              <ThemedText style={[styles.typeText, { color: event.colorHex }]}>
                {event.type}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.timeText}>
            {formatTime(event.startAt)} — {formatTime(event.endAt)}
          </ThemedText>
          {event.notes ? (
            <ThemedText style={styles.notes} numberOfLines={2}>
              {event.notes}
            </ThemedText>
          ) : null}
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stripe: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  clientName: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
    opacity: 0.7,
  },
  notes: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
});
