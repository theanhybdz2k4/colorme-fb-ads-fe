import { apiClient } from '@/lib/apiClient';

export const adAccountsApi = {
    list: () => apiClient.get('/fb-ads/accounts'),
};

export const syncApi = {
    entities: (accountId: string, entityType?: string) =>
        apiClient.post('/fb-ads/sync/entities', { accountId, entityType }),

    entitiesByCampaign: (campaignId: string) =>
        apiClient.post('/fb-ads/sync/entities', { campaignId }),

    entitiesByAdset: (adsetId: string) =>
        apiClient.post('/fb-ads/sync/entities', { adsetId }),

    insights: (accountId: string, dateStart: string, dateEnd: string, breakdown?: string) =>
        apiClient.post('/fb-ads/sync/insights', { accountId, dateStart, dateEnd, breakdown }),

    insightsByAd: (adId: string, dateStart: string, dateEnd: string, breakdown?: string) =>
        apiClient.post('/fb-ads/sync/insights', { adId, dateStart, dateEnd, breakdown }),
};
