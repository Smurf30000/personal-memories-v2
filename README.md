# Personal Memories Platform 🎞️

A full-featured web application for storing, organizing, and randomly rediscovering your personal photos and videos.

## ✨ Features

### Phase 1: Authentication ✅
- Email/password authentication with Firebase
- Google Sign-In integration
- Protected routes with session persistence
- Password reset via email
- Automatic auth state management

### Phase 2: Media Upload ✅
- Drag-and-drop file upload interface
- Multiple file selection and batch upload
- File validation (JPG, PNG, HEIC, WebP, MP4, MOV)
- 100MB per file size limit
- Real-time upload progress tracking
- Firebase Storage integration with unique filenames

### Phase 3: Media Library ✅
- Responsive grid view (4 columns desktop, 2 columns mobile)
- Lazy loading images for performance
- Filter by type (All Media, Images Only, Videos Only)
- Sort by date (Newest First, Oldest First)
- Pagination with "Load More" (20 items per page)
- Full-screen media preview with controls
- Download and delete functionality with confirmation

### Phase 3.5: Album Management ✅
- Create and name custom albums
- Add media to multiple albums simultaneously
- View album contents with grid layout
- Rename and delete albums (safe delete - media preserved)
- Auto-generate album covers from first image
- Remove media from albums without deleting files

### Phase 4: Sync & Refetch (Core Feature) ✅
- **Today's Memories Widget** displaying random selections
- Smart random selection algorithm (max 50% videos)
- IndexedDB local caching for offline access
- Scheduled refetch (daily/weekly/monthly)
- Manual refresh button with loading states
- Automatic refetch on app open if schedule passed
- Offline mode detection with cached fallback
- Background file downloading and caching

### Phase 5: User Settings ✅
- Refetch frequency control (Daily/Weekly/Monthly)
- Memory count slider (5-10 items shown)
- Cache size limit slider (100MB - 1GB)
- Real-time cache usage display
- Clear cache button with confirmation
- Total storage statistics (media count, storage used)
- Change password via email reset link
- Account deletion with complete data cleanup
- All settings stored in Firestore for cross-device sync

### Phase 6: Polish & Deploy ✅
- **Collapsible sidebar navigation** with mobile hamburger
- Active route highlighting
- Error boundaries for graceful error handling
- Lazy loading routes with code splitting
- Loading skeletons throughout the app
- PWA support (installable, offline-capable)
- Service Worker for caching static assets
- Fully responsive mobile design
- Touch-friendly UI elements
- Firebase production security rules
- Performance optimizations

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI Components:** Shadcn/ui, Tailwind CSS
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **State Management:** React Query, Context API
- **Routing:** React Router v6
- **Forms:** React Hook Form, Zod validation
- **Caching:** IndexedDB (idb library)
- **Icons:** Lucide React
- **Build:** Vite with lazy loading and code splitting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Authentication, Firestore, and Storage enabled

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd personal-memories-platform
```

2. Install dependencies
```bash
npm install
```

3. Set up Firebase
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Enable Firebase Storage
   - Copy your Firebase configuration

4. Update Firebase config in `src/feature/authentication/model/firebaseConfig.ts`

5. Run development server
```bash
npm run dev
```

6. Open browser at `http://localhost:8080`

## 📱 PWA Setup

The app is pre-configured as a Progressive Web App (PWA):

1. Add PWA icons to `/public` folder:
   - `pwa-192x192.png` (192x192 pixels)
   - `pwa-512x512.png` (512x512 pixels)

2. Deploy to production (HTTPS required for PWA)

3. Users can install via browser:
   - **Mobile:** Browser menu → "Add to Home Screen"
   - **Desktop:** Address bar install icon or browser menu

4. Features:
   - ✅ Offline functionality
   - ✅ App-like experience
   - ✅ Fast loading with caching
   - ✅ Background sync ready

## 🔒 Security Setup (CRITICAL!)

Before deploying to production, you **MUST** update Firebase security rules:

### Step 1: Firestore Rules
1. Go to Firebase Console → Firestore Database → Rules
2. Copy contents from `firebase-firestore-rules.txt`
3. Paste and publish

### Step 2: Storage Rules
1. Go to Firebase Console → Storage → Rules
2. Copy contents from `firebase-storage-rules.txt`
3. Paste and publish

**These rules ensure:**
- ✅ Users can only access their own data
- ✅ Proper authentication checks on all operations
- ✅ File type and size validation
- ✅ Prevention of unauthorized access
- ✅ Protection against data breaches

## 📂 Project Structure

```
src/
├── feature/
│   ├── authentication/
│   │   ├── model/         # Firebase config, auth types, context
│   │   ├── view/          # Login, Register screens
│   │   └── controller/    # Auth functions and hooks
│   ├── media/
│   │   ├── model/         # Media types and interfaces
│   │   ├── view/          # Grid, Preview modal components
│   │   └── controller/    # Upload, library, counts hooks
│   ├── albums/
│   │   ├── model/         # Album types and interfaces
│   │   ├── view/          # Album cards, dialogs
│   │   └── controller/    # Album CRUD operations
│   ├── refetch/
│   │   ├── model/         # Cache DB, refetch types, settings
│   │   ├── view/          # Memories widget component
│   │   └── controller/    # Refetch logic and settings hooks
│   └── settings/
│       ├── model/         # Settings types and interfaces
│       └── controller/    # Settings management hooks
├── components/
│   ├── ui/                # Shadcn/ui components
│   ├── AppSidebar.tsx     # Navigation sidebar
│   ├── ErrorBoundary.tsx  # Error boundary wrapper
│   ├── ProtectedRoute.tsx # Route protection HOC
│   └── ProtectedLayout.tsx # Layout with sidebar
├── pages/
│   ├── Dashboard.tsx      # Main dashboard with stats
│   ├── UploadMedia.tsx    # File upload page
│   ├── MediaLibrary.tsx   # Library grid view
│   ├── Albums.tsx         # Albums list page
│   ├── AlbumDetail.tsx    # Single album view
│   ├── Settings.tsx       # User settings page
│   ├── LandingPage.tsx    # Public landing page
│   └── NotFound.tsx       # 404 error page
└── hooks/
    └── use-toast.ts       # Toast notifications hook
```

## 🎯 Key Features Explained

### Random Memory Refetch
The core feature that brings memories back to life:
- **Smart Selection:** Randomly picks media ensuring max 50% are videos
- **Configurable Schedule:** Choose daily, weekly, or monthly refetch
- **Local Caching:** Downloads selected memories for offline viewing
- **Auto-Refetch:** Automatically fetches new memories when app opens if schedule passed
- **Manual Refresh:** Click refresh button anytime for new selection
- **Offline Support:** Shows cached memories when offline

### IndexedDB Caching System
Robust offline storage:
- **Local Storage:** Keeps memories in browser's IndexedDB
- **Configurable Size:** Set cache limit from 100MB to 1GB
- **Usage Tracking:** See exactly how much space is used
- **Manual Clear:** Clear cache anytime to free space
- **Background Download:** Files download in background after selection

### Album Organization
Flexible media organization:
- **Multiple Albums:** Add same media to different albums
- **Safe Delete:** Deleting album preserves media files
- **Auto Covers:** First image becomes album cover
- **Quick Add:** Add to album from library preview
- **Batch Support:** Efficiently handles large albums

### Sidebar Navigation
Modern app navigation:
- **Collapsible:** Sidebar collapses to icons on smaller screens
- **Active Highlighting:** Current page clearly marked
- **Mobile Menu:** Hamburger menu for mobile devices
- **Quick Access:** All main features one click away

## 🧪 Testing Checklist

### Authentication
- [ ] Register new account with email/password
- [ ] Login with existing account
- [ ] Google Sign-In flow
- [ ] Password reset email
- [ ] Session persists after refresh
- [ ] Logout functionality

### Media Upload
- [ ] Drag and drop files
- [ ] Click to select files
- [ ] Upload multiple files at once
- [ ] Progress bars show correctly
- [ ] File validation works (reject invalid types)
- [ ] Size limit enforced (100MB)

### Media Library
- [ ] Grid displays all media
- [ ] Filter by Images/Videos
- [ ] Sort by newest/oldest
- [ ] Load more pagination
- [ ] Preview modal opens
- [ ] Download button works
- [ ] Delete with confirmation

### Albums
- [ ] Create new album
- [ ] Add media to album
- [ ] View album contents
- [ ] Rename album
- [ ] Delete album (media preserved)
- [ ] Remove media from album

### Memory Refetch
- [ ] Today's Memories widget shows
- [ ] Random selection displayed
- [ ] Refresh button loads new memories
- [ ] Offline mode shows cached memories
- [ ] Schedule settings apply correctly

### Settings
- [ ] Change refetch frequency
- [ ] Adjust memory count
- [ ] Set cache size limit
- [ ] View storage statistics
- [ ] Clear cache works
- [ ] Password reset email sent
- [ ] Account deletion removes all data

### Mobile & PWA
- [ ] Responsive on mobile devices
- [ ] Sidebar collapses properly
- [ ] Touch targets easy to hit
- [ ] PWA install prompt appears
- [ ] Offline mode works
- [ ] Cached assets load fast

## 📦 Deployment

See **`DEPLOYMENT.md`** for comprehensive deployment guide including:
- Firebase security rules configuration
- Environment variables setup
- Firebase Hosting deployment steps
- PWA manifest and icons
- Performance optimization tips
- Monitoring and analytics setup
- Post-deployment testing checklist

### Quick Deploy Steps

1. **Update Firebase Rules** (CRITICAL!)
   - Copy `firebase-firestore-rules.txt` to Firestore Rules
   - Copy `firebase-storage-rules.txt` to Storage Rules

2. **Add PWA Icons**
   - Create `pwa-192x192.png` and `pwa-512x512.png`
   - Place in `/public` folder

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Deploy**
   - Use Lovable's "Publish" button, or
   - Deploy to Firebase Hosting manually

## 🎨 Design Features

- Clean, modern interface with Shadcn/ui
- Dark/light mode support
- Smooth animations and transitions
- Loading states everywhere
- Error states with retry options
- Empty states with helpful prompts
- Toast notifications for feedback
- Skeleton loaders during data fetch

## 🚀 Performance Optimizations

- ✅ Lazy loading all routes
- ✅ Code splitting with React.lazy()
- ✅ Image lazy loading in grids
- ✅ Pagination for large datasets
- ✅ IndexedDB for offline caching
- ✅ Service Worker for static assets
- ✅ Optimized Firebase queries
- ✅ Debounced search and filters

## 🤝 Contributing

This is a complete, production-ready application. All planned phases are implemented:
- ✅ Phase 1: Authentication
- ✅ Phase 2: Media Upload
- ✅ Phase 3: Media Library
- ✅ Phase 3.5: Album Management
- ✅ Phase 4: Sync & Refetch
- ✅ Phase 5: User Settings
- ✅ Phase 6: Polish & Deploy

## 📄 License

MIT License - feel free to use this project as a template for your own applications.

## 🔗 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)

## 🎉 Acknowledgments

Built with love using:
- **Firebase** for scalable backend infrastructure
- **Shadcn/ui** for beautiful, accessible components
- **React 18** for modern, efficient UI
- **IndexedDB** for robust offline capabilities
- **Lovable** development platform

---

**Start preserving your memories today! 📸✨**

Built with ❤️ using [Lovable](https://lovable.dev)
