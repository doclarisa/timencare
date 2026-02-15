import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { type EventType, type CalendarEvent } from '@/lib/database';

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'WORK', label: 'Work' },
  { value: 'MEDS', label: 'Meds' },
  { value: 'OTHER', label: 'Other' },
];

const FORM_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

interface EventFormProps {
  initialDate: string;
  existingEvent?: CalendarEvent | null;
  onSave: (data: EventFormData) => void;
  onCancel: () => void;
}

export interface EventFormData {
  clientName: string;
  startAt: string;
  endAt: string;
  type: EventType;
  notes: string;
  colorHex: string;
  notifyEnabled: boolean;
}

/** Round minutes to nearest 5 */
function roundTo5(date: Date): Date {
  const d = new Date(date);
  d.setMinutes(Math.round(d.getMinutes() / 5) * 5, 0, 0);
  return d;
}

export function EventForm({ initialDate, existingEvent, onSave, onCancel }: EventFormProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  // Smart defaults: round current time to nearest 5 min, end = start + 2h
  const defaultStart = existingEvent
    ? new Date(existingEvent.startAt)
    : roundTo5(new Date());

  const defaultEnd = existingEvent
    ? new Date(existingEvent.endAt)
    : new Date(defaultStart.getTime() + 2 * 60 * 60 * 1000);

  const [clientName, setClientName] = useState(existingEvent?.clientName ?? '');
  const [type, setType] = useState<EventType>(existingEvent?.type ?? 'WORK');
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [notes, setNotes] = useState(existingEvent?.notes ?? '');
  const [colorHex, setColorHex] = useState(existingEvent?.colorHex ?? FORM_COLORS[0]);
  const [notifyEnabled, setNotifyEnabled] = useState(existingEvent?.notifyEnabled ?? false);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleSave = () => {
    if (!clientName.trim()) return;
    onSave({
      clientName: clientName.trim(),
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      type,
      notes: notes.trim(),
      colorHex,
      notifyEnabled,
    });
  };

  const formatDateTime = (date: Date) =>
    date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) +
    '  ' +
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Client Name */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Client Name</ThemedText>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: borderColor + '40' }]}
            value={clientName}
            onChangeText={setClientName}
            placeholder="e.g. Sarah Johnson"
            placeholderTextColor={borderColor}
            autoFocus={!existingEvent}
          />
        </View>

        {/* Event Type */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Type</ThemedText>
          <View style={styles.typeRow}>
            {EVENT_TYPES.map((t) => {
              const selected = type === t.value;
              return (
                <Pressable
                  key={t.value}
                  style={[
                    styles.typeButton,
                    selected && styles.typeButtonSelected,
                  ]}
                  onPress={() => setType(t.value)}
                >
                  <ThemedText
                    style={[
                      styles.typeText,
                      selected && styles.typeTextSelected,
                    ]}
                  >
                    {t.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Start Time */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Start</ThemedText>
          <Pressable
            style={[styles.timeButton, { borderColor: borderColor + '40' }]}
            onPress={() => setShowStartPicker(true)}
          >
            <ThemedText style={styles.timeText}>{formatDateTime(startDate)}</ThemedText>
          </Pressable>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="datetime"
              minuteInterval={5}
              onChange={(_, date) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (date) {
                  setStartDate(date);
                  // Auto-adjust end time to stay 2h ahead if end <= new start
                  if (endDate <= date) {
                    setEndDate(new Date(date.getTime() + 2 * 60 * 60 * 1000));
                  }
                }
              }}
            />
          )}
        </View>

        {/* End Time */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>End</ThemedText>
          <Pressable
            style={[styles.timeButton, { borderColor: borderColor + '40' }]}
            onPress={() => setShowEndPicker(true)}
          >
            <ThemedText style={styles.timeText}>{formatDateTime(endDate)}</ThemedText>
          </Pressable>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="datetime"
              minuteInterval={5}
              minimumDate={startDate}
              onChange={(_, date) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (date) setEndDate(date);
              }}
            />
          )}
        </View>

        {/* Color */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Color</ThemedText>
          <View style={styles.colorRow}>
            {FORM_COLORS.map((c) => (
              <Pressable
                key={c}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  colorHex === c && styles.colorSelected,
                ]}
                onPress={() => setColorHex(c)}
              >
                {colorHex === c && (
                  <ThemedText style={styles.colorCheck}>{'\u2713'}</ThemedText>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Notes</ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { color: textColor, borderColor: borderColor + '40' },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes (optional)"
            placeholderTextColor={borderColor}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Notify toggle */}
        <View style={[styles.field, styles.switchRow]}>
          <ThemedText style={styles.label}>Alert at start time</ThemedText>
          <Switch
            value={notifyEnabled}
            onValueChange={setNotifyEnabled}
            trackColor={{ true: '#3B82F6' }}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <Pressable style={styles.cancelBtn} onPress={onCancel}>
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.saveBtn, !clientName.trim() && { opacity: 0.5 }]}
            onPress={handleSave}
            disabled={!clientName.trim()}
          >
            <ThemedText style={styles.saveText}>
              {existingEvent ? 'Update' : 'Save'}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  // Type buttons
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  typeButtonSelected: {
    backgroundColor: '#3B82F6',
  },
  typeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
  typeTextSelected: {
    color: 'white',
  },
  // Time buttons
  timeButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Color picker
  colorRow: {
    flexDirection: 'row',
    gap: 14,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  colorCheck: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  },
  // Switch row
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});
