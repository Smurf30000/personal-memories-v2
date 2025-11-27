import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, deleteDoc, doc, startAfter, QueryDocumentSnapshot } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/feature/authentication/model/firebaseConfig';
import { MediaMetadata } from '../model/mediaTypes';
import { toast } from '@/hooks/use-toast';

type FilterType = 'all' | 'images' | 'videos';
type SortType = 'newest' | 'oldest';

/**
 * Hook to manage media library
 */
export const useMediaLibrary = (userId: string | undefined) => {
  const [media, setMedia] = useState<MediaMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);

  const ITEMS_PER_PAGE = 20;

  /**
   * Fetches media from Firestore
   */
  const fetchMedia = async (isLoadMore = false) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      let mediaQuery = query(
        collection(db, 'media'),
        where('userId', '==', userId),
        orderBy('uploadedAt', sort === 'newest' ? 'desc' : 'asc'),
        limit(ITEMS_PER_PAGE)
      );

      // Add pagination cursor
      if (isLoadMore && lastDoc) {
        mediaQuery = query(mediaQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(mediaQuery);
      
      const fetchedMedia: MediaMetadata[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Apply filter
        if (filter === 'images' && !data.fileType.startsWith('image/')) return;
        if (filter === 'videos' && !data.fileType.startsWith('video/')) return;
        
        fetchedMedia.push({
          id: doc.id,
          fileName: data.fileName,
          fileType: data.fileType,
          fileSize: data.fileSize,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          downloadUrl: data.downloadUrl,
          userId: data.userId,
        });
      });

      // Update last document for pagination
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastDoc(lastVisible || null);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);

      if (isLoadMore) {
        setMedia(prev => [...prev, ...fetchedMedia]);
      } else {
        setMedia(fetchedMedia);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      toast({
        title: "Error Loading Media",
        description: "Failed to load your media library",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /**
   * Deletes media from Storage and Firestore
   */
  const deleteMedia = async (mediaItem: MediaMetadata) => {
    try {
      // Extract file path from download URL
      const urlParts = mediaItem.downloadUrl.split('/o/')[1];
      const filePath = decodeURIComponent(urlParts.split('?')[0]);
      
      // Delete from Storage
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'media', mediaItem.id));

      // Update local state
      setMedia(prev => prev.filter(item => item.id !== mediaItem.id));

      toast({
        title: "Media Deleted",
        description: `${mediaItem.fileName} has been deleted`,
      });
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the media file",
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Loads more media items
   */
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchMedia(true);
    }
  };

  // Fetch media when userId, filter, or sort changes
  useEffect(() => {
    setLastDoc(null);
    fetchMedia(false);
  }, [userId, filter, sort]);

  return {
    media,
    loading,
    loadingMore,
    hasMore,
    filter,
    sort,
    setFilter,
    setSort,
    deleteMedia,
    loadMore,
    refetch: () => fetchMedia(false),
  };
};
