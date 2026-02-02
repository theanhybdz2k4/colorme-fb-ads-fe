import { apiClient } from '@/lib/apiClient';

export const jobsApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    apiClient.get('/functions/v1/jobs', { params }),

  dispatch: (data: { dateStart?: string; dateEnd?: string; cronType?: string }) =>
    apiClient.post('/functions/v1/jobs/dispatch', data),

  get: (id: number) => apiClient.get(`/functions/v1/jobs/${id}`),
};
