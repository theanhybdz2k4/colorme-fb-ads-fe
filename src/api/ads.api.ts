import { apiClient } from '@/lib/apiClient';

export const adsApi = {
    list: (accountId?: string, adsetId?: string, effectiveStatus?: string, search?: string, branchId?: string) =>
        apiClient.get('/ads', {
            params: {
                accountId,
                adsetId,
                effectiveStatus,
                search,
                branchId: branchId === 'all' ? undefined : branchId,
            },
        }),
    
    get: (id: string) => apiClient.get(`/ads/${id}`),
};
