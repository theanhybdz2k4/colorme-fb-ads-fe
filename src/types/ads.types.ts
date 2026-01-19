export interface Ad {
    id: string;
    externalId: string;
    accountId: number;
    adGroupId: string;
    name: string | null;
    status: string; // UnifiedStatus: ACTIVE, PAUSED, DELETED, etc.
    creativeData?: any;
    effectiveStatus: string | null;
    syncedAt: string;
    thumbnailUrl?: string | null;
    metrics?: {
        results: number;
        costPerResult: number;
        messagingStarted: number;
        costPerMessaging: number;
    };
    // For compatibility
    adsetId?: string;
}

export const AD_STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PAUSED', label: 'Paused' },
];

export function getAdStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'ACTIVE': return 'default';
        case 'PAUSED': return 'secondary';
        case 'DELETED': return 'destructive';
        default: return 'outline';
    }
}
