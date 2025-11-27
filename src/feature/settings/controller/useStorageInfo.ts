import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/feature/authentication/model/firebaseConfig';
import { StorageInfo, CacheInfo } from '../model/settingsTypes';
import { getCacheSize, getCachedMemories } from '@/feature/refetch/model/cacheDb';

/**
 * Hook to fetch storage and cache information
 */
export const useStorageInfo = (userId: string | undefined) => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    totalMediaCount: 0,
    totalStorageBytes: 0,
    totalStorageMB: 0,
    totalStorageGB: 0,
  });
  const [cacheInfo, setCacheInfo] = useState<CacheInfo>({
    cacheBytes: 0,
    cacheMB: 0,
    cacheItemCount: 0,
  });
  const [loading, setLoading] = useState(true);

  /**
   * Fetches storage information from Firestore
   */
  const fetchStorageInfo = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all media to calculate total storage
      const mediaQuery = query(
        collection(db, 'media'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(mediaQuery);
      
      let totalBytes = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        totalBytes += data.fileSize || 0;
      });

      const totalMB = totalBytes / (1024 * 1024);
      const totalGB = totalMB / 1024;

      setStorageInfo({
        totalMediaCount: snapshot.size,
        totalStorageBytes: totalBytes,
        totalStorageMB: Math.round(totalMB * 100) / 100,
        totalStorageGB: Math.round(totalGB * 100) / 100,
      });

      // Fetch cache info
      const cacheBytes = await getCacheSize();
      const cached = await getCachedMemories();
      const cacheMB = cacheBytes / (1024 * 1024);

      setCacheInfo({
        cacheBytes,
        cacheMB: Math.round(cacheMB * 100) / 100,
        cacheItemCount: cached.length,
      });
    } catch (error) {
      console.error('Error fetching storage info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageInfo();
  }, [userId]);

  return {
    storageInfo,
    cacheInfo,
    loading,
    refetch: fetchStorageInfo,
  };
};
