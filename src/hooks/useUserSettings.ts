import { useState, useCallback, useEffect } from 'react';

export interface UserSettings {
  metaMensal: number;
  darkMode: boolean;
  activeTab: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  metaMensal: 0,
  darkMode: false,
  activeTab: 'assinaturas'
};

export function useUserSettings(userId?: string) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/settings/${userId}`, {
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}` }
      });
      const data = await res.json();
      
      if (data.success && data.settings) {
        setSettings({
          metaMensal: data.settings.metaMensal ?? DEFAULT_SETTINGS.metaMensal,
          darkMode: data.settings.darkMode ?? DEFAULT_SETTINGS.darkMode,
          activeTab: data.settings.activeTab ?? DEFAULT_SETTINGS.activeTab
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!userId) return;

    setIsSaving(true);
    try {
      await fetch(`/api/settings/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        },
        body: JSON.stringify(updates)
      });
      
      setSettings(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  }, [userId]);

  const updateMetaMensal = useCallback((value: number) => {
    setSettings(prev => ({ ...prev, metaMensal: value }));
    saveSettings({ metaMensal: value });
  }, [saveSettings]);

  return {
    settings,
    isLoading,
    isSaving,
    updateMetaMensal,
    saveSettings,
  };
}