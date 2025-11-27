import { RefetchFrequency } from '@/feature/refetch/model/refetchTypes';

/**
 * User settings stored in Firestore
 */
export interface UserSettings {
  userId: string;
  refetchFrequency: RefetchFrequency;
  cacheSize: number; // in MB
  memoryCount: number; // 5-10 items
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Storage information
 */
export interface StorageInfo {
  totalMediaCount: number;
  totalStorageBytes: number;
  totalStorageMB: number;
  totalStorageGB: number;
}

/**
 * Cache information
 */
export interface CacheInfo {
  cacheBytes: number;
  cacheMB: number;
  cacheItemCount: number;
}
