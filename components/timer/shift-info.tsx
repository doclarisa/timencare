import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EventColors } from '@/constants/theme';
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

function getStatusConfig(status: TimerStatus): { label: string; color: string; bg: string } {
  switch (status) {
    case 'waiting':
      return { label: 'Upcoming', color: '#3B82F6', bg: '#EFF6FF' };
    case 'active':
      return { label: 'Active', color: '#10B981', bg: '#ECFDF5' };
    case 'overtime':
      return { label: 'Ending Soon', color: '#F59E0B', bg: '#FFFBEB' };
    case 'alerting':
      return { label: 'Overtime', color: '#EF4444', bg: '#FEF2F2' };
    default:
      return { label: '', color: '#6B7280', bg: '#F3F4F6' };
  }
}

export function ShiftInfo({ shift, status, onClientPress }: ShiftInfoProps) {
  const db = useDatabase();
  const { label: statusLabel, color: statusColor, bg: statusBg } = getStatusConfig(status);

  const client = db.getFirstSync<Client>(
    'SELECT * FROM clients WHERE name = ? LIMIT 1',
    [shift.clientName]
  );

  const shiftColor = shift.colorHex || EventColors.WORK;
  const eventType = shift.type === 'WORK' ? 'Work' : shift.type === 'MEDS' ? 'Medication' : 'Other';

  return (
    <Pressable
      style={[styles.container, { borderLeftColor: shiftColor }]}
      onPress={() => {
        if (client && onClientPress) {
          onClientPress(client);
        }
      }}
    >
      {/* Top row: label + status badge */}
      <View style={styles.topRow}>
        <ThemedText style={styles.sectionLabel}>CURRENT SHIFT</ThemedText>
        <View style={styles.rightGroup}>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <ThemedText style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </ThemedText>
          </View>
          {client && (
            <ThemedText style={styles.viewDetails}>View details</ThemedText>
          )}
        </View>
      </View>

      {/* Client name */}
      <ThemedText style={styles.clientName}>{shift.clientName}</ThemedText>

      {/* Description line */}
      <ThemedText style={styles.description}>
        {eventType} {client?.address ? `\u2022 ${client.address}` : ''}
      </ThemedText>

      {/* Time range */}
      <ThemedText style={styles.timeRange}>
        {formatTime(shift.startAt)} \u2013 {formatTime(shift.endAt)}
      </ThemedText>

      {/* Next Action card */}
      {shift.notes ? (
        <View style={styles.nextAction}>
          <ThemedText style={styles.nextActionLabel}>NEXT ACTION</ThemedText>
          <ThemedText style={styles.nextActionText}>{shift.notes}</ThemedText>
        </View>
      ) : client?.medications ? (
        <View style={styles.nextAction}>
          <ThemedText style={styles.nextActionLabel}>NEXT ACTION</ThemedText>
          <ThemedText style={styles.nextActionText}>
            Medication reminder: {client.medications}
          </ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 1.2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  viewDetails: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  clientName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  timeRange: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  nextAction: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  nextActionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 6,
  },
  nextActionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
