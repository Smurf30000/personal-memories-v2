import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/feature/authentication/model/firebaseConfig';
import { UserSettings } from '../model/settingsTypes';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to manage user settings in Firestore
 */
export const useUserSettings = (userId: string | undefined) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches user settings from Firestore
   */
  const fetchSettings = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setSettings({
          userId,
          refetchFrequency: data.refetchFrequency || 'daily',
          cacheSize: data.cacheSize || 100,
          memoryCount: data.memoryCount || 8,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      } else {
        // Create default settings
        const defaultSettings: Omit<UserSettings, 'createdAt' | 'updatedAt'> = {
          userId,
          refetchFrequency: 'daily',
          cacheSize: 100,
          memoryCount: 8,
        };
        await saveSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error Loading Settings",
        description: "Failed to load your settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Saves user settings to Firestore
   */
  const saveSettings = async (newSettings: Partial<Omit<UserSettings, 'createdAt' | 'updatedAt'>>) => {
    if (!userId) return;

    try {
      const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
      const settingsDoc = await getDoc(settingsRef);

      const dataToSave = {
        ...newSettings,
        userId,
        updatedAt: serverTimestamp(),
        ...(settingsDoc.exists() ? {} : { createdAt: serverTimestamp() }),
      };

      await setDoc(settingsRef, dataToSave, { merge: true });

      // Update local state
      setSettings(prev => ({
        ...prev!,
        ...newSettings,
        updatedAt: new Date(),
      }));

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error Saving Settings",
        description: "Failed to save your preferences",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [userId]);

  return {
    settings,
    loading,
    saveSettings,
    refetch: fetchSettings,
  };
};
