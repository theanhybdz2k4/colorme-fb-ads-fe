import { apiClient } from '@/lib/apiClient';

export const insightsApi = {
  list: (accountId?: string, dateStart?: string, dateEnd?: string) =>
    apiClient.get('/insights', { params: { accountId, dateStart, dateEnd } }),
};
