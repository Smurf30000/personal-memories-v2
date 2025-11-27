import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/feature/authentication/model/AuthContext';
import { useMediaLibrary } from '@/feature/media/controller/useMediaLibrary';
import { useAlbums } from '@/feature/albums/controller/useAlbums';
import { MediaGrid } from '@/feature/media/view/MediaGrid';
import { MediaPreviewModal } from '@/feature/media/view/MediaPreviewModal';
import { AddToAlbumDialog } from '@/feature/albums/view/AddToAlbumDialog';
import { MediaMetadata } from '@/feature/media/model/mediaTypes';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Image, Video, FolderPlus } from 'lucide-react';

/**
 * Media library page component
 */
export default function MediaLibrary() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { media, loading, loadingMore, hasMore, filter, sort, setFilter, setSort, deleteMedia, loadMore } = useMediaLibrary(user?.uid);
  const { albums, addMediaToAlbum } = useAlbums(user?.uid);
  const [selectedMedia, setSelectedMedia] = useState<MediaMetadata | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAddToAlbum, setShowAddToAlbum] = useState(false);

  /**
   * Handles media click
   */
  const handleMediaClick = (mediaItem: MediaMetadata) => {
    setSelectedMedia(mediaItem);
    setShowPreview(true);
  };

  /**
   * Handles add to album button
   */
  const handleAddToAlbum = (mediaItem: MediaMetadata) => {
    setSelectedMedia(mediaItem);
    setShowAddToAlbum(true);
  };

  /**
   * Handles media deletion
   */
  const handleDelete = async (mediaItem: MediaMetadata) => {
    await deleteMedia(mediaItem);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Media Library</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter:</span>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover">
                <SelectItem value="all">All Media</SelectItem>
                <SelectItem value="images">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Images Only
                  </div>
                </SelectItem>
                <SelectItem value="videos">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Videos Only
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort:</span>
            <Select value={sort} onValueChange={(value: any) => setSort(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1" />

          <div className="text-sm text-muted-foreground self-center">
            {media.length} {media.length === 1 ? 'item' : 'items'}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && media.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Image className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No media found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'images' && 'No images in your library yet'}
              {filter === 'videos' && 'No videos in your library yet'}
              {filter === 'all' && 'Start by uploading some photos or videos'}
            </p>
            <Button onClick={() => navigate('/upload')}>
              Upload Media
            </Button>
          </div>
        )}

        {/* Media Grid */}
        {!loading && media.length > 0 && (
          <>
            <MediaGrid media={media} onMediaClick={handleMediaClick} />

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Preview Modal with Add to Album */}
      {selectedMedia && showPreview && (
        <MediaPreviewModal 
          media={selectedMedia}
          open={showPreview}
          onClose={() => {
            setShowPreview(false);
            setSelectedMedia(null);
          }}
          onDelete={handleDelete}
        >
          <Button 
            variant="outline" 
            onClick={() => {
              setShowPreview(false);
              setShowAddToAlbum(true);
            }}
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Add to Album
          </Button>
        </MediaPreviewModal>
      )}

      {/* Add to Album Dialog */}
      <AddToAlbumDialog
        open={showAddToAlbum}
        onClose={() => {
          setShowAddToAlbum(false);
          setSelectedMedia(null);
        }}
        albums={albums}
        mediaId={selectedMedia?.id || ''}
        onAddToAlbum={addMediaToAlbum}
      />
    </div>
  );
}
