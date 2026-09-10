import { useCallback, useEffect, useRef, useState } from 'react';

type BrowserWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const playSoftChime = (context: AudioContext) => {
  const start = context.currentTime;

  [261.63, 329.63, 392].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const noteStart = start + index * 0.09;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.008, noteStart + 0.28);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 2.8);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + 2.9);
  });
};

export const useStoreAmbience = () => {
  const [muted, setMuted] = useState(
    () => typeof window !== 'undefined' && window.localStorage.getItem('storeAmbienceMuted') === 'true',
  );
  const contextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const stopAmbience = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (contextRef.current) {
      void contextRef.current.close();
      contextRef.current = null;
    }
  }, []);

  const startAmbience = useCallback((force = false) => {
    if ((!force && window.localStorage.getItem('storeAmbienceMuted') === 'true') || contextRef.current) {
      return;
    }

    const AudioContextConstructor =
      window.AudioContext || (window as BrowserWindow).webkitAudioContext;
    if (!AudioContextConstructor) return;

    const context = new AudioContextConstructor();
    contextRef.current = context;
    void context.resume().then(() => playSoftChime(context));
    timerRef.current = window.setInterval(() => playSoftChime(context), 7200);
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((wasMuted) => {
      const nextMuted = !wasMuted;
      window.localStorage.setItem('storeAmbienceMuted', String(nextMuted));
      if (nextMuted) stopAmbience();
      else startAmbience(true);
      return nextMuted;
    });
  }, [startAmbience, stopAmbience]);

  useEffect(() => stopAmbience, [stopAmbience]);

  return { muted, startAmbience, toggleMuted };
};
