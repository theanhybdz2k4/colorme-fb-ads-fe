import { apiClient } from '@/lib/apiClient';

export const jobsApi = {
  list: (limit?: number) =>
    apiClient.get('/jobs', { params: { limit } }),

  get: (id: number) => apiClient.get(`/jobs/${id}`),
};
