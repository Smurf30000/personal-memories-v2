import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import UploadMedia from "./pages/UploadMedia";
import MediaLibrary from "./pages/MediaLibrary";
import Albums from "./pages/Albums";
import AlbumDetail from "./pages/AlbumDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./feature/authentication/model/AuthContext";
import { LoginScreen } from "./feature/authentication/view/LoginScreen";
import { RegisterScreen } from "./feature/authentication/view/RegisterScreen";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <UploadMedia />
              </ProtectedRoute>
            } />
            <Route path="/library" element={
              <ProtectedRoute>
                <MediaLibrary />
              </ProtectedRoute>
            } />
            <Route path="/albums" element={
              <ProtectedRoute>
                <Albums />
              </ProtectedRoute>
            } />
            <Route path="/albums/:albumId" element={
              <ProtectedRoute>
                <AlbumDetail />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
