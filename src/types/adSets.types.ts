export interface Adset {
  id: string;
  name: string | null;
  status: string;
  effectiveStatus: string | null;
  dailyBudget: string | null;
  optimizationGoal: string | null;
  accountId: string;
  campaignId: string;
  syncedAt: string;
}

export const ADSET_STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
];

export function getAdsetStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ACTIVE': return 'default';
    case 'PAUSED': return 'secondary';
    case 'DELETED': return 'destructive';
    default: return 'outline';
  }
}
