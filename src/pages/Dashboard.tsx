import { Button } from "@/components/ui/button";
import { LogOut, Upload, Image, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/feature/authentication/model/AuthContext";
import { logout } from "@/feature/authentication/controller/useAuth";
import { toast } from "@/hooks/use-toast";
import { useMediaCounts } from "@/feature/media/controller/useMediaCounts";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Protected dashboard for authenticated users
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { counts, loading } = useMediaCounts(user?.uid);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error logging out",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center border-b">
        <h1 className="text-2xl font-bold text-primary">Personal Memories</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user?.email}
          </span>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Welcome back!</h2>
          <p className="text-muted-foreground mb-12">
            Manage your memories, create albums, and access your media library.
          </p>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div 
              className="bg-card p-6 rounded-lg border hover:border-primary transition-colors cursor-pointer"
              onClick={() => navigate('/upload')}
            >
              <Upload className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload Media</h3>
              <p className="text-sm text-muted-foreground">
                Add new photos and videos to your library
              </p>
              <Button className="mt-4 w-full">
                Upload Now
              </Button>
            </div>

            <div className="bg-card p-6 rounded-lg border hover:border-primary transition-colors cursor-pointer">
              <Image className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">View Library</h3>
              <p className="text-sm text-muted-foreground">
                Browse all your photos and videos
              </p>
              <Button className="mt-4 w-full" disabled>
                Coming Soon
              </Button>
            </div>

            <div className="bg-card p-6 rounded-lg border hover:border-primary transition-colors cursor-pointer">
              <FolderOpen className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Manage Albums</h3>
              <p className="text-sm text-muted-foreground">
                Organize your memories into albums
              </p>
              <Button className="mt-4 w-full" disabled>
                Coming Soon
              </Button>
            </div>
          </div>

          {/* Stats/Info Section */}
          <div className="bg-card p-8 rounded-lg border">
            <h3 className="text-2xl font-semibold mb-4">Your Library</h3>
            {loading ? (
              <div className="grid grid-cols-3 gap-6 text-center">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">{counts.photos}</p>
                  <p className="text-sm text-muted-foreground">Photos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">{counts.videos}</p>
                  <p className="text-sm text-muted-foreground">Videos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">{counts.albums}</p>
                  <p className="text-sm text-muted-foreground">Albums</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
