import { ref } from 'vue';
import { LocalStorage } from 'quasar';

import resolvoIcon from 'src/assets/brand/resolvo-icon.png';

const SOUND_KEY = 'notificationSound';

const readSoundPreference = () => {
  try {
    return LocalStorage.getItem('notificationSound') !== false;
  } catch {
    return true;
  }
};

const soundEnabled = ref(readSoundPreference());
const desktopPermission = ref<NotificationPermission | 'unsupported'>(
  typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported',
);

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  audioContext ??= new AudioContext();
  return audioContext;
};

const playTone = (context: AudioContext, frequency: number, start: number, duration: number) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
};

const useAlerts = () => {
  const playChime = async () => {
    if (!soundEnabled.value) return;
    const context = getAudioContext();
    if (!context) return;
    try {
      if (context.state === 'suspended') await context.resume();
      const now = context.currentTime;
      playTone(context, 880, now, 0.18);
      playTone(context, 1320, now + 0.16, 0.28);
    } catch {
      return;
    }
  };

  const setSoundEnabled = (value: boolean) => {
    soundEnabled.value = value;
    try {
      LocalStorage.set(SOUND_KEY, value);
    } catch {
      return;
    }
    if (value) void playChime();
  };

  const requestDesktopPermission = async () => {
    if (desktopPermission.value === 'unsupported') return;
    desktopPermission.value = await Notification.requestPermission();
  };

  const showDesktopNotification = (title: string, body: string, onClick?: () => void) => {
    if (desktopPermission.value !== 'granted' || document.visibilityState === 'visible') return;
    try {
      const notification = new Notification(title, { body, icon: resolvoIcon, tag: 'resolvo' });
      notification.onclick = () => {
        window.focus();
        onClick?.();
        notification.close();
      };
    } catch {
      return;
    }
  };

  return {
    soundEnabled,
    desktopPermission,
    playChime,
    setSoundEnabled,
    requestDesktopPermission,
    showDesktopNotification,
  };
};

export default useAlerts;
