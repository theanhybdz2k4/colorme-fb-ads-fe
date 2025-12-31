import { apiClient } from '@/lib/apiClient';

export const adsApi = {
    list: (accountId?: string, adsetId?: string, effectiveStatus?: string, search?: string) =>
        apiClient.get('/fb-ads/ads', { params: { accountId, adsetId, effectiveStatus, search } }),
};
