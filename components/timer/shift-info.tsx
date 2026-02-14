import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EventColors, StatusColors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { type CalendarEvent } from '@/lib/database';
import { type TimerStatus } from '@/hooks/use-timer';

interface ShiftInfoProps {
  shift: CalendarEvent;
  status: TimerStatus;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getStatusLabel(status: TimerStatus): string {
  switch (status) {
    case 'waiting':
      return 'Ready';
    case 'active':
      return 'In Progress';
    case 'overtime':
      return 'Ending Soon';
    case 'alerting':
      return 'Overtime!';
    default:
      return '';
  }
}

function getStatusColor(status: TimerStatus): string {
  switch (status) {
    case 'waiting':
      return StatusColors.info;
    case 'active':
      return StatusColors.success;
    case 'overtime':
      return StatusColors.warning;
    case 'alerting':
      return StatusColors.danger;
    default:
      return StatusColors.info;
  }
}

export function ShiftInfo({ shift, status }: ShiftInfoProps) {
  const borderColor = useThemeColor({}, 'icon');

  const statusLabel = getStatusLabel(status);
  const statusColor = getStatusColor(status);

  return (
    <ThemedView style={[styles.container, { borderColor: borderColor + '30' }]}>
      <View style={[styles.colorStripe, { backgroundColor: shift.colorHex || EventColors.WORK }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.clientName} numberOfLines={1}>
            {shift.clientName}
          </ThemedText>
          {statusLabel ? (
            <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
              <ThemedText style={[styles.badgeText, { color: statusColor }]}>
                {statusLabel}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText style={styles.timeRange}>
          {formatTime(shift.startAt)} — {formatTime(shift.endAt)}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  colorStripe: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  clientName: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeRange: {
    fontSize: 16,
    opacity: 0.7,
  },
});
