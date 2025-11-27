import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Album } from '../model/albumTypes';
import { FolderPlus, Check } from 'lucide-react';

interface AddToAlbumDialogProps {
  open: boolean;
  onClose: () => void;
  albums: Album[];
  mediaId: string;
  onAddToAlbum: (albumId: string, mediaId: string) => Promise<void>;
}

/**
 * Dialog for adding media to albums
 */
export function AddToAlbumDialog({ open, onClose, albums, mediaId, onAddToAlbum }: AddToAlbumDialogProps) {
  /**
   * Handles adding media to album
   */
  const handleAddToAlbum = async (albumId: string) => {
    await onAddToAlbum(albumId, mediaId);
    onClose();
  };

  /**
   * Checks if media is already in album
   */
  const isInAlbum = (album: Album): boolean => {
    return album.mediaIds.includes(mediaId);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Album</DialogTitle>
          <DialogDescription>
            Select an album to add this media to
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          {albums.length === 0 ? (
            <div className="text-center py-8">
              <FolderPlus className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No albums yet. Create one first!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {albums.map((album) => (
                <Button
                  key={album.id}
                  variant={isInAlbum(album) ? "secondary" : "outline"}
                  className="w-full justify-between"
                  onClick={() => handleAddToAlbum(album.id)}
                  disabled={isInAlbum(album)}
                >
                  <span className="truncate">{album.name}</span>
                  <span className="flex items-center gap-2 ml-2">
                    {isInAlbum(album) && <Check className="h-4 w-4" />}
                    <span className="text-xs text-muted-foreground">
                      {album.mediaIds.length} items
                    </span>
                  </span>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
