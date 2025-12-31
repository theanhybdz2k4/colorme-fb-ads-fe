import { useQuery } from '@tanstack/react-query';
import { adAccountsApi } from './adAccounts.api';
import type { AdAccount } from './adAccounts.types';

export function useAdAccounts() {
  return useQuery({
    queryKey: ['ad-accounts'],
    queryFn: async () => {
      const { data } = await adAccountsApi.list();
      return (data.result || data.data || data || []) as AdAccount[];
    },
  });
}
