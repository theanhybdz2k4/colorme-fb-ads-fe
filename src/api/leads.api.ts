
import { apiClient } from '@/lib/apiClient';


export const leadsApi = {
  list: (params?: { date?: string; branchId?: string; accountId?: string; pageId?: string }) =>
    apiClient.get('/leads', { params }),

  getStats: (params?: { branchId?: string; dateStart?: string; dateEnd?: string }) =>
    apiClient.get('/leads/stats', { params }),

  getMessages: (leadId: string) =>
    apiClient.get(`/leads/${leadId}/messages`),

  getPages: async () => {
    const { data } = await apiClient.get('/leads/pages');
    return data;
  },

  assignUser: (leadId: string, userId: number) =>
    apiClient.post(`/leads/${leadId}/assign`, { userId }),

  reply: (leadId: string, message: string) =>
    apiClient.post('/fb-reply', { leadId, message }),

  updateLead: (leadId: string, data: { notes?: string; phone?: string; is_qualified?: boolean }) =>
    apiClient.patch(`/leads/${leadId}`, data),

  markAsRead: (leadId: string) =>
    apiClient.patch(`/leads/${leadId}`, { is_read: true }),

  syncLeadsFromFacebook: async () => {
    const { data } = await apiClient.post('/fb-sync-leads', {});
    return data;
  },
};
