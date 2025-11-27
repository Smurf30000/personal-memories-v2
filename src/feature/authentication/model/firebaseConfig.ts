import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase configuration object
 */
const firebaseConfig = {
  apiKey: "AIzaSyDkNL7E5q2B2HjK9BY0SWvmqGnfJaeVokg",
  authDomain: "personal-memories-platform.firebaseapp.com",
  projectId: "personal-memories-platform",
  storageBucket: "personal-memories-platform.firebasestorage.app",
  messagingSenderId: "591424147816",
  appId: "1:591424147816:web:8eac1f8200c81c0486c6dd"
};

/**
 * Initialize Firebase app
 */
const app = initializeApp(firebaseConfig);

/**
 * Get Firebase Auth instance
 */
export const auth = getAuth(app);

/**
 * Get Firebase Storage instance
 */
export const storage = getStorage(app);

/**
 * Get Firestore instance
 */
export const db = getFirestore(app);
