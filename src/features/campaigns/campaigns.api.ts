import { apiClient } from '@/lib/apiClient';

export const campaignsApi = {
  list: (accountId?: string, effectiveStatus?: string, search?: string, branchId?: string) =>
    apiClient.get('/campaigns', {
      params: {
        accountId,
        effectiveStatus,
        search,
        branchId: branchId === 'all' ? undefined : branchId,
      },
    }),

  get: (id: string) => apiClient.get(`/campaigns/${id}`),
};
