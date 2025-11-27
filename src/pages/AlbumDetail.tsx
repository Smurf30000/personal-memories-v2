import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '@/feature/authentication/model/AuthContext';
import { useAlbums } from '@/feature/albums/controller/useAlbums';
import { collection, query, where, documentId, getDocs } from 'firebase/firestore';
import { db } from '@/feature/authentication/model/firebaseConfig';
import { MediaMetadata } from '@/feature/media/model/mediaTypes';
import { MediaGrid } from '@/feature/media/view/MediaGrid';
import { MediaPreviewModal } from '@/feature/media/view/MediaPreviewModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

/**
 * Album detail page showing all media in an album
 */
export default function AlbumDetail() {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { albums, loading: albumsLoading, removeMediaFromAlbum, updateAlbum } = useAlbums(user?.uid);
  const [media, setMedia] = useState<MediaMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaMetadata | null>(null);

  const album = albums.find(a => a.id === albumId);

  /**
   * Fetches media for this album
   */
  useEffect(() => {
    const fetchAlbumMedia = async () => {
      if (!album || album.mediaIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Firestore 'in' query has a limit of 10, so we batch the requests
        const batchSize = 10;
        const batches: MediaMetadata[] = [];

        for (let i = 0; i < album.mediaIds.length; i += batchSize) {
          const batch = album.mediaIds.slice(i, i + batchSize);
          
          const mediaQuery = query(
            collection(db, 'media'),
            where(documentId(), 'in', batch)
          );
          
          const snapshot = await getDocs(mediaQuery);
          snapshot.forEach((doc) => {
            const data = doc.data();
            batches.push({
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
        }

        setMedia(batches);

        // Set cover image if not already set
        if (!album.coverImageUrl && batches.length > 0) {
          const firstImage = batches.find(m => m.fileType.startsWith('image/'));
          if (firstImage && firstImage.base64Data) {
            const coverUrl = `data:${firstImage.fileType};base64,${firstImage.base64Data}`;
            await updateAlbum(album.id, { coverImageUrl: coverUrl });
          }
        }
      } catch (error) {
        console.error('Error fetching album media:', error);
        toast({
          title: "Error Loading Media",
          description: "Failed to load album media",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!albumsLoading) {
      fetchAlbumMedia();
    }
  }, [album, albumsLoading]);

  /**
   * Handles media deletion (removes from album only)
   */
  const handleRemoveFromAlbum = async (mediaItem: MediaMetadata) => {
    if (!album) return;
    
    await removeMediaFromAlbum(album.id, mediaItem.id);
    setMedia(prev => prev.filter(m => m.id !== mediaItem.id));
    setSelectedMedia(null);
  };

  if (albumsLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Album Not Found</h2>
          <Button onClick={() => navigate('/albums')}>Back to Albums</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/albums')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{album.name}</h1>
              <p className="text-sm text-muted-foreground">
                {album.mediaIds.length} {album.mediaIds.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/albums')}>
            Back to Albums
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {media.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Media in Album</h3>
            <p className="text-muted-foreground mb-4">
              Add photos and videos from your library
            </p>
            <Button onClick={() => navigate('/library')}>
              Go to Library
            </Button>
          </div>
        ) : (
          <MediaGrid media={media} onMediaClick={setSelectedMedia} />
        )}
      </main>

      <MediaPreviewModal 
        media={selectedMedia}
        open={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        onDelete={handleRemoveFromAlbum}
      />
    </div>
  );
}
