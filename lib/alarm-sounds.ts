import * as SecureStore from 'expo-secure-store';

// Lazy-load expo-av to avoid crash if native module isn't available
let Audio: typeof import('expo-av').Audio | null = null;
try {
  Audio = require('expo-av').Audio;
} catch (err) {
  console.warn('expo-av not available, alarm sounds will use vibration only:', err);
}

const SOUND_KEY = 'alarm_sound';
const VOLUME_KEY = 'alarm_volume';

export type AlarmSoundId = 'chime' | 'beep' | 'buzz' | 'gentle' | 'bells' | 'fanfare' | 'xylophone' | 'upbeat';

/** Generates a WAV file buffer with a simple tone */
function generateWav(
  frequency: number,
  durationMs: number,
  sampleRate = 22050,
  waveform: 'sine' | 'square' | 'triangle' = 'sine',
  fadeMs = 50,
): string {
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const fadeSamples = Math.floor((sampleRate * fadeMs) / 1000);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let val = 0;

    if (waveform === 'sine') {
      val = Math.sin(2 * Math.PI * frequency * t);
    } else if (waveform === 'square') {
      val = Math.sin(2 * Math.PI * frequency * t) > 0 ? 0.8 : -0.8;
    } else if (waveform === 'triangle') {
      const period = sampleRate / frequency;
      const pos = i % period;
      val = (2 * Math.abs(2 * (pos / period) - 1) - 1) * 0.8;
    }

    // Fade in/out to avoid clicks
    if (i < fadeSamples) {
      val *= i / fadeSamples;
    } else if (i > numSamples - fadeSamples) {
      val *= (numSamples - i) / fadeSamples;
    }

    samples[i] = val;
  }

  // Convert to 16-bit PCM
  const pcmData = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    pcmData[i] = Math.max(-32768, Math.min(32767, Math.floor(samples[i] * 32767)));
  }

  // Build WAV header
  const dataSize = pcmData.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const uint8 = new Uint8Array(buffer);
  const pcmBytes = new Uint8Array(pcmData.buffer);
  uint8.set(pcmBytes, 44);

  // Convert to base64
  return uint8ToBase64(uint8);
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Generate multi-tone sequences for different alarm sounds */
function generateChimeWav(): string {
  // Two ascending tones: C5 then E5
  const sr = 22050;
  const tone1 = generateToneSamples(523.25, 300, sr, 'sine'); // C5
  const silence = new Float32Array(Math.floor(sr * 0.05));
  const tone2 = generateToneSamples(659.25, 400, sr, 'sine'); // E5

  const total = tone1.length + silence.length + tone2.length;
  const combined = new Float32Array(total);
  combined.set(tone1, 0);
  combined.set(silence, tone1.length);
  combined.set(tone2, tone1.length + silence.length);

  return samplesToWavBase64(combined, sr);
}

function generateBeepWav(): string {
  // Three short beeps
  const sr = 22050;
  const beep = generateToneSamples(880, 150, sr, 'square');
  const gap = new Float32Array(Math.floor(sr * 0.1));

  const total = (beep.length + gap.length) * 3;
  const combined = new Float32Array(total);
  let offset = 0;
  for (let i = 0; i < 3; i++) {
    combined.set(beep, offset);
    offset += beep.length;
    combined.set(gap, offset);
    offset += gap.length;
  }

  return samplesToWavBase64(combined, sr);
}

function generateBuzzWav(): string {
  // Low continuous buzz
  return generateWav(220, 800, 22050, 'square');
}

function generateGentleWav(): string {
  // Soft ascending melody
  const sr = 22050;
  const notes = [392, 440, 494]; // G4, A4, B4
  const parts: Float32Array[] = [];

  for (const freq of notes) {
    parts.push(generateToneSamples(freq, 250, sr, 'triangle'));
    parts.push(new Float32Array(Math.floor(sr * 0.05)));
  }

  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const combined = new Float32Array(total);
  let offset = 0;
  for (const part of parts) {
    combined.set(part, offset);
    offset += part.length;
  }

  return samplesToWavBase64(combined, sr);
}

function generateToneSamples(
  frequency: number,
  durationMs: number,
  sampleRate: number,
  waveform: 'sine' | 'square' | 'triangle',
): Float32Array {
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const fadeSamples = Math.floor(sampleRate * 0.02);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let val = 0;

    if (waveform === 'sine') {
      val = Math.sin(2 * Math.PI * frequency * t);
    } else if (waveform === 'square') {
      val = Math.sin(2 * Math.PI * frequency * t) > 0 ? 0.7 : -0.7;
    } else if (waveform === 'triangle') {
      const period = sampleRate / frequency;
      const pos = i % period;
      val = (2 * Math.abs(2 * (pos / period) - 1) - 1) * 0.7;
    }

    if (i < fadeSamples) val *= i / fadeSamples;
    else if (i > numSamples - fadeSamples) val *= (numSamples - i) / fadeSamples;

    samples[i] = val;
  }

  return samples;
}

function samplesToWavBase64(samples: Float32Array, sampleRate: number): string {
  const pcmData = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    pcmData[i] = Math.max(-32768, Math.min(32767, Math.floor(samples[i] * 32767)));
  }

  const dataSize = pcmData.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const uint8 = new Uint8Array(buffer);
  const pcmBytes = new Uint8Array(pcmData.buffer);
  uint8.set(pcmBytes, 44);

  return uint8ToBase64(uint8);
}

function generateBellsWav(): string {
  // Church bells: descending major chord C5, E5, G5, C6
  const sr = 22050;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  const parts: Float32Array[] = [];

  for (const freq of notes) {
    parts.push(generateToneSamples(freq, 350, sr, 'sine'));
    parts.push(new Float32Array(Math.floor(sr * 0.08)));
  }

  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const combined = new Float32Array(total);
  let offset = 0;
  for (const part of parts) {
    combined.set(part, offset);
    offset += part.length;
  }
  return samplesToWavBase64(combined, sr);
}

function generateFanfareWav(): string {
  // Triumphant fanfare: C5, E5, G5, hold C6
  const sr = 22050;
  const parts: Float32Array[] = [];

  parts.push(generateToneSamples(523.25, 150, sr, 'square')); // C5 short
  parts.push(new Float32Array(Math.floor(sr * 0.03)));
  parts.push(generateToneSamples(659.25, 150, sr, 'square')); // E5 short
  parts.push(new Float32Array(Math.floor(sr * 0.03)));
  parts.push(generateToneSamples(783.99, 150, sr, 'square')); // G5 short
  parts.push(new Float32Array(Math.floor(sr * 0.05)));
  parts.push(generateToneSamples(1046.5, 500, sr, 'square')); // C6 long

  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const combined = new Float32Array(total);
  let offset = 0;
  for (const part of parts) {
    combined.set(part, offset);
    offset += part.length;
  }
  return samplesToWavBase64(combined, sr);
}

function generateXylophoneWav(): string {
  // Playful xylophone: ascending pentatonic scale
  const sr = 22050;
  const notes = [523.25, 587.33, 659.25, 783.99, 880]; // C5 D5 E5 G5 A5
  const parts: Float32Array[] = [];

  for (const freq of notes) {
    parts.push(generateToneSamples(freq, 120, sr, 'triangle'));
    parts.push(new Float32Array(Math.floor(sr * 0.04)));
  }

  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const combined = new Float32Array(total);
  let offset = 0;
  for (const part of parts) {
    combined.set(part, offset);
    offset += part.length;
  }
  return samplesToWavBase64(combined, sr);
}

function generateUpbeatWav(): string {
  // Upbeat melody: happy jingle pattern
  const sr = 22050;
  const melody = [
    { freq: 523.25, dur: 120 }, // C5
    { freq: 659.25, dur: 120 }, // E5
    { freq: 783.99, dur: 120 }, // G5
    { freq: 659.25, dur: 120 }, // E5
    { freq: 783.99, dur: 120 }, // G5
    { freq: 1046.5, dur: 300 }, // C6
  ];
  const parts: Float32Array[] = [];

  for (const note of melody) {
    parts.push(generateToneSamples(note.freq, note.dur, sr, 'sine'));
    parts.push(new Float32Array(Math.floor(sr * 0.03)));
  }

  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const combined = new Float32Array(total);
  let offset = 0;
  for (const part of parts) {
    combined.set(part, offset);
    offset += part.length;
  }
  return samplesToWavBase64(combined, sr);
}

// Sound generator map
const SOUND_GENERATORS: Record<AlarmSoundId, () => string> = {
  chime: generateChimeWav,
  beep: generateBeepWav,
  buzz: generateBuzzWav,
  gentle: generateGentleWav,
  bells: generateBellsWav,
  fanfare: generateFanfareWav,
  xylophone: generateXylophoneWav,
  upbeat: generateUpbeatWav,
};

// Cached sound objects
let currentSound: any = null;
let loopInterval: ReturnType<typeof setInterval> | null = null;

/** Play a specific alarm sound, looping until stopped */
export async function playAlarm(soundId: AlarmSoundId, volume = 1.0): Promise<void> {
  await stopAlarm();

  if (!Audio) {
    console.warn('expo-av not available, skipping alarm sound');
    return;
  }

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });

    const base64Wav = SOUND_GENERATORS[soundId]();
    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/wav;base64,${base64Wav}` },
      { volume, isLooping: false }
    );

    currentSound = sound;
    await sound.playAsync();

    // Loop: replay every 2 seconds
    loopInterval = setInterval(async () => {
      try {
        if (currentSound) {
          await currentSound.setPositionAsync(0);
          await currentSound.playAsync();
        }
      } catch {
        // Sound may have been unloaded
      }
    }, 2000);
  } catch (err) {
    console.warn('Failed to play alarm:', err);
  }
}

/** Stop the currently playing alarm */
export async function stopAlarm(): Promise<void> {
  if (loopInterval) {
    clearInterval(loopInterval);
    loopInterval = null;
  }

  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {
      // Already unloaded
    }
    currentSound = null;
  }
}

/** Play a short preview of an alarm sound (no loop) */
export async function previewAlarm(soundId: AlarmSoundId, volume = 1.0): Promise<void> {
  await stopAlarm();

  if (!Audio) {
    console.warn('expo-av not available, skipping alarm preview');
    return;
  }

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    const base64Wav = SOUND_GENERATORS[soundId]();
    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/wav;base64,${base64Wav}` },
      { volume }
    );

    currentSound = sound;
    await sound.playAsync();

    // Auto-cleanup after playback
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
        if (currentSound === sound) currentSound = null;
      }
    });
  } catch (err) {
    console.warn('Failed to preview alarm:', err);
  }
}

/** Save selected alarm sound to persistent storage */
export async function saveAlarmSound(soundId: AlarmSoundId): Promise<void> {
  await SecureStore.setItemAsync(SOUND_KEY, soundId);
}

/** Load saved alarm sound (defaults to 'chime') */
export async function loadAlarmSound(): Promise<AlarmSoundId> {
  const stored = await SecureStore.getItemAsync(SOUND_KEY);
  if (stored && stored in SOUND_GENERATORS) return stored as AlarmSoundId;
  return 'chime';
}

/** Save volume to persistent storage (0-100) */
export async function saveVolume(volume: number): Promise<void> {
  await SecureStore.setItemAsync(VOLUME_KEY, String(volume));
}

/** Load saved volume (defaults to 100) */
export async function loadVolume(): Promise<number> {
  const stored = await SecureStore.getItemAsync(VOLUME_KEY);
  if (stored) {
    const val = parseInt(stored, 10);
    if (!isNaN(val) && val >= 0 && val <= 100) return val;
  }
  return 100;
}
