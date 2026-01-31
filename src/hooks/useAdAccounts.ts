import { useQuery } from '@tanstack/react-query';
import { adAccountsApi } from '@/api/adAccounts.api';
import type { AdAccount } from '@/types/adAccounts.types';

export function useAdAccounts(filters?: { accountStatus?: string; search?: string; branchId?: number | 'all' }) {
  return useQuery({
    queryKey: ['ad-accounts', filters],
    queryFn: async () => {
      const response = await adAccountsApi.list(filters);
      const data = response.data;
      const result = data?.result || data?.data || data || [];
      if (Array.isArray(result)) return result;
      return (result.data || []) as AdAccount[];
    },
  });
}
