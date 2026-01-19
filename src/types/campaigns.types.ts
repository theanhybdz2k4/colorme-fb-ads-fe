export interface Campaign {
  id: string;
  externalId: string;
  accountId: number;
  name: string | null;
  status: string; // UnifiedStatus: ACTIVE, PAUSED, DELETED, etc.
  objective: string | null;
  dailyBudget: string | null;
  lifetimeBudget: string | null;
  startTime: string | null;
  endTime: string | null;
  effectiveStatus: string | null;
  syncedAt: string;
}

export const CAMPAIGN_STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
];

export function getCampaignStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ACTIVE': return 'default';
    case 'PAUSED': return 'secondary';
    case 'DELETED': return 'destructive';
    default: return 'outline';
  }
}
