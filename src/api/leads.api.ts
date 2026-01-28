
import { apiClient } from '@/lib/apiClient';

export const leadsApi = {
  list: (params?: { date?: string; branchId?: string; accountId?: string; pageId?: string }) =>
    apiClient.get('/leads', { params }),

  getStats: (params?: { branchId?: string; dateStart?: string; dateEnd?: string }) =>
    apiClient.get('/leads/stats', { params }),

  getMessages: (leadId: string) =>
    apiClient.get(`/leads/${leadId}/messages`),

  assignUser: (leadId: string, userId: number) =>
    apiClient.post(`/leads/${leadId}/assign`, { userId }),

  syncLeads: (accountId: number) =>
    apiClient.post('/fb-sync-leads', { accountId }),
};
