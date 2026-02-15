import { StyleSheet, View, Pressable, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EventColors } from '@/constants/theme';
import { type CalendarEvent, type Client } from '@/lib/database';
import { type TimerStatus } from '@/hooks/use-timer';
import { useDatabase } from '@/contexts/database-context';

interface ShiftInfoProps {
  shift: CalendarEvent;
  status: TimerStatus;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getStatusLabel(status: TimerStatus): { label: string; icon: string } {
  switch (status) {
    case 'waiting':
      return { label: 'Upcoming Shift', icon: '\uD83D\uDD35' };
    case 'active':
      return { label: 'Current Shift', icon: '\uD83D\uDFE2' };
    case 'overtime':
      return { label: 'Ending Soon', icon: '\uD83D\uDFE1' };
    case 'alerting':
      return { label: 'Overtime!', icon: '\uD83D\uDD34' };
    default:
      return { label: '', icon: '' };
  }
}


export function ShiftInfo({ shift, status }: ShiftInfoProps) {
  const db = useDatabase();

  const { label: statusLabel, icon: statusIcon } = getStatusLabel(status);

  // Look up client data for additional info (medications, etc.)
  const client = db.getFirstSync<Client>(
    'SELECT * FROM clients WHERE name = ? LIMIT 1',
    [shift.clientName]
  );

  const shiftColor = shift.colorHex || EventColors.WORK;
  const eventType = shift.type === 'WORK' ? 'Work' : shift.type === 'MEDS' ? 'Medication' : 'Other';

  return (
    <Pressable
      style={[styles.container, { borderColor: shiftColor }]}
      onPress={() => {
        const info = client
          ? `${client.name}\n\nPhone: ${client.phone || 'N/A'}\nAddress: ${client.address || 'N/A'}\n\nEmergency: ${client.emergencyContact || 'N/A'}`
          : `${shift.clientName}\n\nNo client profile found.`;
        Alert.alert('Client Profile', info);
      }}
    >
      {/* Status Badge */}
      <View style={styles.header}>
        <ThemedText style={styles.statusBadge}>
          {statusIcon} {statusLabel}
        </ThemedText>
      </View>

      {/* Client Name */}
      <ThemedText style={styles.clientName}>{shift.clientName}</ThemedText>

      {/* Time and Type */}
      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <ThemedText style={styles.infoLabel}>Scheduled</ThemedText>
          <ThemedText style={[styles.infoValue, { color: shiftColor }]}>
            {formatTime(shift.startAt)} - {formatTime(shift.endAt)}
          </ThemedText>
        </View>
        <View style={styles.infoBox}>
          <ThemedText style={styles.infoLabel}>Type</ThemedText>
          <ThemedText style={[styles.infoValue, { color: '#10B981' }]}>
            {eventType}
          </ThemedText>
        </View>
      </View>

      {/* Notes */}
      {shift.notes ? (
        <View style={styles.notesBox}>
          <ThemedText style={styles.notesLabel}>{'\uD83D\uDCCB'} Notes</ThemedText>
          <ThemedText style={styles.notesText}>{shift.notes}</ThemedText>
        </View>
      ) : null}

      {/* Medications from client profile */}
      {client?.medications ? (
        <View style={styles.medsBox}>
          <ThemedText style={styles.medsLabel}>{'\uD83D\uDC8A'} Medications</ThemedText>
          <ThemedText style={styles.medsText}>{client.medications}</ThemedText>
        </View>
      ) : null}

      {/* Tap hint */}
      <ThemedText style={styles.tapHint}>Tap to view full client profile {'\u276F'}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 3,
    padding: 24,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  clientName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  notesBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#78350F',
  },
  medsBox: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  medsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B21A8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  medsText: {
    fontSize: 14,
    color: '#581C87',
  },
  tapHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
