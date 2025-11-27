import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/feature/authentication/model/firebaseConfig';
import { MediaMetadata } from '@/feature/media/model/mediaTypes';
import { CachedMemory } from '../model/refetchTypes';
import { saveCachedMemories, getCachedMemories, clearCachedMemories } from '../model/cacheDb';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to manage memory refetch functionality
 */
export const useMemoryRefetch = (userId: string | undefined) => {
  const [memories, setMemories] = useState<MediaMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [settings, setSettings] = useState({ frequency: 'daily', lastRefetchTime: null, memoryCount: 8 });

  /**
   * Fetches settings from Firestore
   */
  const fetchSettings = async () => {
    if (!userId) return;
    
    try {
      const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setSettings({
          frequency: data.refetchFrequency || 'daily',
          lastRefetchTime: data.lastRefetchTime || null,
          memoryCount: data.memoryCount || 8,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [userId]);

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

  /**
   * Updates last refetch time in Firestore
   */
  const updateLastRefetchTime = async () => {
    if (!userId) return;
    
    try {
      const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
      await setDoc(settingsRef, { lastRefetchTime: Date.now() }, { merge: true });
      setSettings(prev => ({ ...prev, lastRefetchTime: Date.now() }));
    } catch (error) {
      console.error('Error updating refetch time:', error);
    }
  };

  /**
   * Monitors online/offline status
   */
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Selects random media IDs with video limit
   */
  const selectRandomMedia = (allMedia: MediaMetadata[], count: number): MediaMetadata[] => {
    // Separate images and videos
    const images = allMedia.filter(m => m.fileType.startsWith('image/'));
    const videos = allMedia.filter(m => m.fileType.startsWith('video/'));

    // Calculate max videos (50% of selection)
    const maxVideos = Math.floor(count * 0.5);
    const minImages = count - maxVideos;

    // Shuffle arrays
    const shuffledImages = images.sort(() => Math.random() - 0.5);
    const shuffledVideos = videos.sort(() => Math.random() - 0.5);

    // Select videos (up to max)
    const selectedVideos = shuffledVideos.slice(0, Math.min(maxVideos, videos.length));
    
    // Select remaining slots with images
    const remainingSlots = count - selectedVideos.length;
    const selectedImages = shuffledImages.slice(0, Math.min(remainingSlots, images.length));

    // Combine and shuffle final selection
    const selected = [...selectedImages, ...selectedVideos];
    return selected.sort(() => Math.random() - 0.5);
  };

  /**
   * Fetches random memories from Firestore
   */
  const fetchRandomMemories = async (): Promise<MediaMetadata[]> => {
    if (!userId) return [];

    try {
      // Fetch all media IDs
      const mediaQuery = query(
        collection(db, 'media'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(mediaQuery);
      const allMedia: MediaMetadata[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        allMedia.push({
          id: doc.id,
          fileName: data.fileName,
          fileType: data.fileType,
          fileSize: data.fileSize,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          downloadUrl: data.downloadUrl,
          base64Data: data.base64Data,
          userId: data.userId,
        });
      });

      if (allMedia.length === 0) {
        return [];
      }

      // Select random media
      const randomSelection = selectRandomMedia(allMedia, settings.memoryCount);
      
      return randomSelection;
    } catch (error) {
      console.error('Error fetching random memories:', error);
      throw error;
    }
  };

  /**
   * Downloads media files and caches them in IndexedDB
   */
  const cacheMediaFiles = async (mediaList: MediaMetadata[]): Promise<void> => {
    try {
      const cachedMemories: CachedMemory[] = [];
      
      for (const media of mediaList) {
        try {
          let blob: Blob;
          
          // If base64 data exists, convert it to blob directly
          if (media.base64Data) {
            const byteCharacters = atob(media.base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            blob = new Blob([byteArray], { type: media.fileType });
          } else if (media.downloadUrl) {
            // Fallback to downloading from URL (old storage method)
            const response = await fetch(media.downloadUrl);
            blob = await response.blob();
          } else {
            console.error(`No data source for ${media.fileName}`);
            continue;
          }
          
          cachedMemories.push({
            id: media.id,
            fileName: media.fileName,
            fileType: media.fileType,
            fileSize: media.fileSize,
            uploadedAt: media.uploadedAt.toISOString(),
            downloadUrl: media.downloadUrl || '',
            blobData: blob,
            cachedAt: Date.now(),
          });
        } catch (error) {
          console.error(`Error caching ${media.fileName}:`, error);
          // Continue with other files even if one fails
        }
      }
      
      // Clear old cache and save new memories
      await clearCachedMemories();
      await saveCachedMemories(cachedMemories);
    } catch (error) {
      console.error('Error caching media files:', error);
      throw error;
    }
  };

  /**
   * Loads memories from cache
   */
  const loadFromCache = async (): Promise<MediaMetadata[]> => {
    try {
      const cached = await getCachedMemories();
      
      // Convert cached blobs back to base64 for display
      const memoriesWithBase64 = await Promise.all(
        cached.map(async (c) => {
          let base64Data: string | undefined;
          
          if (c.blobData) {
            // Convert blob to base64
            const reader = new FileReader();
            base64Data = await new Promise<string>((resolve) => {
              reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]); // Remove data URL prefix
              };
              reader.readAsDataURL(c.blobData!);
            });
          }
          
          return {
            id: c.id,
            fileName: c.fileName,
            fileType: c.fileType,
            fileSize: c.fileSize,
            uploadedAt: new Date(c.uploadedAt),
            downloadUrl: c.downloadUrl,
            base64Data,
            userId: userId || '',
          };
        })
      );
      
      return memoriesWithBase64;
    } catch (error) {
      console.error('Error loading from cache:', error);
      return [];
    }
  };

  /**
   * Performs a refetch operation
   */
  const refetch = useCallback(async (force = false) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Check if we need to refetch
      if (!force && !shouldRefetch()) {
        // Load from cache
        const cached = await loadFromCache();
        if (cached.length > 0) {
          setMemories(cached);
          setLoading(false);
          return;
        }
      }

      // If offline, load from cache
      if (!isOnline) {
        const cached = await loadFromCache();
        setMemories(cached);
        setLoading(false);
        
        if (cached.length === 0) {
          toast({
            title: "You're Offline",
            description: "No cached memories available. Connect to the internet to load new memories.",
            variant: "destructive",
          });
        }
        return;
      }

      // Fetch new random memories
      const randomMemories = await fetchRandomMemories();
      
      if (randomMemories.length === 0) {
        setMemories([]);
        setLoading(false);
        return;
      }

      setMemories(randomMemories);
      
      // Cache the files in background
      cacheMediaFiles(randomMemories).catch(err => {
        console.error('Background caching failed:', err);
      });
      
      // Update last refetch time
      updateLastRefetchTime();
      
      if (force) {
        toast({
          title: "Memories Refreshed",
          description: `${randomMemories.length} new memories loaded`,
        });
      }
    } catch (error) {
      console.error('Error during refetch:', error);
      
      // Try to load from cache on error
      const cached = await loadFromCache();
      setMemories(cached);
      
      toast({
        title: "Error Loading Memories",
        description: cached.length > 0 
          ? "Showing cached memories" 
          : "Failed to load memories. Please try again.",
        variant: cached.length > 0 ? "default" : "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, isOnline, settings, shouldRefetch, updateLastRefetchTime]);

  /**
   * Auto-refetch on mount if needed
   */
  useEffect(() => {
    refetch(false);
  }, [userId]);

  return {
    memories,
    loading,
    isOnline,
    refetch: () => refetch(true),
  };
};
