import { apiClient } from '@/lib/apiClient';

export const campaignsApi = {
  list: (accountId?: string, effectiveStatus?: string, search?: string) =>
    apiClient.get('/fb-ads/campaigns', { params: { accountId, effectiveStatus, search } }),
};
