import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, WifiOff, ImageIcon } from 'lucide-react';
import { MediaMetadata } from '@/feature/media/model/mediaTypes';
import { useState } from 'react';
import { MediaPreviewModal } from '@/feature/media/view/MediaPreviewModal';

interface MemoriesWidgetProps {
  memories: MediaMetadata[];
  loading: boolean;
  isOnline: boolean;
  onRefresh: () => void;
  onDelete: (media: MediaMetadata) => Promise<void>;
}

/**
 * Widget displaying today's random memories
 */
export function MemoriesWidget({ memories, loading, isOnline, onRefresh, onDelete }: MemoriesWidgetProps) {
  const [selectedMemory, setSelectedMemory] = useState<MediaMetadata | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Handles refresh button click
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Today's Memories
                {!isOnline && <WifiOff className="h-4 w-4 text-muted-foreground" />}
              </CardTitle>
              <CardDescription>
                {isOnline ? 'Random memories from your collection' : 'Showing cached memories (offline)'}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading || refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!isOnline && (
            <Alert className="mb-4">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                You're offline. Showing previously cached memories.
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                No memories to show yet. Upload some media to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {memories.map((memory) => (
                <MemoryThumbnail 
                  key={memory.id} 
                  memory={memory} 
                  onClick={() => setSelectedMemory(memory)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MediaPreviewModal 
        media={selectedMemory}
        open={!!selectedMemory}
        onClose={() => setSelectedMemory(null)}
        onDelete={onDelete}
      />
    </>
  );
}

interface MemoryThumbnailProps {
  memory: MediaMetadata;
  onClick: () => void;
}

/**
 * Individual memory thumbnail
 */
function MemoryThumbnail({ memory, onClick }: MemoryThumbnailProps) {
  const [imageError, setImageError] = useState(false);
  const isImage = memory.fileType.startsWith('image/');
  const isVideo = memory.fileType.startsWith('video/');

  return (
    <div 
      className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:ring-2 hover:ring-primary transition-all group"
      onClick={onClick}
    >
      <div className="relative w-full h-full">
        {isImage && !imageError ? (
          <img 
            src={memory.downloadUrl}
            alt={memory.fileName}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={() => setImageError(true)}
          />
        ) : isVideo ? (
          <video 
            src={memory.downloadUrl}
            className="w-full h-full object-cover"
            preload="metadata"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Preview unavailable</span>
          </div>
        )}
      </div>
    </div>
  );
}
