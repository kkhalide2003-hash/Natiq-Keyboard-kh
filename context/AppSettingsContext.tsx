import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

export type SoundMode = 'fatha' | 'kasra' | 'damma' | 'sukun';
export type ThemeMode = 'system' | 'light' | 'dark';

export type AppSettings = {
  soundMode: SoundMode;
  rate: number;
  themeMode: ThemeMode;
  keySound: boolean;
  haptics: boolean;
  autoSpeakWords: boolean;
};

const STORAGE_KEY = '@natiq/settings';
const defaults: AppSettings = {
  soundMode: 'fatha',
  rate: 0.85,
  themeMode: 'system',
  keySound: true,
  haptics: true,
  autoSpeakWords: true,
};

type SettingsContextValue = AppSettings & {
  hydrated: boolean;
  isDark: boolean;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [settings, setSettings] = useState<AppSettings>(defaults);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          setSettings({ ...defaults, ...(JSON.parse(stored) as Partial<AppSettings>) });
        }
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  const updateSettings = (patch: Partial<AppSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  };

  const resetSettings = () => {
    setSettings(defaults);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaults)).catch(() => undefined);
  };

  const value = useMemo(
    () => ({
      ...settings,
      hydrated,
      isDark: settings.themeMode === 'dark' || (settings.themeMode === 'system' && systemScheme === 'dark'),
      updateSettings,
      resetSettings,
    }),
    [hydrated, settings, systemScheme],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useAppSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useAppSettings must be used within SettingsProvider');
  return context;
}