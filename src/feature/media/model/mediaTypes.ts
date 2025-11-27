/**
 * Represents a media file metadata stored in Firestore
 */
export interface MediaMetadata {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  downloadUrl?: string; // Optional: old storage method
  base64Data?: string; // New: base64-encoded file data
  userId: string;
}

/**
 * File upload progress information
 */
export interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  downloadUrl?: string;
}
