import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/features/auth';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';
import { PlatformProvider, usePlatform, type PlatformCode } from '@/contexts';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Megaphone,
  FolderOpen,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  LogOut,
  PieChart,
  User,
  Target,
  Bot,
} from 'lucide-react';

const navItems = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.ACCOUNTS, label: 'Accounts', icon: Users },
  { path: ROUTES.AD_ACCOUNTS, label: 'Ad Accounts', icon: CreditCard },
  { path: ROUTES.CAMPAIGNS, label: 'Campaigns', icon: Megaphone },
  { path: ROUTES.ADSETS, label: 'Ad Sets', icon: FolderOpen },
  { path: ROUTES.ADS, label: 'Ads', icon: FileText },
  { path: ROUTES.INSIGHTS, label: 'Insights', icon: BarChart3 },
  { path: ROUTES.BRANCH_ANALYTICS, label: 'Thống kê cơ sở', icon: PieChart },
  { path: ROUTES.LEADS, label: 'Inbox', icon: Target },
  { path: ROUTES.CHATBOT, label: 'Chatbot', icon: Bot },
];

// Platform tab config with colors
const PLATFORM_TABS: { code: PlatformCode; label: string; icon: string; color: string; bgColor: string }[] = [
  { code: 'all', label: 'Tất cả', icon: '∞', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  { code: 'facebook', label: 'Facebook', icon: 'F', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { code: 'tiktok', label: 'TikTok', icon: 'T', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  { code: 'google', label: 'Google', icon: 'G', color: 'text-red-400', bgColor: 'bg-red-500/20' },
];

function PlatformTabs() {
  const { activePlatform, setActivePlatform } = usePlatform();

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-muted/30 rounded-lg">
      {PLATFORM_TABS.map((tab) => {
        const isActive = activePlatform === tab.code;
        return (
          <button
            key={tab.code}
            onClick={() => setActivePlatform(tab.code)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
              isActive
                ? `${tab.bgColor} ${tab.color}`
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <span className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
              isActive ? tab.bgColor : "bg-muted"
            )}>
              {tab.icon}
            </span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen",
          "bg-sidebar border-r border-sidebar-border",
          "transition-all duration-300 ease-out",
          sidebarExpanded ? "w-56" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <img src="https://d1j8r0kxyu9tj8.cloudfront.net/files/rkm8JsJ7zlX0QvlWP9OaoesMbi9MrN5OGxoedND6.jpg" alt="" className="w-8 h-8 rounded-md shrink-0" />
            <span
              className={cn(
                "font-semibold text-sidebar-foreground whitespace-nowrap",
                "transition-opacity duration-200",
                sidebarExpanded ? "opacity-100" : "opacity-0 w-0"
              )}
            >
              Ads Lytics
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5",
                  "text-sm transition-all duration-200",
                  "group relative",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                )}

                <Icon className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                )} />

                <span
                  className={cn(
                    "whitespace-nowrap transition-opacity duration-200",
                    sidebarExpanded ? "opacity-100" : "opacity-0 w-0"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className={cn(
            "absolute bottom-4 right-0 translate-x-1/2",
            "p-1.5 rounded-full bg-card border border-border",
            "text-muted-foreground hover:text-foreground",
            "transition-all duration-200 hover:scale-110",
            "shadow-lg"
          )}
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform duration-300",
            !sidebarExpanded && "rotate-180"
          )} />
        </button>
      </aside>

      {/* Main content area */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarExpanded ? "ml-56" : "ml-16"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 bg-card/80 backdrop-blur-sm border-b border-border/50">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Platform Tabs */}
            <div className="flex items-center gap-2">
              <PlatformTabs />
              <ModeToggle />
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full cursor-pointer">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={user?.avatarUrl || ''} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm uppercase">
                      {user?.name?.[0] || user?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-0">
                <div className="flex items-center gap-3 p-4 bg-muted/20">
                  <Avatar className="h-12 w-12 border border-border shadow-sm">
                    <AvatarImage src={user?.avatarUrl || ''} />
                    <AvatarFallback className="bg-muted text-muted-foreground uppercase">
                      {user?.name?.[0] || user?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5 overflow-hidden">
                    <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.PROFILE} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Hồ sơ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.SETTINGS} className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Cài đặt
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  return (
    <PlatformProvider>
      <DashboardContent />
    </PlatformProvider>
  );
}

