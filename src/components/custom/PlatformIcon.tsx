import { Badge } from '@/components/ui/badge';

interface PlatformIconProps {
    platformCode: string; // 'facebook', 'tiktok', 'google', etc.
    showName?: boolean;
    className?: string;
    variant?: 'icon' | 'badge';
    size?: number | string;
}

const PLATFORM_CONFIG: Record<string, { icon: string; color: string; name: string }> = {
    facebook: { icon: 'F', color: 'bg-blue-100 text-blue-600', name: 'Facebook' },
    tiktok: { icon: 'T', color: 'bg-black text-white', name: 'TikTok' },
    google: { icon: 'G', color: 'bg-red-100 text-red-600', name: 'Google' },
    default: { icon: 'P', color: 'bg-gray-100 text-gray-600', name: 'Platform' },
};

export function PlatformIcon({ platformCode, showName = false, className = '', variant = 'icon', size }: PlatformIconProps) {
    const code = (platformCode || 'default').toLowerCase();
    const config = PLATFORM_CONFIG[code] || PLATFORM_CONFIG.default;

    if (variant === 'badge') {
        return (
            <Badge variant="outline" className={`${config.color} border-current/20 ${className}`}>
                {config.name}
            </Badge>
        )
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span
                className={`flex items-center justify-center rounded-full text-[10px] font-bold ${config.color}`}
                style={{ width: size ? (typeof size === 'number' ? `${size}px` : size) : '20px', height: size ? (typeof size === 'number' ? `${size}px` : size) : '20px' }}
                title={config.name}
            >
                {config.icon}
            </span>
            {showName && <span className="text-sm font-medium">{config.name}</span>}
        </div>
    );
}
