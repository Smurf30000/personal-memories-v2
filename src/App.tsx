import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import LandingPage from "./pages/LandingPage";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./feature/authentication/model/AuthContext";
import { LoginScreen } from "./feature/authentication/view/LoginScreen";
import { RegisterScreen } from "./feature/authentication/view/RegisterScreen";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProtectedLayout } from "./components/ProtectedLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy load protected routes for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UploadMedia = lazy(() => import("./pages/UploadMedia"));
const MediaLibrary = lazy(() => import("./pages/MediaLibrary"));
const Albums = lazy(() => import("./pages/Albums"));
const AlbumDetail = lazy(() => import("./pages/AlbumDetail"));
const Settings = lazy(() => import("./pages/Settings"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <Dashboard />
                    </Suspense>
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/upload" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <UploadMedia />
                    </Suspense>
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/library" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <MediaLibrary />
                    </Suspense>
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/albums" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <Albums />
                    </Suspense>
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/albums/:albumId" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <AlbumDetail />
                    </Suspense>
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <Settings />
                    </Suspense>
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

/**
 * Loading fallback for lazy-loaded routes
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-full max-w-4xl p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export default App;
