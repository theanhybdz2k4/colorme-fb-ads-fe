export interface AdGroup {
  id: string;
  externalId: string;
  accountId: number;
  campaignId: string;
  name: string | null;
  status: string; // UnifiedStatus: ACTIVE, PAUSED, DELETED, etc.
  dailyBudget: string | null;
  optimizationGoal?: string | null;
  effectiveStatus: string | null;
  syncedAt: string;
}

// For compatibility during migration
export type Adset = AdGroup;

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
