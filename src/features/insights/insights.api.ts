import { apiClient } from '@/lib/apiClient';

export const insightsApi = {
  list: (accountId?: string, dateStart?: string, dateEnd?: string, branchId?: string) =>
    apiClient.get('/insights', {
      params: {
        accountId,
        dateStart,
        dateEnd,
        branchId: branchId === 'all' ? undefined : branchId,
      },
    }),
  
  getAdAnalytics: (adId: string, dateStart?: string, dateEnd?: string) =>
    apiClient.get(`/insights/ads/${adId}/analytics`, { params: { dateStart, dateEnd } }),
  
  getAdHourly: (adId: string, date?: string) =>
    apiClient.get(`/insights/ads/${adId}/hourly`, { params: { date } }),
  
  sync: (dto: { accountId?: string; adId?: string; dateStart: string; dateEnd: string; breakdown?: string }) =>
    apiClient.post('/insights/sync', dto),
};
