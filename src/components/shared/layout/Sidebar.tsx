import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Icon from '@/components/shared/common/Icon';
import { NavLink } from './NavLink';
import { ROUTES } from '@/constants';

interface NavItem {
    path: string;
    label: string;
    icon: string;
    counter?: number;
}

const navItems: NavItem[] = [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'dashboard' },
    { path: ROUTES.ACCOUNTS, label: 'Accounts', icon: 'profile' },
    { path: ROUTES.AD_ACCOUNTS, label: 'Ad Accounts', icon: 'wallet' },
    { path: ROUTES.CAMPAIGNS, label: 'Campaigns', icon: 'send' },
    { path: ROUTES.ADSETS, label: 'Ad Sets', icon: 'cube' },
    { path: ROUTES.ADS, label: 'Ads', icon: 'desktop' },
    { path: ROUTES.INSIGHTS, label: 'Insights', icon: 'chart' },
    { path: ROUTES.BRANCH_ANALYTICS, label: 'Thống kê cơ sở', icon: 'bag' },
    { path: ROUTES.LEADS, label: 'Inbox', icon: 'chat' },
    { path: ROUTES.CHATBOT, label: 'Chatbot', icon: 'camera-video' },
    { path: ROUTES.AI_REPORTS, label: 'AI Reports', icon: 'star' },
];

interface SidebarProps {
    visible: boolean;
    onClose: () => void;
    expanded?: boolean;
}

export function Sidebar({ visible, onClose, expanded = true }: SidebarProps) {
    return (
        <>
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen p-5 bg-b-surface1 transition-all duration-300 ease-in-out flex flex-col max-md:p-3",
                    expanded ? "w-85 max-4xl:w-70 max-3xl:w-60 max-xl:w-74" : "w-20",
                    visible ? "translate-x-0" : "max-xl:-translate-x-full"
                )}
            >
                {/* Logo */}
                <div className="mb-5 flex items-center px-0 shrink-0">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="size-10 rounded-xl flex items-center justify-center shrink-0">
                            <img
                                src="https://d1j8r0kxyu9tj8.cloudfront.net/files/rkm8JsJ7zlX0QvlWP9OaoesMbi9MrN5OGxoedND6.jpg"
                                alt="Logo"
                                className="size-10 rounded-lg"
                            />
                        </div>
                        {expanded && (
                            <span className="font-bold text-xl tracking-tight text-t-primary whitespace-nowrap font-inter animate-in fade-in duration-500">
                                Ads Lytics
                            </span>
                        )}
                    </Link>
                    <Button
                        className="group absolute top-5 right-5 max-md:top-3 max-md:right-3 hidden! max-xl:flex!"
                        variant="ghost"
                        onClick={onClose}
                    >
                        <Icon name="close" className="size-6 fill-t-secondary group-hover:fill-t-primary" />
                    </Button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto scrollbar-none -mx-5 px-5 max-md:-mx-3 max-md:px-3">
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <NavLink key={item.path} item={item} expanded={expanded} onClick={() => visible && onClose()} />
                        ))}
                    </nav>
                </div>

                {/* Bottom section */}
                <div className="mt-auto pt-6 max-md:pt-4 border-t border-s-subtle/30 shrink-0">
                    <NavLink
                        item={{ path: ROUTES.SETTINGS, label: 'Cài đặt', icon: 'filters' }}
                        expanded={expanded}
                        onClick={() => visible && onClose()}
                    />
                </div>
            </aside>

            {/* Overlay for mobile */}
            <div
                className={cn(
                    "fixed inset-0 z-30 bg-shade-07/70 transition-all duration-300 dark:bg-shade-04/90 xl:hidden",
                    visible ? "visible opacity-100" : "invisible opacity-0"
                )}
                onClick={onClose}
            />
        </>
    );
}
