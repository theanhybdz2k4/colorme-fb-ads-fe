import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import Icon from '@/components/shared/common/Icon';
import { PlatformTabs } from './PlatformTabs';
import { UserMenu } from './UserMenu';

interface HeaderProps {
    onToggleSidebar: () => void;
    title?: string;
}

export function Header({ onToggleSidebar, title = "Dashboard" }: HeaderProps) {
    return (
        <header className={cn(
            "fixed top-0 right-0 z-20 h-22 max-md:h-18 bg-b-surface1/80 backdrop-blur-xl transition-all",
            "left-85 max-4xl:left-70 max-3xl:left-60 max-xl:left-0"
        )}>
            <div className="h-full center-with-sidebar flex items-center justify-between gap-4">
                {/* Left Header - Mobile Menu & Platform */}
                <div className="flex items-center gap-3 lg:gap-6 flex-1 max-w-3xl">
                    <div className="flex items-center gap-3 xl:hidden">
                        <Button
                            className="size-10 flex flex-col gap-[3px] items-center justify-center bg-b-pop border border-s-subtle rounded-xl hover:bg-b-surface2 shadow-widget transition-all"
                            variant="ghost"
                            onClick={onToggleSidebar}
                        >
                            <div className="w-4 h-[1.5px] rounded-full bg-t-secondary transition-colors group-hover:bg-t-primary" />
                            <div className="w-4 h-[1.5px] rounded-full bg-t-secondary transition-colors group-hover:bg-t-primary" />
                            <div className="w-4 h-[1.5px] rounded-full bg-t-secondary transition-colors group-hover:bg-t-primary" />
                        </Button>
                    </div>

                    <h1 className="text-h6 max-lg:text-sub-title-1 font-bold whitespace-nowrap hidden sm:block tracking-tight">{title}</h1>
                    <div className="max-sm:hidden flex-1 overflow-hidden">
                        <PlatformTabs />
                    </div>

                    <div className="relative flex-1 group max-w-sm hidden sm:block">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Icon name="search" className="size-5 fill-t-secondary group-focus-within:fill-t-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="w-full h-12 pl-10.5 pr-4 bg-b-surface2 rounded-4xl border border-transparent focus:bg-transparent focus:shadow-input-typing focus:border-s-stroke2 transition-all text-sm text-t-primary placeholder:text-t-secondary outline-none dark:border-s-subtle"
                        />
                    </div>
                </div>

                {/* Right Header - Controls & User */}
                <div className="flex items-center gap-3">
                    <button className="relative size-11 rounded-2xl bg-b-pop border border-s-subtle flex items-center justify-center text-t-tertiary hover:text-t-primary hover:bg-b-surface2 transition-all shadow-widget active:scale-95">
                        <Icon name="bell" className="size-5 fill-current" />
                        <span className="absolute top-3 right-3 size-2 bg-primary-03 rounded-full border-2 border-b-pop" />
                    </button>

                    <div className="h-6 w-px bg-s-subtle/50 mx-1 max-sm:hidden" />
                    <div className="max-sm:hidden">
                        <ModeToggle />
                    </div>

                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
