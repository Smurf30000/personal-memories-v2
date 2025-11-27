import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/feature/authentication/model/AuthContext';
import { useAlbums } from '@/feature/albums/controller/useAlbums';
import { CreateAlbumDialog } from '@/feature/albums/view/CreateAlbumDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, FolderPlus, MoreVertical, Pencil, Trash2, ImageIcon } from 'lucide-react';
import { Album } from '@/feature/albums/model/albumTypes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/**
 * Albums page component
 */
export default function Albums() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { albums, loading, createAlbum, updateAlbum, deleteAlbum } = useAlbums(user?.uid);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);
  const [albumToRename, setAlbumToRename] = useState<Album | null>(null);
  const [newName, setNewName] = useState('');

  /**
   * Handles album creation
   */
  const handleCreateAlbum = async (name: string) => {
    if (!user?.uid) return;
    await createAlbum({ name, userId: user.uid });
  };

  /**
   * Handles album rename
   */
  const handleRename = async () => {
    if (!albumToRename || !newName.trim()) return;
    await updateAlbum(albumToRename.id, { name: newName.trim() });
    setAlbumToRename(null);
    setNewName('');
  };

  /**
   * Handles album deletion
   */
  const handleDelete = async () => {
    if (!albumToDelete) return;
    await deleteAlbum(albumToDelete.id);
    setAlbumToDelete(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Albums</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateDialog(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Create Album
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <FolderPlus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Albums Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first album to organize your memories
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Create Album
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onView={() => navigate(`/albums/${album.id}`)}
                onRename={(album) => {
                  setAlbumToRename(album);
                  setNewName(album.name);
                }}
                onDelete={(album) => setAlbumToDelete(album)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Album Dialog */}
      <CreateAlbumDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreateAlbum={handleCreateAlbum}
      />

      {/* Rename Album Dialog */}
      <Dialog open={!!albumToRename} onOpenChange={() => setAlbumToRename(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Album</DialogTitle>
            <DialogDescription>
              Enter a new name for "{albumToRename?.name}"
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            placeholder="Album name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlbumToRename(null)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Album Dialog */}
      <AlertDialog open={!!albumToDelete} onOpenChange={() => setAlbumToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Album?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the album "{albumToDelete?.name}". Your media files will NOT be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Album
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface AlbumCardProps {
  album: Album;
  onView: () => void;
  onRename: (album: Album) => void;
  onDelete: (album: Album) => void;
}

/**
 * Individual album card component
 */
function AlbumCard({ album, onView, onRename, onDelete }: AlbumCardProps) {
  return (
    <Card className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all group">
      <div className="aspect-square bg-muted relative" onClick={onView}>
        {album.coverImageUrl ? (
          <img 
            src={album.coverImageUrl} 
            alt={album.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50 bg-popover">
              <DropdownMenuItem onClick={() => onRename(album)}>
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(album)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CardContent className="p-4" onClick={onView}>
        <h3 className="font-semibold truncate">{album.name}</h3>
        <p className="text-sm text-muted-foreground">
          {album.mediaIds.length} {album.mediaIds.length === 1 ? 'item' : 'items'}
        </p>
      </CardContent>
    </Card>
  );
}
