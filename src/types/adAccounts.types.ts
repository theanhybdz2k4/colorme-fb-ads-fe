export interface BranchSummary {
    id: number;
    name: string;
    code?: string | null;
}

export interface PlatformAccount {
    id: number;
    name: string | null;
    externalId: string;
    accountStatus: string; // UnifiedStatus: ACTIVE, PAUSED, DELETED, etc.
    currency: string | null;
    timezone: string | null;
    amountSpent?: string | null;
    syncedAt: string | null;
    branch?: BranchSummary | null;
}

// For compatibility during migration
export type AdAccount = PlatformAccount;

export const PLATFORM_ACCOUNT_STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    'ACTIVE': { label: 'Active', variant: 'default' },
    'DISABLED': { label: 'Disabled', variant: 'destructive' },
    'PAUSED': { label: 'Paused', variant: 'secondary' },
    'PENDING': { label: 'Pending', variant: 'outline' },
};

export const AD_ACCOUNT_STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'DISABLED', label: 'Disabled' },
];
