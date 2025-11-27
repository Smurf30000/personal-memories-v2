import { Button } from "@/components/ui/button";
import { ArrowRight, Cloud, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/feature/authentication/model/AuthContext";
import { useEffect } from "react";

/**
 * Public landing page for unauthenticated users
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Personal Memories</h1>
        <div className="space-x-4">
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Sign In
          </Button>
          <Button onClick={() => navigate("/register")}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Your Memories, Always With You
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Upload, manage, and sync your personal photos and videos. Access your
          favorite memories anywhere, anytime.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/register")}>
            Start Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
            Sign In
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">
          Why Choose Personal Memories?
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-lg border">
            <Cloud className="h-12 w-12 text-primary mb-4" />
            <h4 className="text-xl font-semibold mb-2">Cloud Sync</h4>
            <p className="text-muted-foreground">
              Automatic synchronization keeps your memories safe and accessible
              across all your devices.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h4 className="text-xl font-semibold mb-2">Secure Storage</h4>
            <p className="text-muted-foreground">
              Your photos and videos are encrypted and stored securely in the
              cloud with Firebase.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <Zap className="h-12 w-12 text-primary mb-4" />
            <h4 className="text-xl font-semibold mb-2">Smart Caching</h4>
            <p className="text-muted-foreground">
              Intelligent local caching ensures your favorite memories are
              always available offline.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground border-t">
        <p>&copy; 2024 Personal Memories. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
