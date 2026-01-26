import { apiClient } from '@/lib/apiClient';

export const campaignsApi = {
  /**
   * List campaigns with filters
   */
  list: (params?: { accountId?: number; status?: string; search?: string; branchId?: string; dateStart?: string; dateEnd?: string; page?: number; limit?: number }) =>
    apiClient.get('/campaigns', { params }),

  /**
   * List campaigns by unified account ID
   */
  listByAccount: (accountId: number) =>
    apiClient.get(`/campaigns/by-account/${accountId}`),

  /**
   * Get single campaign detail
   */
  get: (id: string) => apiClient.get(`/campaigns/${id}`),

  /**
   * Manually trigger campaign sync for a platform account
   */
  syncAccount: (accountId: number) =>
    apiClient.post(`/campaigns/sync/account/${accountId}`),
};
