import { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { type CalendarEvent, type Client } from '@/lib/database';
import { type TimerStatus } from '@/hooks/use-timer';
import { useDatabase } from '@/contexts/database-context';

interface ShiftInfoProps {
  shift: CalendarEvent;
  status: TimerStatus;
  onClientPress?: (client: Client) => void;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function getStatusLabel(status: TimerStatus): string {
  switch (status) {
    case 'active': return 'Active';
    case 'waiting': return 'Upcoming';
    case 'start_alarm': return 'Starting';
    case 'paused': return 'Paused';
    case 'end_alarm': return 'Shift Ended';
    case 'completed': return 'Complete';
    default: return '';
  }
}

export function ShiftInfo({ shift, status, onClientPress }: ShiftInfoProps) {
  const db = useDatabase();
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    try {
      const result = db.getFirstSync<Client>(
        'SELECT * FROM clients WHERE name = ? LIMIT 1',
        [shift.clientName]
      );
      setClient(result ?? null);
    } catch {
      setClient(null);
    }
  }, [db, shift.clientName]);

  const eventType = shift.type === 'WORK'
    ? 'Home Care Visit'
    : shift.type === 'MEDS'
    ? 'Medication Visit'
    : 'Visit';

  const statusLabel = getStatusLabel(status);
  const isActive = status === 'active' || status === 'start_alarm' || status === 'end_alarm';

  return (
    <Pressable
      style={styles.card}
      onPress={() => {
        if (client && onClientPress) {
          onClientPress(client);
        }
      }}
    >
      {/* Header: CURRENT SHIFT + Active status */}
      <View style={styles.headerRow}>
        <ThemedText style={styles.shiftLabel}>CURRENT SHIFT</ThemedText>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusDot,
            { backgroundColor: isActive ? '#10B981' : '#3B82F6' },
          ]} />
          <ThemedText style={styles.statusText}>{statusLabel}</ThemedText>
        </View>
      </View>

      {/* View details link - right aligned under status */}
      {client && (
        <ThemedText style={styles.viewDetails}>View details</ThemedText>
      )}

      {/* Client name - large */}
      <ThemedText style={styles.clientName}>{shift.clientName}</ThemedText>

      {/* Type + Location */}
      <ThemedText style={styles.subtitle}>
        {eventType} {client?.address ? `\u2022 ${client.address}` : ''}
      </ThemedText>

      {/* Time range */}
      <ThemedText style={styles.timeRange}>
        {formatTime(shift.startAt)} to {formatTime(shift.endAt)}
      </ThemedText>

      {/* Next Action box */}
      {(shift.notes || client?.medications) && (
        <View style={styles.nextActionBox}>
          <ThemedText style={styles.nextActionLabel}>NEXT ACTION</ThemedText>
          <ThemedText style={styles.nextActionText}>
            {shift.notes || `Medication reminder: ${client?.medications}`}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shiftLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'right',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  timeRange: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  nextActionBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  nextActionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  nextActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 22,
  },
});
