import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MediaMetadata } from '../model/mediaTypes';
import { Download, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface MediaPreviewModalProps {
  media: MediaMetadata | null;
  open: boolean;
  onClose: () => void;
  onDelete: (media: MediaMetadata) => Promise<void>;
}

/**
 * Modal for previewing media with delete and download options
 */
export function MediaPreviewModal({ media, open, onClose, onDelete }: MediaPreviewModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!media) return null;

  const isImage = media.fileType.startsWith('image/');
  const isVideo = media.fileType.startsWith('video/');

  /**
   * Formats file size in human-readable format
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * Handles media download
   */
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = media.downloadUrl;
    link.download = media.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Handles media deletion
   */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(media);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="truncate pr-8">{media.fileName}</DialogTitle>
            <DialogDescription>
              Uploaded {format(media.uploadedAt, 'PPP')} • {formatFileSize(media.fileSize)}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto flex items-center justify-center bg-muted/20 rounded-lg">
            {isImage && (
              <img 
                src={media.downloadUrl} 
                alt={media.fileName}
                className="max-w-full max-h-[60vh] object-contain"
              />
            )}
            {isVideo && (
              <video 
                src={media.downloadUrl} 
                controls
                className="max-w-full max-h-[60vh]"
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{media.fileName}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
