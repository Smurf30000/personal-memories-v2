import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/feature/authentication/model/firebaseConfig';
import { Album, CreateAlbumInput, UpdateAlbumInput } from '../model/albumTypes';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to manage albums
 */
export const useAlbums = (userId: string | undefined) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches all albums for a user
   */
  const fetchAlbums = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const albumsQuery = query(
        collection(db, 'albums'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(albumsQuery);
      
      const fetchedAlbums: Album[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedAlbums.push({
          id: doc.id,
          name: data.name,
          userId: data.userId,
          coverImageUrl: data.coverImageUrl,
          mediaIds: data.mediaIds || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      setAlbums(fetchedAlbums);
    } catch (error) {
      console.error('Error fetching albums:', error);
      toast({
        title: "Error Loading Albums",
        description: "Failed to load your albums",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a new album
   */
  const createAlbum = async (input: CreateAlbumInput): Promise<string | null> => {
    try {
      const albumData = {
        name: input.name,
        userId: input.userId,
        mediaIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'albums'), albumData);

      const newAlbum: Album = {
        id: docRef.id,
        name: input.name,
        userId: input.userId,
        mediaIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setAlbums(prev => [...prev, newAlbum]);

      toast({
        title: "Album Created",
        description: `"${input.name}" has been created`,
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating album:', error);
      toast({
        title: "Error Creating Album",
        description: "Failed to create album",
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Updates an existing album
   */
  const updateAlbum = async (albumId: string, updates: UpdateAlbumInput) => {
    try {
      const albumRef = doc(db, 'albums', albumId);
      
      // Filter out undefined values (Firestore rejects them)
      const filteredUpdates: Record<string, any> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          filteredUpdates[key] = value;
        }
      }
      
      // Only update if we have valid fields
      if (Object.keys(filteredUpdates).length === 0) return;
      
      const updateData = {
        ...filteredUpdates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(albumRef, updateData);

      setAlbums(prev => prev.map(album => 
        album.id === albumId 
          ? { ...album, ...updates, updatedAt: new Date() }
          : album
      ));

      toast({
        title: "Album Updated",
        description: "Album has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating album:', error);
      toast({
        title: "Error Updating Album",
        description: "Failed to update album",
        variant: "destructive",
      });
    }
  };

  /**
   * Deletes an album (doesn't delete media)
   */
  const deleteAlbum = async (albumId: string) => {
    try {
      await deleteDoc(doc(db, 'albums', albumId));

      setAlbums(prev => prev.filter(album => album.id !== albumId));

      toast({
        title: "Album Deleted",
        description: "Album has been deleted (media files are safe)",
      });
    } catch (error) {
      console.error('Error deleting album:', error);
      toast({
        title: "Error Deleting Album",
        description: "Failed to delete album",
        variant: "destructive",
      });
    }
  };

  /**
   * Adds media to an album
   */
  const addMediaToAlbum = async (albumId: string, mediaId: string) => {
    try {
      const album = albums.find(a => a.id === albumId);
      if (!album) return;

      if (album.mediaIds.includes(mediaId)) {
        toast({
          title: "Already in Album",
          description: "This media is already in the album",
        });
        return;
      }

      const updatedMediaIds = [...album.mediaIds, mediaId];
      await updateAlbum(albumId, { mediaIds: updatedMediaIds });

      toast({
        title: "Added to Album",
        description: `Media added to "${album.name}"`,
      });
    } catch (error) {
      console.error('Error adding media to album:', error);
      toast({
        title: "Error",
        description: "Failed to add media to album",
        variant: "destructive",
      });
    }
  };

  /**
   * Removes media from an album
   */
  const removeMediaFromAlbum = async (albumId: string, mediaId: string) => {
    try {
      const album = albums.find(a => a.id === albumId);
      if (!album) return;

      const updatedMediaIds = album.mediaIds.filter(id => id !== mediaId);
      await updateAlbum(albumId, { mediaIds: updatedMediaIds });

      toast({
        title: "Removed from Album",
        description: "Media removed from album",
      });
    } catch (error) {
      console.error('Error removing media from album:', error);
      toast({
        title: "Error",
        description: "Failed to remove media from album",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, [userId]);

  return {
    albums,
    loading,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    addMediaToAlbum,
    removeMediaFromAlbum,
    refetch: fetchAlbums,
  };
};
