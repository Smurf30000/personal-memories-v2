import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/feature/authentication/model/AuthContext';
import { useUserSettings } from '@/feature/settings/controller/useUserSettings';
import { useStorageInfo } from '@/feature/settings/controller/useStorageInfo';
import { useAccountActions } from '@/feature/settings/controller/useAccountActions';
import { useTheme } from '@/components/theme-provider';
import { clearCachedMemories } from '@/feature/refetch/model/cacheDb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Trash2, LogOut, Key, Moon, Sun, Monitor } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

/**
 * Settings page component
 */
export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const { settings, loading: settingsLoading, saveSettings } = useUserSettings(user?.uid);
  const { storageInfo, cacheInfo, loading: storageLoading, refetch: refetchStorage } = useStorageInfo(user?.uid);
  const { loading: actionLoading, sendPasswordReset, deleteAccount } = useAccountActions();
  const [clearingCache, setClearingCache] = useState(false);

  /**
   * Handles cache clearing
   */
  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await clearCachedMemories();
      await refetchStorage();
      toast({
        title: "Cache Cleared",
        description: "All cached memories have been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cache",
        variant: "destructive",
      });
    } finally {
      setClearingCache(false);
    }
  };

  /**
   * Handles account deletion
   */
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(user?.uid || '');
      navigate('/login');
    } catch (error) {
      // Error handled in hook
    }
  };

  /**
   * Handles logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the visual theme of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <Select 
                value={theme}
                onValueChange={(value: any) => setTheme(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span>System</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select your preferred theme or use system settings
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Refetch Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Memory Refetch Settings</CardTitle>
            <CardDescription>
              Control how often new random memories are selected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settingsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Refetch Frequency</label>
                  <Select 
                    value={settings?.refetchFrequency || 'daily'}
                    onValueChange={(value: any) => saveSettings({ refetchFrequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily - Every 24 hours</SelectItem>
                      <SelectItem value="weekly">Weekly - Every 7 days</SelectItem>
                      <SelectItem value="monthly">Monthly - Every 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Number of Memories ({settings?.memoryCount || 8})
                  </label>
                  <Slider
                    value={[settings?.memoryCount || 8]}
                    onValueChange={(value) => saveSettings({ memoryCount: value[0] })}
                    min={5}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    How many random memories to show at once
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Cache Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Cache Settings</CardTitle>
            <CardDescription>
              Manage offline storage for memories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settingsLoading || storageLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Cache Size Limit ({settings?.cacheSize || 100} MB)
                  </label>
                  <Slider
                    value={[settings?.cacheSize || 100]}
                    onValueChange={(value) => saveSettings({ cacheSize: value[0] })}
                    min={100}
                    max={1000}
                    step={50}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum storage for cached memories
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Cache Usage</p>
                    <p className="text-2xl font-bold">{cacheInfo.cacheMB} MB</p>
                    <p className="text-xs text-muted-foreground">{cacheInfo.cacheItemCount} items</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <Button 
                      variant="outline" 
                      onClick={handleClearCache}
                      disabled={clearingCache || cacheInfo.cacheItemCount === 0}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {clearingCache ? 'Clearing...' : 'Clear Cache'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Storage Info */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Information</CardTitle>
            <CardDescription>
              Your media library statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {storageLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Media</p>
                  <p className="text-2xl font-bold">{storageInfo.totalMediaCount}</p>
                  <p className="text-xs text-muted-foreground">files</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold">
                    {storageInfo.totalStorageGB >= 1 
                      ? `${storageInfo.totalStorageGB} GB`
                      : `${storageInfo.totalStorageMB} MB`
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">in Firebase Storage</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account and security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Email Address</p>
              <p className="font-medium">{user?.email}</p>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                onClick={() => sendPasswordReset(user?.email || '')}
                disabled={actionLoading}
              >
                <Key className="mr-2 h-4 w-4" />
                Change Password
              </Button>

              <Button 
                variant="outline" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account,
                      all your media files, and remove all data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
