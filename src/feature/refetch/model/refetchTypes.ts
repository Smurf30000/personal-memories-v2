/**
 * Refetch frequency options
 */
export type RefetchFrequency = 'daily' | 'weekly' | 'monthly';

/**
 * Refetch settings stored in localStorage
 */
export interface RefetchSettings {
  frequency: RefetchFrequency;
  lastRefetchTime: number | null;
  cacheSize: number; // in MB
  memoryCount: number; // how many random items to show (5-10)
}

/**
 * Cached memory item in IndexedDB
 */
export interface CachedMemory {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  downloadUrl: string;
  blobData?: Blob; // cached file data
  cachedAt: number;
}

/**
 * Default refetch settings
 */
export const DEFAULT_REFETCH_SETTINGS: RefetchSettings = {
  frequency: 'daily',
  lastRefetchTime: null,
  cacheSize: 100, // 100MB default
  memoryCount: 8,
};
