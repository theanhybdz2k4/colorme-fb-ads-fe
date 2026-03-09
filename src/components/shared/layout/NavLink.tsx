import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Icon from '@/components/shared/common/Icon';

interface NavLinkProps {
    item: {
        path: string;
        label: string;
        icon: string;
        counter?: number;
    };
    expanded: boolean;
    onClick?: () => void;
}

export function NavLink({ item, expanded, onClick }: NavLinkProps) {
    const location = useLocation();
    const isActive = location.pathname === item.path;

    return (
        <Link
            to={item.path}
            onClick={onClick}
            className={cn(
                "group relative flex items-center shrink-0 gap-3 h-12 px-3 text-button transition-colors hover:text-t-primary",
                isActive ? "text-t-primary" : "text-t-secondary"
            )}
        >
            {isActive && (
                <div className="absolute inset-0 gradient-menu rounded-xl shadow-depth-menu">
                    <div className="absolute inset-0.25 bg-b-pop rounded-[0.6875rem]"></div>
                </div>
            )}
            <Icon
                name={item.icon}
                className={cn(
                    "relative z-2 transition-colors group-hover:fill-t-primary size-6",
                    isActive ? "fill-t-primary" : "fill-t-secondary"
                )}
            />
            <div className={cn(
                "relative z-2 mr-3 whitespace-nowrap transition-all duration-300",
                expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0 overflow-hidden"
            )}>
                {item.label}
            </div>
            {item.counter !== undefined && (
                <div className={cn(
                    "relative z-2 flex justify-center items-center w-6 h-6 ml-auto rounded-lg text-button text-shade-01",
                    isActive ? "bg-secondary-01 scale-100" : "bg-secondary-01/30 scale-90",
                    expanded ? "opacity-100" : "opacity-0 scale-50"
                )}>
                    {item.counter}
                </div>
            )}
        </Link>
    );
}
