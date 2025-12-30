import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/fb-accounts', label: 'Tài khoản FB', icon: '👤' },
    { path: '/ad-accounts', label: 'Ad Accounts', icon: '💳' },
    { path: '/campaigns', label: 'Campaigns', icon: '📣' },
    { path: '/adsets', label: 'Ad Sets', icon: '📁' },
    { path: '/ads', label: 'Ads', icon: '📝' },
    { path: '/insights', label: 'Insights', icon: '📈' },
    { path: '/jobs', label: 'Jobs', icon: '⚙️' },
];

export function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-white sticky top-0 z-50 w-full shadow">
                <div className="container mx-auto flex gap-6 h-14 items-center">
                    <div className="flex w-64">
                        <Link to="/" className="mr-6 flex items-center space-x-2">
                            <img src="./Icon.png" alt="" className='w-8 h-8 rounded-sm' />
                            <span className="font-bold">FB Ads Manager</span>
                        </Link>
                    </div>
                    <div className="flex flex-1 items-center justify-end space-x-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full cursor-pointer">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <div className="flex items-center justify-start gap-2 p-2">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">{user?.name || 'User'}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>Đăng xuất</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <div className="container mx-auto flex gap-6 pb-6">
                {/* Sidebar */}
                <aside className="w-64 shrink-0" style={{ boxShadow: '4px 0 4px -2px rgba(0, 0, 0, 0.1)' }}>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${location.pathname === item.path
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </aside>

                <Separator orientation="vertical" className="h-auto" />

                {/* Main content */}
                <main className="flex-1 min-w-0 pt-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
