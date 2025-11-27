import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CachedMemory } from './refetchTypes';

interface MemoryCacheDB extends DBSchema {
  memories: {
    key: string;
    value: CachedMemory;
  };
}

const DB_NAME = 'memory-cache';
const DB_VERSION = 1;
const STORE_NAME = 'memories';

/**
 * Opens the IndexedDB database
 */
async function getDb(): Promise<IDBPDatabase<MemoryCacheDB>> {
  return openDB<MemoryCacheDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

/**
 * Saves memories to IndexedDB cache
 */
export async function saveCachedMemories(memories: CachedMemory[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  
  for (const memory of memories) {
    await tx.store.put(memory);
  }
  
  await tx.done;
}

/**
 * Retrieves all cached memories from IndexedDB
 */
export async function getCachedMemories(): Promise<CachedMemory[]> {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

/**
 * Clears all cached memories from IndexedDB
 */
export async function clearCachedMemories(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.clear();
  await tx.done;
}

/**
 * Gets the total size of cached memories in bytes
 */
export async function getCacheSize(): Promise<number> {
  const memories = await getCachedMemories();
  return memories.reduce((total, memory) => {
    const blobSize = memory.blobData ? memory.blobData.size : 0;
    return total + blobSize;
  }, 0);
}

/**
 * Deletes a specific cached memory
 */
export async function deleteCachedMemory(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}
