import { apiClient } from '@/lib/apiClient';

export const adsetsApi = {
    list: (accountId?: string, campaignId?: string, effectiveStatus?: string, search?: string, branchId?: string) =>
        apiClient.get('/adsets', {
            params: {
                accountId,
                campaignId,
                effectiveStatus,
                search,
                branchId: branchId === 'all' ? undefined : branchId,
            },
        }),
};
