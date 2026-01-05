import { apiClient } from '@/lib/apiClient';

export const adsetsApi = {
    list: (accountId?: string, campaignId?: string, effectiveStatus?: string, search?: string) =>
        apiClient.get('/adsets', { params: { accountId, campaignId, effectiveStatus, search } }),
};
