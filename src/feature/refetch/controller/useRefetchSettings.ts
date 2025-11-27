import { useState, useEffect } from 'react';
import { RefetchSettings, DEFAULT_REFETCH_SETTINGS } from '../model/refetchTypes';

const SETTINGS_KEY = 'refetch_settings';

/**
 * Hook to manage refetch settings stored in localStorage
 */
export const useRefetchSettings = () => {
  const [settings, setSettings] = useState<RefetchSettings>(DEFAULT_REFETCH_SETTINGS);

  /**
   * Loads settings from localStorage
   */
  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_REFETCH_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  /**
   * Saves settings to localStorage
   */
  const saveSettings = (newSettings: Partial<RefetchSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  /**
   * Updates last refetch time to now
   */
  const updateLastRefetchTime = () => {
    saveSettings({ lastRefetchTime: Date.now() });
  };

  /**
   * Checks if it's time to refetch based on frequency
   */
  const shouldRefetch = (): boolean => {
    if (!settings.lastRefetchTime) return true;

    const now = Date.now();
    const timeDiff = now - settings.lastRefetchTime;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    switch (settings.frequency) {
      case 'daily':
        return hoursDiff >= 24;
      case 'weekly':
        return hoursDiff >= 24 * 7;
      case 'monthly':
        return hoursDiff >= 24 * 30;
      default:
        return true;
    }
  };

  return {
    settings,
    saveSettings,
    updateLastRefetchTime,
    shouldRefetch,
  };
};
