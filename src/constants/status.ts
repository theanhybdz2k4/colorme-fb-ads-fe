export const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
] as const;

export const EFFECTIVE_STATUS = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  DELETED: 'DELETED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export function getStatusVariant(status: string): StatusVariant {
  switch (status) {
    case 'ACTIVE':
      return 'default';
    case 'PAUSED':
      return 'secondary';
    case 'DELETED':
    case 'ARCHIVED':
      return 'destructive';
    default:
      return 'outline';
  }
}
