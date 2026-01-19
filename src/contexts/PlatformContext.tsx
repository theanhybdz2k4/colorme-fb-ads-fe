import { createContext, useContext, useState, type ReactNode } from 'react';

export type PlatformCode = 'all' | 'facebook' | 'tiktok' | 'google';

export interface Platform {
    code: PlatformCode;
    label: string;
    icon?: string;
}

export const PLATFORMS: Platform[] = [
    { code: 'all', label: 'Tất cả' },
    { code: 'facebook', label: 'Facebook' },
    { code: 'tiktok', label: 'TikTok' },
    { code: 'google', label: 'Google' },
];

interface PlatformContextType {
    activePlatform: PlatformCode;
    setActivePlatform: (platform: PlatformCode) => void;
    platforms: Platform[];
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export function PlatformProvider({ children }: { children: ReactNode }) {
    const [activePlatform, setActivePlatform] = useState<PlatformCode>('all');

    return (
        <PlatformContext.Provider value={{ activePlatform, setActivePlatform, platforms: PLATFORMS }}>
            {children}
        </PlatformContext.Provider>
    );
}

export function usePlatform() {
    const context = useContext(PlatformContext);
    if (context === undefined) {
        throw new Error('usePlatform must be used within a PlatformProvider');
    }
    return context;
}
