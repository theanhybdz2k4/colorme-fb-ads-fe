import { useQuery } from '@tanstack/react-query';
import { adAccountsApi } from './adAccounts.api';
import type { AdAccount } from './adAccounts.types';

export function useAdAccounts(filters?: { accountStatus?: string; search?: string; branchId?: number | 'all' }) {
  return useQuery({
    queryKey: ['ad-accounts', filters],
    queryFn: async () => {
      const { data } = await adAccountsApi.list(filters);
      return (data.result || data.data || data || []) as AdAccount[];
    },
  });
}
