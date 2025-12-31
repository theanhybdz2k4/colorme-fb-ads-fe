import { useState, useEffect } from 'react';

type ViewMode = 'grid' | 'list';

const STORAGE_KEY = 'fb-ads-view-preference';

interface ViewPreferences {
    [key: string]: ViewMode;
}

export function useViewPreference(pageKey: string, defaultMode: ViewMode = 'grid') {
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const prefs: ViewPreferences = JSON.parse(stored);
                return prefs[pageKey] || defaultMode;
            }
        } catch {
            // Ignore localStorage errors
        }
        return defaultMode;
    });

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const prefs: ViewPreferences = stored ? JSON.parse(stored) : {};
            prefs[pageKey] = viewMode;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
        } catch {
            // Ignore localStorage errors
        }
    }, [pageKey, viewMode]);

    return [viewMode, setViewMode] as const;
}
