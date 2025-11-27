import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/feature/authentication/model/firebaseConfig';
import { UploadProgress } from '../model/mediaTypes';
import { toast } from '@/hooks/use-toast';

/**
 * Converts a file to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Validates if a file is an accepted media type and within size limits
 */
const validateFile = (file: File): { valid: boolean; error?: string } => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'];
  const videoTypes = ['video/mp4', 'video/quicktime'];
  const acceptedTypes = [...imageTypes, ...videoTypes];
  
  if (!acceptedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Only JPG, PNG, HEIC, WebP, MP4, and MOV are allowed.' 
    };
  }
  
  // Size limits for Firestore storage (base64 encoded files)
  const isImage = imageTypes.includes(file.type);
  const isVideo = videoTypes.includes(file.type);
  
  const maxImageSize = 500 * 1024; // 500KB for images
  const maxVideoSize = 700 * 1024; // 700KB for videos
  
  if (isImage && file.size > maxImageSize) {
    return { 
      valid: false, 
      error: 'Image size exceeds 500KB limit.' 
    };
  }
  
  if (isVideo && file.size > maxVideoSize) {
    return { 
      valid: false, 
      error: 'Video size exceeds 700KB limit.' 
    };
  }
  
  return { valid: true };
};

/**
 * Custom hook for handling media uploads
 */
export const useMediaUpload = (userId: string) => {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());

  /**
   * Uploads a single file to Firestore as base64
   */
  const uploadFile = async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        title: "Upload Failed",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    const fileId = `${Date.now()}-${file.name}`;
    
    // Initialize upload progress
    setUploads(prev => new Map(prev).set(fileId, {
      id: fileId,
      file,
      progress: 0,
      status: 'uploading',
    }));

    try {
      // Update progress to 30% (starting conversion)
      setUploads(prev => new Map(prev).set(fileId, {
        id: fileId,
        file,
        progress: 30,
        status: 'uploading',
      }));

      // Convert file to base64
      const base64Data = await fileToBase64(file);
      
      // Update progress to 70% (conversion complete, saving to Firestore)
      setUploads(prev => new Map(prev).set(fileId, {
        id: fileId,
        file,
        progress: 70,
        status: 'uploading',
      }));
      
      // Save metadata and base64 data to Firestore
      await addDoc(collection(db, 'media'), {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: serverTimestamp(),
        base64Data,
        userId,
      });

      setUploads(prev => new Map(prev).set(fileId, {
        id: fileId,
        file,
        progress: 100,
        status: 'completed',
      }));

      toast({
        title: "Upload Successful",
        description: `${file.name} uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploads(prev => new Map(prev).set(fileId, {
        id: fileId,
        file,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.name}`,
        variant: "destructive",
      });
    }
  };

  /**
   * Uploads multiple files
   */
  const uploadFiles = async (files: File[]) => {
    for (const file of files) {
      await uploadFile(file);
    }
  };

  /**
   * Removes a specific upload from the list
   */
  const removeUpload = (fileId: string) => {
    setUploads(prev => {
      const newUploads = new Map(prev);
      newUploads.delete(fileId);
      return newUploads;
    });
  };

  /**
   * Clears all uploads from the list
   */
  const clearAll = () => {
    setUploads(new Map());
  };

  /**
   * Clears completed uploads from the list
   */
  const clearCompleted = () => {
    setUploads(prev => {
      const newUploads = new Map(prev);
      for (const [key, value] of newUploads) {
        if (value.status === 'completed') {
          newUploads.delete(key);
        }
      }
      return newUploads;
    });
  };

  return {
    uploads: Array.from(uploads.entries()).map(([id, progress]) => ({ id, ...progress })),
    uploadFiles,
    removeUpload,
    clearAll,
    clearCompleted,
  };
};
