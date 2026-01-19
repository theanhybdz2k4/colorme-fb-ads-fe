import { apiClient } from '@/lib/apiClient';

export const adGroupsApi = {
    /**
     * List ad groups (adsets) with filters
     */
    list: (params?: { accountId?: number; campaignId?: string; status?: string; search?: string; branchId?: string }) =>
        apiClient.get('/ad-groups', { params }),

    /**
     * List ad groups (adsets) by unified campaign ID
     */
    listByCampaign: (campaignId: string) =>
        apiClient.get(`/ad-groups/by-campaign/${campaignId}`),

    /**
     * Get single ad group detail
     */
    get: (id: string) => apiClient.get(`/ad-groups/${id}`),

    /**
     * Sync ad groups for an account
     */
    syncAccount: (accountId: number) =>
        apiClient.post(`/campaigns/sync/account/${accountId}`), // AdGroups are synced via campaigns sync in backend
};

// For compatibility during migration
export const adsetsApi = adGroupsApi;
