import { MediaMetadata } from '../model/mediaTypes';
import { Card } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { useState } from 'react';

interface MediaGridProps {
  media: MediaMetadata[];
  onMediaClick: (media: MediaMetadata) => void;
}

/**
 * Grid component for displaying media thumbnails
 */
export function MediaGrid({ media, onMediaClick }: MediaGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {media.map((item) => (
        <MediaGridItem 
          key={item.id} 
          media={item} 
          onClick={() => onMediaClick(item)} 
        />
      ))}
    </div>
  );
}

interface MediaGridItemProps {
  media: MediaMetadata;
  onClick: () => void;
}

/**
 * Individual media grid item component
 */
function MediaGridItem({ media, onClick }: MediaGridItemProps) {
  const [imageError, setImageError] = useState(false);
  const isImage = media.fileType.startsWith('image/');
  const isVideo = media.fileType.startsWith('video/');

  return (
    <Card 
      className="aspect-square overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all group"
      onClick={onClick}
    >
      <div className="relative w-full h-full">
        {isImage && !imageError ? (
          <img 
            src={media.downloadUrl}
            alt={media.fileName}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={() => setImageError(true)}
          />
        ) : isVideo ? (
          <>
            <video 
              src={media.downloadUrl}
              className="w-full h-full object-cover"
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="bg-white/90 rounded-full p-3">
                <Play className="h-6 w-6 text-primary fill-current" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Preview unavailable</span>
          </div>
        )}
      </div>
    </Card>
  );
}
