import { apiClient } from '@/lib/apiClient';

export const adAccountsApi = {
  /**
   * List all platform accounts
   */
  list: (params?: { accountStatus?: string; search?: string; branchId?: number | 'all' }) =>
    apiClient.get('/ad-accounts', { params }),

  /**
   * Get single account detail
   */
  get: (id: string) => apiClient.get(`/ad-accounts/${id}`),

  /**
   * Assign account to a branch
   */
  assignBranch: (id: string, branchId: number | null) =>
    apiClient.put(`/ad-accounts/${id}/branch`, { branchId }),
};
