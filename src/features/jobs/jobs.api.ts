import { apiClient } from '@/lib/apiClient';

export const jobsApi = {
  list: (limit?: number) =>
    apiClient.get('/fb-ads/jobs', { params: { limit } }),

  get: (id: number) => apiClient.get(`/fb-ads/jobs/${id}`),
};
