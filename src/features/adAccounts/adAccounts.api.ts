import { apiClient } from '@/lib/apiClient';

export const adAccountsApi = {
    list: () => apiClient.get('/ad-accounts'),
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

    // NEW: Quick sync today's hourly insights (optimized, no Telegram)
    syncHourlyToday: (accountId?: string) =>
        apiClient.post('/fb-ads/sync/hourly', accountId ? { accountId } : {}),

    // NEW: Send Telegram report for current hour (reads from DB)
    sendTelegramReport: () =>
        apiClient.post('/fb-ads/telegram/send-hour-report'),

    // Full sync: entities + daily insights for all accounts (cron endpoint)
    fullSync: (days?: number) =>
        apiClient.post(`/fb-ads/cron/full-sync${days ? `?days=${days}` : ''}`),
};
