export interface Ad {
    id: string;
    name: string | null;
    status: string;
    effectiveStatus: string | null;
    accountId: string;
    adsetId: string;
    syncedAt: string;
    creative?: any;
    thumbnailUrl?: string | null;
    metrics?: {
        results: number;
        costPerResult: number;
        messagingStarted: number;
        costPerMessaging: number;
    };
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
