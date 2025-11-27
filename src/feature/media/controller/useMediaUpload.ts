import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/feature/authentication/model/firebaseConfig';
import { UploadProgress } from '../model/mediaTypes';
import { toast } from '@/hooks/use-toast';

/**
 * Validates if a file is an accepted media type
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
  
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'File size exceeds 100MB limit.' 
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
   * Uploads a single file to Firebase Storage and saves metadata to Firestore
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
      file,
      progress: 0,
      status: 'uploading',
    }));

    try {
      // Create unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${timestamp}_${sanitizedName}`;
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `users/${userId}/media/${uniqueFileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploads(prev => new Map(prev).set(fileId, {
            file,
            progress,
            status: 'uploading',
          }));
        },
        (error) => {
          console.error('Upload error:', error);
          setUploads(prev => new Map(prev).set(fileId, {
            file,
            progress: 0,
            status: 'error',
            error: error.message,
          }));
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
        },
        async () => {
          // Upload complete, get download URL
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Save metadata to Firestore
          await addDoc(collection(db, 'media'), {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadedAt: serverTimestamp(),
            downloadUrl,
            userId,
          });

          setUploads(prev => new Map(prev).set(fileId, {
            file,
            progress: 100,
            status: 'completed',
            downloadUrl,
          }));

          toast({
            title: "Upload Successful",
            description: `${file.name} uploaded successfully`,
          });
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      setUploads(prev => new Map(prev).set(fileId, {
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
    uploads: Array.from(uploads.values()),
    uploadFiles,
    clearCompleted,
  };
};
