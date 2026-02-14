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
import { PresetEventColors } from '@/constants/theme';
import { type EventType, type CalendarEvent } from '@/lib/database';

const EVENT_TYPES: EventType[] = ['WORK', 'MEDS', 'OTHER'];

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

export function EventForm({ initialDate, existingEvent, onSave, onCancel }: EventFormProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const tint = useThemeColor({}, 'tint');

  const defaultStart = existingEvent
    ? new Date(existingEvent.startAt)
    : (() => {
        const d = new Date(initialDate + 'T09:00:00');
        return d;
      })();
  const defaultEnd = existingEvent
    ? new Date(existingEvent.endAt)
    : (() => {
        const d = new Date(initialDate + 'T17:00:00');
        return d;
      })();

  const [clientName, setClientName] = useState(existingEvent?.clientName ?? '');
  const [type, setType] = useState<EventType>(existingEvent?.type ?? 'WORK');
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [notes, setNotes] = useState(existingEvent?.notes ?? '');
  const [colorHex, setColorHex] = useState(existingEvent?.colorHex ?? PresetEventColors[0]);
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
    date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
          <ThemedText style={styles.label}>Client / Title</ThemedText>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: borderColor + '40' }]}
            value={clientName}
            onChangeText={setClientName}
            placeholder="e.g. Jane Smith"
            placeholderTextColor={borderColor}
            autoFocus={!existingEvent}
          />
        </View>

        {/* Event Type */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Type</ThemedText>
          <View style={styles.segmentRow}>
            {EVENT_TYPES.map((t) => (
              <Pressable
                key={t}
                style={[
                  styles.segmentButton,
                  { borderColor: borderColor + '40' },
                  type === t && { backgroundColor: tint, borderColor: tint },
                ]}
                onPress={() => setType(t)}
              >
                <ThemedText
                  style={[
                    styles.segmentText,
                    type === t && { color: '#fff', fontWeight: '600' },
                  ]}
                >
                  {t}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Start Time */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Start</ThemedText>
          <Pressable
            style={[styles.input, { borderColor: borderColor + '40' }]}
            onPress={() => setShowStartPicker(true)}
          >
            <ThemedText>{formatDateTime(startDate)}</ThemedText>
          </Pressable>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="datetime"
              onChange={(_, date) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (date) setStartDate(date);
              }}
            />
          )}
        </View>

        {/* End Time */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>End</ThemedText>
          <Pressable
            style={[styles.input, { borderColor: borderColor + '40' }]}
            onPress={() => setShowEndPicker(true)}
          >
            <ThemedText>{formatDateTime(endDate)}</ThemedText>
          </Pressable>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="datetime"
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
            {PresetEventColors.map((c) => (
              <Pressable
                key={c}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  colorHex === c && styles.colorSelected,
                ]}
                onPress={() => setColorHex(c)}
              />
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
            placeholder="Optional notes..."
            placeholderTextColor={borderColor}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Notify toggle (MEDS type) */}
        {type === 'MEDS' && (
          <View style={[styles.field, styles.switchRow]}>
            <ThemedText style={styles.label}>Notify at start time</ThemedText>
            <Switch
              value={notifyEnabled}
              onValueChange={setNotifyEnabled}
              trackColor={{ true: tint }}
            />
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.btn, { borderColor: borderColor + '40' }]}
            onPress={onCancel}
          >
            <ThemedText style={styles.btnText}>Cancel</ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.btn,
              styles.btnPrimary,
              { backgroundColor: tint },
              !clientName.trim() && { opacity: 0.5 },
            ]}
            onPress={handleSave}
            disabled={!clientName.trim()}
          >
            <ThemedText style={[styles.btnText, { color: '#fff' }]}>
              {existingEvent ? 'Update' : 'Create'}
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
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 14,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnPrimary: {
    borderWidth: 0,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
