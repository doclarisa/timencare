import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getNotificationPermissionStatus, requestNotificationPermissions } from '@/lib/notifications';
import { StatusColors } from '@/constants/theme';
import {
  previewAlarm,
  saveAlarmSound,
  loadAlarmSound,
  saveVolume,
  loadVolume,
  type AlarmSoundId,
} from '@/lib/alarm-sounds';

const ALARM_SOUNDS: { id: AlarmSoundId; name: string; description: string; icon: string }[] = [
  { id: 'chime', name: 'Chime', description: 'Pleasant bell tone', icon: '\uD83D\uDD14' },
  { id: 'bells', name: 'Bells', description: 'Church bells chord', icon: '\uD83D\uDD15' },
  { id: 'fanfare', name: 'Fanfare', description: 'Triumphant horn', icon: '\uD83C\uDFBA' },
  { id: 'xylophone', name: 'Xylophone', description: 'Playful melody', icon: '\uD83C\uDFB6' },
  { id: 'gentle', name: 'Gentle', description: 'Soft ascending', icon: '\uD83C\uDFB5' },
  { id: 'upbeat', name: 'Upbeat', description: 'Happy jingle', icon: '\uD83C\uDF89' },
  { id: 'beep', name: 'Beep', description: 'Classic beep', icon: '\uD83D\uDD0A' },
  { id: 'buzz', name: 'Buzz', description: 'Attention buzz', icon: '\uD83D\uDCE2' },
];

export default function ToolsScreen() {
  const router = useRouter();
  const { lock } = useAuth();
  const bgColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');

  const [notifStatus, setNotifStatus] = useState('unknown');
  const [shiftStartWarning, setShiftStartWarning] = useState(15);
  const [shiftEndWarning, setShiftEndWarning] = useState(15);
  const [selectedSound, setSelectedSound] = useState<AlarmSoundId>('chime');
  const [volume, setVolume] = useState(100);

  // Load saved settings
  useEffect(() => {
    getNotificationPermissionStatus().then(setNotifStatus);
    loadAlarmSound().then(setSelectedSound);
    loadVolume().then(setVolume);
  }, []);

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermissions();
    setNotifStatus(granted ? 'granted' : 'denied');
  };

  const handleSelectSound = async (soundId: AlarmSoundId) => {
    setSelectedSound(soundId);
    await saveAlarmSound(soundId);
    // Play a preview at the current volume
    await previewAlarm(soundId, volume / 100);
  };

  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);
    await saveVolume(newVolume);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <ThemedText style={styles.heading}>TOOLS</ThemedText>
        <ThemedText style={styles.subtitle}>Settings & Preferences</ThemedText>

        {/* Alert Settings Card */}
        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardHeaderIcon}>{'\uD83D\uDD14'}</ThemedText>
            <ThemedText style={styles.cardTitle}>Alert Settings</ThemedText>
          </View>

          {/* Shift Start Warning */}
          <View style={styles.settingSection}>
            <ThemedText style={styles.settingLabel}>
              {'\u23F0'} Alert Before Shift Starts
            </ThemedText>
            <View style={styles.controlRow}>
              <View style={styles.sliderTrack}>
                <View
                  style={[
                    styles.sliderFill,
                    {
                      width: `${((shiftStartWarning - 5) / 55) * 100}%`,
                      backgroundColor: '#FCD34D',
                    },
                  ]}
                />
              </View>
              <View style={styles.valueBadgeYellow}>
                <ThemedText style={styles.valueBadgeNumber}>{shiftStartWarning}</ThemedText>
                <ThemedText style={styles.valueBadgeUnit}>min</ThemedText>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <Pressable
                style={styles.adjustButton}
                onPress={() => setShiftStartWarning(Math.max(5, shiftStartWarning - 5))}
              >
                <ThemedText style={styles.adjustButtonText}>{'\u2212'}</ThemedText>
              </Pressable>
              <Pressable
                style={styles.adjustButton}
                onPress={() => setShiftStartWarning(Math.min(60, shiftStartWarning + 5))}
              >
                <ThemedText style={styles.adjustButtonText}>+</ThemedText>
              </Pressable>
            </View>
            <ThemedText style={styles.settingHelp}>
              You'll get an alert {shiftStartWarning} minutes before each shift starts
            </ThemedText>
          </View>

          {/* Shift End Warning */}
          <View style={styles.settingSection}>
            <ThemedText style={styles.settingLabel}>
              {'\u23F1\uFE0F'} Alert Before Shift Ends
            </ThemedText>
            <View style={styles.controlRow}>
              <View style={styles.sliderTrack}>
                <View
                  style={[
                    styles.sliderFill,
                    {
                      width: `${((shiftEndWarning - 5) / 55) * 100}%`,
                      backgroundColor: '#F87171',
                    },
                  ]}
                />
              </View>
              <View style={styles.valueBadgeRed}>
                <ThemedText style={styles.valueBadgeNumber}>{shiftEndWarning}</ThemedText>
                <ThemedText style={styles.valueBadgeUnit}>min</ThemedText>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <Pressable
                style={styles.adjustButton}
                onPress={() => setShiftEndWarning(Math.max(5, shiftEndWarning - 5))}
              >
                <ThemedText style={styles.adjustButtonText}>{'\u2212'}</ThemedText>
              </Pressable>
              <Pressable
                style={styles.adjustButton}
                onPress={() => setShiftEndWarning(Math.min(60, shiftEndWarning + 5))}
              >
                <ThemedText style={styles.adjustButtonText}>+</ThemedText>
              </Pressable>
            </View>
            <ThemedText style={styles.settingHelp}>
              You'll get an alert {shiftEndWarning} minutes before each shift ends
            </ThemedText>
          </View>
        </ThemedView>

        {/* Sound Settings Card */}
        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardHeaderIcon}>{'\uD83D\uDD0A'}</ThemedText>
            <ThemedText style={styles.cardTitle}>Sound Settings</ThemedText>
          </View>

          {/* Volume */}
          <View style={styles.settingSection}>
            <ThemedText style={styles.settingLabel}>Volume: {volume}%</ThemedText>
            <View style={styles.buttonRow}>
              <Pressable
                style={styles.adjustButton}
                onPress={() => handleVolumeChange(Math.max(0, volume - 10))}
              >
                <ThemedText style={styles.adjustButtonText}>{'\u2212'}</ThemedText>
              </Pressable>
              <View style={styles.volumeBar}>
                <View style={[styles.volumeFill, { width: `${volume}%` }]} />
              </View>
              <Pressable
                style={styles.adjustButton}
                onPress={() => handleVolumeChange(Math.min(100, volume + 10))}
              >
                <ThemedText style={styles.adjustButtonText}>+</ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Sound Selection */}
          <ThemedText style={styles.settingLabel}>Alert Sound</ThemedText>
          <ThemedText style={styles.settingHelp}>Tap to preview and select</ThemedText>
          <View style={styles.soundGrid}>
            {ALARM_SOUNDS.map((sound) => (
              <Pressable
                key={sound.id}
                onPress={() => handleSelectSound(sound.id)}
                style={[
                  styles.soundButton,
                  selectedSound === sound.id && styles.soundButtonSelected,
                ]}
              >
                <ThemedText style={styles.soundIcon}>
                  {selectedSound === sound.id ? '\uD83D\uDD0A' : sound.icon}
                </ThemedText>
                <ThemedText style={styles.soundName}>{sound.name}</ThemedText>
                <ThemedText style={styles.soundDesc}>{sound.description}</ThemedText>
              </Pressable>
            ))}
          </View>
        </ThemedView>

        {/* App Settings Card */}
        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardHeaderIcon}>{'\u2699\uFE0F'}</ThemedText>
            <ThemedText style={styles.cardTitle}>App Settings</ThemedText>
          </View>

          {/* Notifications */}
          <Pressable style={styles.settingRow} onPress={handleRequestNotifications}>
            <ThemedText style={styles.settingRowLabel}>Notifications</ThemedText>
            <ThemedText
              style={[
                styles.settingRowValue,
                {
                  color:
                    notifStatus === 'granted'
                      ? StatusColors.success
                      : notifStatus === 'denied'
                      ? StatusColors.danger
                      : borderColor,
                },
              ]}
            >
              {notifStatus === 'granted' ? 'Enabled' : notifStatus === 'denied' ? 'Denied' : 'Tap to enable'}
            </ThemedText>
          </Pressable>

          {/* Change PIN */}
          <Pressable style={styles.settingRow} onPress={() => router.push('/settings')}>
            <ThemedText style={styles.settingRowLabel}>Change PIN</ThemedText>
            <ThemedText style={styles.settingRowChevron}>{'\u276F'}</ThemedText>
          </Pressable>

          {/* Lock App */}
          <Pressable style={[styles.settingRow, { borderBottomWidth: 0 }]} onPress={() => lock()}>
            <ThemedText style={[styles.settingRowLabel, { color: StatusColors.danger }]}>
              Lock App
            </ThemedText>
          </Pressable>
        </ThemedView>

        {/* Version Footer */}
        <View style={styles.footer}>
          <ThemedText style={[styles.version, { color: borderColor }]}>
            TimeNCare v1.0.0
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heading: {
    fontSize: 42,
    fontWeight: '900',
    color: '#10B981',
    textAlign: 'center',
    paddingTop: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.5,
    textAlign: 'center',
    marginBottom: 20,
  },
  // Cards
  card: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  cardHeaderIcon: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  // Setting sections
  settingSection: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sliderTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 5,
  },
  valueBadgeYellow: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#FCD34D',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    minWidth: 80,
    justifyContent: 'center',
  },
  valueBadgeRed: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#F87171',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    minWidth: 80,
    justifyContent: 'center',
  },
  valueBadgeNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
  },
  valueBadgeUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  adjustButton: {
    backgroundColor: '#F3F4F6',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4B5563',
  },
  settingHelp: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  // Volume
  volumeBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  // Sound grid
  soundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  soundButton: {
    width: '47%',
    borderWidth: 3,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  soundButtonSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  soundIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  soundName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  soundDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  // App settings rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingRowLabel: {
    fontSize: 17,
  },
  settingRowValue: {
    fontSize: 15,
  },
  settingRowChevron: {
    fontSize: 16,
    color: '#6B7280',
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  version: {
    fontSize: 14,
  },
});
