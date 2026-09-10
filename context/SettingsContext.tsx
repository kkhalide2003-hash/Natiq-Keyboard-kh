import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type SoundMode = 'fatha' | 'kasra' | 'damma' | 'sukun';
export type AppTheme = 'system' | 'light' | 'dark';

export interface NatiqSettings {
  theme: AppTheme;
  rate: number;
  soundMode: SoundMode;
  autoSpeak: boolean;
  haptic: boolean;
  showEnglish: boolean;
}

const defaultSettings: NatiqSettings = {
  theme: 'system',
  rate: 0.85,
  soundMode: 'fatha',
  autoSpeak: true,
  haptic: true,
  showEnglish: true,
};

interface SettingsContextValue {
  settings: NatiqSettings;
  ready: boolean;
  updateSettings: (patch: Partial<NatiqSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);
const STORAGE_KEY = '@natiq/settings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<NatiqSettings>(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          setSettings({ ...defaultSettings, ...JSON.parse(stored) });
        }
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const updateSettings = (patch: Partial<NatiqSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  };

  const value = useMemo(() => ({ settings, ready, updateSettings }), [settings, ready]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}