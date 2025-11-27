import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/feature/authentication/model/firebaseConfig';

/**
 * Hook to fetch media counts for a user
 */
export const useMediaCounts = (userId: string | undefined) => {
  const [counts, setCounts] = useState({ photos: 0, videos: 0, albums: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Fetches media counts from Firestore
     */
    const fetchCounts = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const mediaQuery = query(
          collection(db, 'media'),
          where('userId', '==', userId)
        );
        
        const snapshot = await getDocs(mediaQuery);
        
        let photoCount = 0;
        let videoCount = 0;
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.fileType.startsWith('image/')) {
            photoCount++;
          } else if (data.fileType.startsWith('video/')) {
            videoCount++;
          }
        });
        
        // Fetch albums count
        const albumsQuery = query(
          collection(db, 'albums'),
          where('userId', '==', userId)
        );
        const albumsSnapshot = await getDocs(albumsQuery);
        
        setCounts({
          photos: photoCount,
          videos: videoCount,
          albums: albumsSnapshot.size,
        });
      } catch (error) {
        console.error('Error fetching media counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [userId]);

  return { counts, loading };
};
