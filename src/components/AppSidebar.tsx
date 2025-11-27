import { Home, Upload, Library, FolderOpen, Settings, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/feature/authentication/model/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { logout } from '@/feature/authentication/controller/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Upload Media', url: '/upload', icon: Upload },
  { title: 'Library', url: '/library', icon: Library },
  { title: 'Albums', url: '/albums', icon: FolderOpen },
  { title: 'Settings', url: '/settings', icon: Settings },
];

/**
 * Application sidebar component with navigation
 */
export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  /**
   * Checks if route is active
   */
  const isActive = (path: string) => location.pathname === path;

  /**
   * Handles logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error logging out",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'justify-center' : ''}>
            {!isCollapsed && 'Personal Memories'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => navigate(item.url)}
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={`p-2 ${isCollapsed ? 'text-center' : 'flex items-center justify-between'}`}>
              {!isCollapsed && (
                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size={isCollapsed ? 'icon' : 'sm'}
                    className="flex-shrink-0"
                  >
                    <LogOut className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-2">Logout</span>}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Log out of your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will need to sign in again to access your memories. Any in-progress actions
                      may be lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Stay logged in</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>Log out</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
