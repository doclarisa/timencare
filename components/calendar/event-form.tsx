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
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
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

  const now = new Date();
  const defaultStart = existingEvent
    ? new Date(existingEvent.startAt)
    : roundTo5(now);
  const defaultEnd = existingEvent
    ? new Date(existingEvent.endAt)
    : new Date(defaultStart.getTime() + 2 * 60 * 60 * 1000);

  const [clientName, setClientName] = useState(existingEvent?.clientName ?? '');
  const [type, setType] = useState<EventType>(existingEvent?.type ?? 'WORK');
  const [selectedDate, setSelectedDate] = useState(defaultStart);
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [notes, setNotes] = useState(existingEvent?.notes ?? '');
  const [colorHex, setColorHex] = useState(existingEvent?.colorHex ?? FORM_COLORS[0]);
  const [notifyEnabled, setNotifyEnabled] = useState(existingEvent?.notifyEnabled ?? false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  /** Combine the selected date with a time value */
  function combineDateTime(date: Date, time: Date): Date {
    const result = new Date(date);
    result.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return result;
  }

  const handleSave = () => {
    if (!clientName.trim()) return;
    const start = combineDateTime(selectedDate, startTime);
    const end = combineDateTime(selectedDate, endTime);
    // If end is before start, assume next day
    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }
    onSave({
      clientName: clientName.trim(),
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      type,
      notes: notes.trim(),
      colorHex,
      notifyEnabled,
    });
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString([], { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });

  const formatTime = (date: Date) =>
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
                  style={[styles.typeButton, selected && styles.typeButtonSelected]}
                  onPress={() => setType(t.value)}
                >
                  <ThemedText style={[styles.typeText, selected && styles.typeTextSelected]}>
                    {t.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Date (separate) */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Date</ThemedText>
          <Pressable
            style={[styles.pickerButton, { borderColor: borderColor + '40' }]}
            onPress={() => setShowDatePicker(true)}
          >
            <ThemedText style={styles.pickerIcon}>{'\uD83D\uDCC5'}</ThemedText>
            <ThemedText style={styles.pickerText}>{formatDate(selectedDate)}</ThemedText>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) setSelectedDate(date);
              }}
            />
          )}
        </View>

        {/* Start Time (separate) */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Start Time</ThemedText>
          <Pressable
            style={[styles.pickerButton, { borderColor: borderColor + '40' }]}
            onPress={() => setShowStartPicker(true)}
          >
            <ThemedText style={styles.pickerIcon}>{'\u23F0'}</ThemedText>
            <ThemedText style={styles.pickerText}>{formatTime(startTime)}</ThemedText>
          </Pressable>
          {showStartPicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display="default"
              minuteInterval={5}
              onChange={(_, date) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (date) {
                  setStartTime(date);
                  // Auto-adjust end if needed
                  if (endTime <= date) {
                    setEndTime(new Date(date.getTime() + 2 * 60 * 60 * 1000));
                  }
                }
              }}
            />
          )}
        </View>

        {/* End Time (separate) */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>End Time</ThemedText>
          <Pressable
            style={[styles.pickerButton, { borderColor: borderColor + '40' }]}
            onPress={() => setShowEndPicker(true)}
          >
            <ThemedText style={styles.pickerIcon}>{'\u23F1\uFE0F'}</ThemedText>
            <ThemedText style={styles.pickerText}>{formatTime(endTime)}</ThemedText>
          </Pressable>
          {showEndPicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display="default"
              minuteInterval={5}
              onChange={(_, date) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (date) setEndTime(date);
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
            style={[styles.input, styles.textArea, { color: textColor, borderColor: borderColor + '40' }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes (optional)"
            placeholderTextColor={borderColor}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Alert toggle */}
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
  flex: { flex: 1 },
  scrollContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  field: { gap: 8 },
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
  typeRow: { flexDirection: 'row', gap: 10 },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  typeButtonSelected: { backgroundColor: '#3B82F6' },
  typeText: { fontSize: 15, fontWeight: '700', color: '#6B7280' },
  typeTextSelected: { color: 'white' },
  // Picker buttons
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  pickerIcon: { fontSize: 18 },
  pickerText: { fontSize: 16, fontWeight: '600' },
  // Color picker
  colorRow: { flexDirection: 'row', gap: 14 },
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
  colorCheck: { color: 'white', fontSize: 18, fontWeight: '900' },
  // Switch
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Buttons
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelText: { fontSize: 16, fontWeight: '700', color: '#6B7280' },
  saveBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  saveText: { fontSize: 16, fontWeight: '700', color: 'white' },
});
