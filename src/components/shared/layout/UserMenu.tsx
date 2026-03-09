import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants';
import { LogOut, User, Settings } from 'lucide-react';

export function UserMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate(ROUTES.LOGIN);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-11 w-11 rounded-2xl p-0 hover:bg-b-surface2 border border-s-subtle shadow-widget">
                    <Avatar className="size-9 rounded-lg transition-all hover:scale-105">
                        <AvatarImage src={user?.avatarUrl || ''} className="rounded-lg" />
                        <AvatarFallback className="bg-primary-01 text-white text-sm font-bold rounded-lg uppercase">
                            {user?.name?.[0] || user?.email?.[0] || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-1 rounded-2xl border-s-subtle bg-b-pop shadow-2xl">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-b-surface1/50 mb-1">
                    <Avatar className="size-12 border-2 border-primary-01/20 rounded-2xl shadow-lg">
                        <AvatarImage src={user?.avatarUrl || ''} className="rounded-2xl" />
                        <AvatarFallback className="bg-primary-01 text-white text-lg font-bold rounded-2xl uppercase">
                            {user?.name?.[0] || user?.email?.[0] || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5 overflow-hidden">
                        <p className="text-sm font-bold truncate leading-tight text-t-primary">{user?.name || 'User'}</p>
                        <p className="text-xs text-t-tertiary truncate">{user?.email}</p>
                    </div>
                </div>
                <DropdownMenuSeparator className="bg-s-subtle/50" />
                <div className="p-1">
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 focus:bg-b-surface2">
                        <Link to={ROUTES.PROFILE} className="flex items-center">
                            <User className="h-4 w-4 mr-3 text-t-tertiary" />
                            <span className="font-semibold text-sm text-t-primary">Hồ sơ</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 focus:bg-b-surface2">
                        <Link to={ROUTES.SETTINGS} className="flex items-center">
                            <Settings className="h-4 w-4 mr-3 text-t-tertiary" />
                            <span className="font-semibold text-sm text-t-primary">Cài đặt</span>
                        </Link>
                    </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-s-subtle/50" />
                <div className="p-1">
                    <DropdownMenuItem onClick={handleLogout} className="rounded-2xl text-primary-03 focus:text-primary-03 focus:bg-primary-03/10 cursor-pointer py-2.5">
                        <LogOut className="h-4 w-4 mr-3" />
                        <span className="font-bold text-sm">Đăng xuất</span>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
