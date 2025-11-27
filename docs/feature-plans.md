# Personal Memories Platform - Feature Implementation Plan

## Project Overview
A web application for uploading, managing, and viewing personal media (photos and videos) with automated sync and refetch mechanisms.

**Current Status:** 95% Complete (Authentication fully functional - only optional email verification remaining)

---

## Phase 1: Complete Firebase Setup & Authentication (Week 1 - Days 1-2)

### Tasks
- ✅ Replace placeholder Firebase config with actual credentials
- ✅ Add protected routes to prevent unauthenticated access to app features
- ✅ Implement auth state persistence check on app load
- [ ] Add email verification flow (optional but recommended)
- ✅ Improve error handling in login/register flows
- ✅ Add password reset functionality
- ✅ Test Google OAuth flow end-to-end
- ✅ Separate landing page from authenticated dashboard

### Files Created/Modified
- ✅ `src/feature/authentication/model/firebaseConfig.ts` - Added real Firebase credentials
- ✅ `src/App.tsx` - Updated routing with public landing and protected dashboard
- ✅ `src/components/ProtectedRoute.tsx` - Route guard component
- ✅ `src/feature/authentication/controller/useAuth.ts` - Added password reset function
- ✅ `src/pages/LandingPage.tsx` - Public landing page for unauthenticated users
- ✅ `src/pages/Dashboard.tsx` - Protected dashboard for authenticated users
- ✅ `src/feature/authentication/view/LoginScreen.tsx` - Added password reset UI
- ✅ `src/feature/authentication/view/RegisterScreen.tsx` - Added auto-redirect for logged-in users

### Deliverables
- Fully functional authentication with session persistence
- Protected routes that redirect to login
- Working Google Sign-In
- Password reset capability

---

## Phase 2: Media Upload Module (Week 1-2 - Days 3-7)

### Tasks
- Set up Firebase Storage integration
- Create upload UI component with drag-and-drop
- Implement file validation (type, size limits)
- Add upload progress indicators
- Store media metadata in Firestore
- Handle upload errors gracefully
- Support batch uploads

### New Files to Create
- `src/feature/mediaManagement/model/firebaseStorage.ts` - Storage config
- `src/feature/mediaManagement/model/mediaTypes.ts` - Type definitions
- `src/feature/mediaManagement/controller/useMediaUpload.ts` - Upload logic hook
- `src/feature/mediaManagement/view/UploadScreen.tsx` - Upload UI
- `src/feature/mediaManagement/view/components/UploadDropzone.tsx` - Dropzone component
- `src/feature/mediaManagement/view/components/UploadProgress.tsx` - Progress indicator

### Validation Rules
- **Supported Images:** JPG, PNG, HEIC, WebP
- **Supported Videos:** MP4, MOV, AVI (max 100MB per file)
- **Constraint:** Videos ≤ 50% of total media count

### Deliverables
- Working upload interface with drag-and-drop
- Firebase Storage integration
- File validation and error handling
- Upload progress tracking
- Metadata storage in Firestore

---

## Phase 3: Media Management & Library (Week 2-3 - Days 8-14)

### Tasks
- Create media library grid view
- Implement album creation and organization
- Add search and filter by date
- Build media preview modal (image viewer + video player)
- Create slideshow widget
- Add delete functionality
- Implement pagination for large libraries

### New Files to Create
- `src/feature/mediaManagement/view/MediaLibraryScreen.tsx` - Main library view
- `src/feature/mediaManagement/view/components/MediaGrid.tsx` - Grid layout
- `src/feature/mediaManagement/view/components/MediaCard.tsx` - Individual media item
- `src/feature/mediaManagement/view/components/MediaPreview.tsx` - Preview modal
- `src/feature/mediaManagement/view/components/AlbumManager.tsx` - Album UI
- `src/feature/mediaManagement/view/components/SlideshowWidget.tsx` - Slideshow
- `src/feature/mediaManagement/controller/useMediaLibrary.ts` - Fetch media hook
- `src/feature/mediaManagement/controller/useAlbums.ts` - Album management

### Deliverables
- Full media library with grid view
- Album creation and management
- Search/filter functionality
- Image preview and video playback
- Slideshow feature

---

## Phase 4: Sync & Refetch Mechanism (Week 3-4 - Days 15-21)

### Tasks
- Implement random media selection algorithm
- Create local cache management system
- Build scheduled refetch logic
- Add manual refetch trigger
- Implement offline detection and deferral
- Add cache size limit enforcement
- Create sync status indicators

### New Files to Create
- `src/feature/sync/model/syncTypes.ts` - Sync-related types
- `src/feature/sync/controller/useRefetch.ts` - Refetch logic
- `src/feature/sync/controller/useCacheManager.ts` - Cache management
- `src/feature/sync/controller/useScheduler.ts` - Scheduling logic
- `src/feature/sync/view/SyncSettingsScreen.tsx` - User preferences
- `src/feature/sync/view/components/SyncStatus.tsx` - Status display
- `src/feature/sync/view/components/CacheViewer.tsx` - View cached media
- `src/lib/cacheManager.ts` - Cache utilities
- `src/lib/scheduler.ts` - Scheduling utilities

### Refetch Algorithm
1. Query total media count from Firestore
2. Calculate how many files fit in cache size limit
3. Generate random selection ensuring video ≤ 50% ratio
4. Download to local IndexedDB or Cache API
5. Clear old cache before new refetch

### Deliverables
- Working refetch mechanism
- Cache management with IndexedDB
- Scheduled and manual sync
- Offline handling
- User-configurable settings

---

## Phase 5: User Preferences & Settings (Week 4 - Days 22-24)

### Tasks
- Create settings UI
- Implement refetch frequency selector (daily/weekly/monthly)
- Add cache size limit input
- Display storage usage stats
- Add user profile management
- Implement notification preferences

### New Files to Create
- `src/feature/settings/model/settingsTypes.ts` - Settings types
- `src/feature/settings/controller/useSettings.ts` - Settings management
- `src/feature/settings/view/SettingsScreen.tsx` - Main settings
- `src/feature/settings/view/components/RefetchSettings.tsx` - Refetch config
- `src/feature/settings/view/components/StorageSettings.tsx` - Storage config
- `src/feature/settings/view/components/ProfileSettings.tsx` - Profile management

### Deliverables
- Complete settings interface
- User preferences storage in Firestore
- Storage usage display

---

## Phase 6: Polish, Testing & Deployment (Week 4-5 - Days 25-30)

### Tasks
- Add comprehensive error handling across all features
- Implement loading states everywhere
- Add skeleton loaders for better UX
- Write unit tests for critical functions
- Write integration tests for auth and upload flows
- Optimize performance (lazy loading, code splitting)
- Add responsive design improvements
- Configure Firebase security rules (production-ready)
- Deploy to Firebase Hosting or Vercel
- Set up CI/CD pipeline

### Testing Focus Areas
- Authentication flows
- File upload validation
- Refetch algorithm accuracy
- Cache management
- Offline scenarios

### Deliverables
- Fully tested application
- Production-ready security rules
- Deployed app with custom domain
- Complete documentation

---

## Firebase Configuration

### Security Rules - Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User can only access their own media
    match /users/{userId}/media/{mediaId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User can only access their own albums
    match /users/{userId}/albums/{albumId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User can only access their own settings
    match /users/{userId}/settings {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Security Rules - Firebase Storage
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      // Only allow authenticated users to access their own files
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Limit file size to 100MB
      allow write: if request.resource.size < 100 * 1024 * 1024;
    }
  }
}
```

---

## Architecture Decisions

### Storage Strategy
- **Firebase Storage:** For media files (5GB free tier)
- **Firestore:** For metadata, albums, and user settings
- **IndexedDB:** For local cache of refetched media

### State Management
- **React Query:** Server state management
- **React Context:** Auth state (already implemented)
- **Zustand:** Consider for complex client state if needed

### Local Cache Implementation
Use **IndexedDB** with `idb` library for storing refetched media:
- Supports large file storage (unlike localStorage)
- Works offline
- Easy to implement size limits
- Good browser support

---

## Data Models

### Media Document (Firestore)
```typescript
interface MediaDocument {
  id: string;
  userId: string;
  type: 'image' | 'video';
  fileName: string;
  storagePath: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  uploadedAt: Timestamp;
  capturedAt?: Timestamp;
  albumIds: string[];
  tags?: string[];
  metadata?: {
    width?: number;
    height?: number;
    duration?: number; // for videos
  };
}
```

### Album Document (Firestore)
```typescript
interface AlbumDocument {
  id: string;
  userId: string;
  name: string;
  coverMediaId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  mediaCount: number;
}
```

### User Settings Document (Firestore)
```typescript
interface UserSettingsDocument {
  userId: string;
  refetchFrequency: 'daily' | 'weekly' | 'monthly';
  cacheSizeLimit: number; // in MB
  notificationsEnabled: boolean;
  lastRefetchAt?: Timestamp;
  nextScheduledRefetch?: Timestamp;
}
```

---

## Next Steps

1. ✅ **Configure Firebase credentials** (DONE)
2. **Enable Firebase Authentication:**
   - Go to Firebase Console → Authentication
   - Enable Email/Password sign-in method
   - Enable Google sign-in method
3. **Enable Firestore Database:**
   - Go to Firebase Console → Firestore Database
   - Create database in production mode
   - Apply security rules from this document
4. **Enable Firebase Storage:**
   - Go to Firebase Console → Storage
   - Get started with default settings
   - Apply security rules from this document
5. **Implement protected routes and auth improvements**
6. **Begin Media Upload Module**

---

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [IndexedDB API Guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Firebase Storage Best Practices](https://firebase.google.com/docs/storage/web/start)
