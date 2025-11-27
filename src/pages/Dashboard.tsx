import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/feature/authentication/model/AuthContext";
import { useMediaCounts } from "@/feature/media/controller/useMediaCounts";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemoryRefetch } from "@/feature/refetch/controller/useMemoryRefetch";
import { MemoriesWidget } from "@/feature/refetch/view/MemoriesWidget";
import { useMediaLibrary } from "@/feature/media/controller/useMediaLibrary";
import { useAlbums } from "@/feature/albums/controller/useAlbums";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

/**
 * Protected dashboard for authenticated users
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { counts, loading } = useMediaCounts(user?.uid);
  const { memories, loading: memoriesLoading, isOnline, refetch } = useMemoryRefetch(user?.uid);
  const { deleteMedia } = useMediaLibrary(user?.uid);
  const { albums } = useAlbums(user?.uid);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h2 className="text-4xl font-bold mb-4">Welcome back!</h2>
          <p className="text-muted-foreground mb-12">
            Manage your memories, create albums, and access your media library.
          </p>

          {/* Today's Memories Widget */}
          <div className="mb-12">
            <MemoriesWidget 
              memories={memories}
              loading={memoriesLoading}
              isOnline={isOnline}
              onRefresh={refetch}
              onDelete={deleteMedia}
            />
          </div>

          {/* Stats Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Library</CardTitle>
              <CardDescription>Overview of your media collection</CardDescription>
            </CardHeader>
            <CardContent>
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
                    <p className="text-3xl font-bold text-primary">{albums.length}</p>
                    <p className="text-sm text-muted-foreground">Albums</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
