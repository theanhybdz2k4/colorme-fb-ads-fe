import { apiClient } from '@/lib/apiClient';

export const adsApi = {
    /**
     * List ads with filters
     */
    list: (params?: { accountId?: number; adGroupId?: string; status?: string; search?: string; branchId?: string }) =>
        apiClient.get('/ads', { params }),

    /**
     * List ads by unified ad group ID
     */
    listByAdGroup: (adGroupId: string) =>
        apiClient.get(`/ads/by-ad-group/${adGroupId}`),

    /**
     * Get single ad detail
     */
    get: (id: string) => apiClient.get(`/ads/${id}`),

    /**
     * Manually trigger ads sync for a platform account
     */
    syncAccount: (accountId: number) =>
        apiClient.post(`/ads/sync/account/${accountId}`),
};
