import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'toy-avatar';
const EVENT = 'toy-avatar-changed';

export type AvatarGender = 'boy' | 'girl';

export interface AvatarProfile {
  gender: AvatarGender;
  name: string;
  shirt: string;
}

export const SHIRT_COLORS = ['#2e86ab', '#e63946', '#2e7d32', '#ff8fab', '#f4a261', '#8338ec'];

const readAvatar = (): AvatarProfile | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.gender === 'boy' || parsed.gender === 'girl')) {
      return {
        gender: parsed.gender,
        name: typeof parsed.name === 'string' ? parsed.name : '',
        shirt: typeof parsed.shirt === 'string' ? parsed.shirt : SHIRT_COLORS[0],
      };
    }
    return null;
  } catch {
    return null;
  }
};

export const useAvatar = () => {
  const [avatar, setAvatar] = useState<AvatarProfile | null>(readAvatar);

  useEffect(() => {
    const handler = () => setAvatar(readAvatar());
    window.addEventListener(EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const saveAvatar = useCallback((profile: AvatarProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const resetAvatar = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { avatar, saveAvatar, resetAvatar, hasAvatar: !!avatar };
};
