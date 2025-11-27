import { MediaMetadata } from '../model/mediaTypes';
import { Card } from '@/components/ui/card';
import { Play, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface MediaGridProps {
  media: MediaMetadata[];
  onMediaClick: (media: MediaMetadata) => void;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
}

/**
 * Grid component for displaying media thumbnails
 */
export function MediaGrid({ media, onMediaClick, selectionMode = false, selectedIds = new Set() }: MediaGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {media.map((item) => (
        <MediaGridItem 
          key={item.id} 
          media={item} 
          onClick={() => onMediaClick(item)}
          selectionMode={selectionMode}
          isSelected={selectedIds.has(item.id)}
        />
      ))}
    </div>
  );
}

interface MediaGridItemProps {
  media: MediaMetadata;
  onClick: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
}

/**
 * Individual media grid item component
 */
function MediaGridItem({ media, onClick, selectionMode = false, isSelected = false }: MediaGridItemProps) {
  const [imageError, setImageError] = useState(false);
  const isImage = media.fileType.startsWith('image/');
  const isVideo = media.fileType.startsWith('video/');

  // Generate data URL from base64 or use downloadUrl
  const mediaUrl = media.base64Data 
    ? `data:${media.fileType};base64,${media.base64Data}`
    : media.downloadUrl;

  return (
    <Card 
      className={`aspect-square overflow-hidden cursor-pointer transition-all group relative ${
        isSelected 
          ? 'ring-4 ring-primary' 
          : 'hover:ring-2 hover:ring-primary'
      }`}
      onClick={onClick}
    >
      <div className="relative w-full h-full">
        {isImage && !imageError && mediaUrl ? (
          <img 
            src={mediaUrl}
            alt={media.fileName}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={() => setImageError(true)}
          />
        ) : isVideo && mediaUrl ? (
          <>
            <video 
              src={mediaUrl}
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

        {/* Selection Checkbox Overlay */}
        {selectionMode && (
          <div className="absolute top-2 right-2 bg-background rounded-full p-1 shadow-lg">
            {isSelected ? (
              <CheckCircle className="h-5 w-5 text-primary fill-current" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
