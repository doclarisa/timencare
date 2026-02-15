import { useState, useEffect } from 'react';
import { StyleSheet, Modal, View, ScrollView, Pressable, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useDatabase } from '@/contexts/database-context';
import { type Client, type CalendarEvent } from '@/lib/database';

interface ClientProfileModalProps {
  visible: boolean;
  client: Client;
  onClose: () => void;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function ClientProfileModal({ visible, client, onClose }: ClientProfileModalProps) {
  const db = useDatabase();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...client });

  // Get upcoming shifts for this client
  const [shifts, setShifts] = useState<CalendarEvent[]>([]);
  useEffect(() => {
    try {
      const result = db.getAllSync<CalendarEvent>(
        `SELECT * FROM events WHERE clientName = ? ORDER BY startAt ASC LIMIT 5`,
        [client.name]
      );
      setShifts(result);
    } catch {
      setShifts([]);
    }
  }, [db, client.name]);

  const handleSave = () => {
    const now = new Date().toISOString();
    db.runSync(
      `UPDATE clients SET name = ?, notes = ?, medications = ?, updatedAt = ? WHERE id = ?`,
      [editData.name, editData.notes, editData.medications, now, client.id]
    );
    setIsEditing(false);
  };

  const handleClose = () => {
    setIsEditing(false);
    setEditData({ ...client });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.backButton}>
              <ThemedText style={styles.backText}>{'\u2190'} Back</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
              style={styles.editButton}
            >
              <ThemedText style={styles.editButtonText}>
                {isEditing ? '\u2705 Save' : '\u270F\uFE0F Edit'}
              </ThemedText>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: client.colorHex }]}>
                <ThemedText style={styles.avatarText}>
                  {client.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                </ThemedText>
              </View>
            </View>

            {/* Name */}
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={editData.name}
                onChangeText={(text) => setEditData({ ...editData, name: text })}
              />
            ) : (
              <ThemedText style={styles.name}>{client.name}</ThemedText>
            )}

            {/* Notes */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionLabel}>{'\uD83D\uDCCB'} Notes</ThemedText>
              {isEditing ? (
                <TextInput
                  style={styles.textArea}
                  value={editData.notes || ''}
                  onChangeText={(text) => setEditData({ ...editData, notes: text })}
                  placeholder="Add notes..."
                  multiline
                  numberOfLines={3}
                />
              ) : (
                <ThemedText style={styles.sectionValue}>{client.notes || 'No notes'}</ThemedText>
              )}
            </View>

            {/* Medications */}
            <View style={styles.medsSection}>
              <ThemedText style={styles.sectionLabel}>{'\uD83D\uDC8A'} Medications</ThemedText>
              {isEditing ? (
                <TextInput
                  style={styles.textArea}
                  value={editData.medications || ''}
                  onChangeText={(text) => setEditData({ ...editData, medications: text })}
                  placeholder="Enter medications..."
                  multiline
                  numberOfLines={3}
                />
              ) : (
                <ThemedText style={styles.sectionValue}>
                  {client.medications || 'None listed'}
                </ThemedText>
              )}
            </View>

            {/* Upcoming Shifts */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionLabel}>{'\uD83D\uDCC5'} Shifts</ThemedText>
              {shifts.length > 0 ? (
                shifts.map((shift) => (
                  <View key={shift.id} style={styles.shiftItem}>
                    <ThemedText style={styles.shiftDate}>{formatDate(shift.startAt)}</ThemedText>
                    <ThemedText style={[styles.shiftTime, { color: shift.colorHex }]}>
                      {formatTime(shift.startAt)} - {formatTime(shift.endAt)}
                    </ThemedText>
                  </View>
                ))
              ) : (
                <ThemedText style={styles.sectionValueGray}>No shifts scheduled</ThemedText>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  editButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  editButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
  },
  name: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  nameInput: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 10,
  },
  section: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  medsSection: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionValue: {
    fontSize: 16,
    color: '#1F2937',
  },
  sectionValueGray: {
    fontSize: 16,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  shiftItem: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  shiftDate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  shiftTime: {
    fontSize: 14,
    fontWeight: '600',
  },
});
