import { apiClient } from '@/lib/apiClient';

export const insightsApi = {
  /**
   * Query unified insights with filters
   */
  list: (params: {
    accountId?: number;
    branchId?: number;
    dateStart?: string;
    dateEnd?: string;
    platformCode?: string;
  }) =>
    apiClient.get('/insights', { params }),

  /**
   * Get ad-level analytics (detailed metrics)
   */
  getAdAnalytics: (adId: string, dateStart?: string, dateEnd?: string) =>
    apiClient.get(`/insights/ads/${adId}/analytics`, { params: { dateStart, dateEnd } }),

  /**
   * Get ad hourly insights (normalized)
   */
  getAdHourly: (adId: string, date?: string) =>
    apiClient.get(`/insights/ads/${adId}/hourly`, { params: { date } }),

  /**
   * Manually trigger insight sync for a platform account
   */
  syncAccount: (accountId: number, dateStart: string, dateEnd: string, granularity: 'DAILY' | 'HOURLY' | 'BOTH' = 'DAILY') =>
    apiClient.post(`/insights/sync/account/${accountId}`, { dateStart, dateEnd, granularity }),

  /**
   * Manually trigger full branch sync (Entities + Insights)
   */
  syncBranch: (branchId: number, dateStart: string, dateEnd: string, granularity: 'DAILY' | 'HOURLY' | 'BOTH' = 'DAILY') =>
    apiClient.post(`/insights/sync/branch/${branchId}`, { dateStart, dateEnd, granularity }),

  /**
   * Cleanup old hourly insights (older than yesterday)
   */
  cleanupHourlyInsights: () =>
    apiClient.post('/insights/cleanup-hourly'),
};
