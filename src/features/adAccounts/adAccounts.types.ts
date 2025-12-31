export interface AdAccount {
    id: string;
    name: string | null;
    accountStatus: number;
    currency: string;
    amountSpent: string | null;
    syncedAt: string;
}

export const AD_ACCOUNT_STATUS_MAP: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    1: { label: 'Active', variant: 'default' },
    2: { label: 'Disabled', variant: 'destructive' },
    3: { label: 'Unsettled', variant: 'secondary' },
};

export const AD_ACCOUNT_STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: '1', label: 'Active' },
    { value: '3', label: 'Unsettled' },
];
