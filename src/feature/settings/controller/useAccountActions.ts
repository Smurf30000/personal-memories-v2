import { useState } from 'react';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { auth, db, storage } from '@/feature/authentication/model/firebaseConfig';
import { clearCachedMemories } from '@/feature/refetch/model/cacheDb';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for account management actions
 */
export const useAccountActions = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Sends password reset email
   */
  const sendPasswordReset = async (email: string) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for instructions to reset your password",
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast({
        title: "Error",
        description: "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes user account and all associated data
   */
  const deleteAccount = async (userId: string) => {
    setLoading(true);
    try {
      // Delete all media from Firestore
      const mediaQuery = query(
        collection(db, 'media'),
        where('userId', '==', userId)
      );
      const mediaSnapshot = await getDocs(mediaQuery);
      const deleteMediaPromises = mediaSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteMediaPromises);

      // Delete all files from Storage
      const storageRef = ref(storage, `users/${userId}/media`);
      const filesList = await listAll(storageRef);
      const deleteStoragePromises = filesList.items.map(item => deleteObject(item));
      await Promise.all(deleteStoragePromises);

      // Delete user settings
      const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
      await deleteDoc(settingsRef);

      // Clear cache
      await clearCachedMemories();

      // Delete user account
      const user = auth.currentUser;
      if (user) {
        await deleteUser(user);
      }

      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted",
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. You may need to re-authenticate and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    sendPasswordReset,
    deleteAccount,
  };
};
