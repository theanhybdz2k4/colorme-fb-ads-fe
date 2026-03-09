import { usePlatform, type PlatformCode } from '@/contexts';
import { cn } from '@/lib/utils';

const PLATFORM_TABS: { code: PlatformCode; label: string; icon: string; color: string; bgColor: string }[] = [
    { code: 'all', label: 'Tất cả', icon: '∞', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    { code: 'facebook', label: 'Facebook', icon: 'F', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    { code: 'tiktok', label: 'TikTok', icon: 'T', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
    { code: 'google', label: 'Google', icon: 'G', color: 'text-red-400', bgColor: 'bg-red-500/20' },
];

export function PlatformTabs() {
    const { activePlatform, setActivePlatform } = usePlatform();

    return (
        <div className="flex items-center gap-1 p-1 bg-b-depth2/50 rounded-4xl border border-s-subtle/50">
            {PLATFORM_TABS.map((tab) => {
                const isActive = activePlatform === tab.code;
                return (
                    <button
                        key={tab.code}
                        onClick={() => setActivePlatform(tab.code)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-[1.75rem] text-[11px] font-bold tracking-wide transition-all duration-200 uppercase",
                            isActive
                                ? "bg-b-surface2 shadow-depth-toggle text-t-primary"
                                : "text-t-secondary hover:text-t-primary"
                        )}
                    >
                        <span className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-s-subtle",
                            isActive ? "bg-b-surface1" : "bg-transparent"
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
