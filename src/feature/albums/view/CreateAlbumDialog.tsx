import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateAlbumDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateAlbum: (name: string) => Promise<void>;
}

/**
 * Dialog for creating a new album
 */
export function CreateAlbumDialog({ open, onClose, onCreateAlbum }: CreateAlbumDialogProps) {
  const [albumName, setAlbumName] = useState('');
  const [creating, setCreating] = useState(false);

  /**
   * Handles album creation
   */
  const handleCreate = async () => {
    if (!albumName.trim()) return;

    setCreating(true);
    try {
      await onCreateAlbum(albumName.trim());
      setAlbumName('');
      onClose();
    } finally {
      setCreating(false);
    }
  };

  /**
   * Handles dialog close
   */
  const handleClose = () => {
    setAlbumName('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Album</DialogTitle>
          <DialogDescription>
            Give your album a name. You can add photos and videos to it later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="album-name">Album Name</Label>
          <Input
            id="album-name"
            placeholder="e.g., Summer Vacation 2024"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating || !albumName.trim()}>
            {creating ? 'Creating...' : 'Create Album'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
