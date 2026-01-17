export interface Campaign {
  id: string;
  name: string | null;
  status: string;
  effectiveStatus: string | null;
  objective: string | null;
  dailyBudget: string | null;
  accountId: string;
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
