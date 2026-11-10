import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useApp } from '@/src/store/store';

export function SoundHost() {
  const { settings, timer, celebration } = useApp();
  const players = useRef<{ rain?: { pause: () => void; release: () => void }; brown?: { pause: () => void; release: () => void } }>({});
  const chimed = useRef<string | null>(null);

  useEffect(() => {
    let dead = false;
    const running = timer?.status === 'running';
    const rainOn = running && settings.rain > 0.02;
    const brownOn = running && settings.brown > 0.02;
    void (async () => {
      if (Platform.OS === 'web' && !rainOn && !brownOn) return;
      try {
        const { createAudioPlayer, setAudioModeAsync } = await import('expo-audio');
        if (dead) return;
        if (rainOn || brownOn) {
          await setAudioModeAsync({
            playsInSilentMode: true,
            // Session-end sound is a scheduled notification, so loops stay in the foreground.
            shouldPlayInBackground: false,
            interruptionMode: 'mixWithOthers',
          });
        }
        const ensure = (key: 'rain' | 'brown', file: number, volume: number, on: boolean) => {
          const existing = players.current[key];
          if (!on) {
            existing?.pause();
            existing?.release();
            players.current[key] = undefined;
            return;
          }
          if (!existing) {
            const player = createAudioPlayer(file);
            player.loop = true;
            player.volume = volume;
            player.play();
            players.current[key] = player;
          } else {
            (existing as { volume?: number }).volume = volume;
          }
        };
        ensure('rain', require('../../assets/sounds/rain.wav'), settings.rain, rainOn);
        ensure('brown', require('../../assets/sounds/brown.wav'), settings.brown, brownOn);
      } catch {
        // Audio is optional if the native player is unavailable.
      }
    })();
    return () => {
      dead = true;
    };
  }, [settings.rain, settings.brown, timer?.status]);

  useEffect(() => {
    if (!celebration || !settings.sound) return;
    if (celebration.code !== 'finished' && celebration.code !== 'break-done') return;
    if (chimed.current === celebration.id) return;
    chimed.current = celebration.id;
    void (async () => {
      try {
        const { createAudioPlayer } = await import('expo-audio');
        const player = createAudioPlayer(require('../../assets/sounds/chime.wav'));
        player.volume = 0.6;
        player.play();
        setTimeout(() => player.release(), 2200);
      } catch {
        // Ignore missing audio.
      }
    })();
  }, [celebration, settings.sound]);

  useEffect(() => {
    return () => {
      players.current.rain?.release();
      players.current.brown?.release();
    };
  }, []);

  return null;
}
