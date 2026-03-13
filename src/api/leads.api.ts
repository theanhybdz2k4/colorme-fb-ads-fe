
import { apiClient } from '@/lib/apiClient';


export const leadsApi = {
  list: async (params?: {
    date?: string;
    dateStart?: string;
    dateEnd?: string;
    branchId?: string;
    accountId?: string;
    pageId?: string;
    page?: number;
    limit?: number;
    qualified?: boolean;
    potential?: boolean;
    today?: boolean;
    userId?: number;
  }) => {
    const { data } = await apiClient.get('/leads', { params });
    return data;
  },

  getStats: async (params?: {
    branchId?: string;
    accountId?: string;
    pageId?: string;
    dateStart?: string;
    dateEnd?: string;
  }) => {
    const { data } = await apiClient.get('/leads/stats', { params });
    return data;
  },

  getMessages: async (leadId: string) => {
    const { data } = await apiClient.get(`/leads/${leadId}/messages`);
    return data;
  },

  getPages: async () => {
    const { data } = await apiClient.get('/leads/pages');
    return data;
  },


  reply: async (leadId: string, message: string) => {
    const { data } = await apiClient.post('/fb-reply', { leadId, message });
    return data;
  },

  updateLead: async (leadId: string, data: { notes?: string; phone?: string; is_qualified?: boolean; is_manual_potential?: boolean; is_read?: boolean, first_contact_at?: string }) => {
    const { data: responseData } = await apiClient.patch(`/leads/${leadId}`, data);
    return responseData;
  },

  reanalyzeLead: async (leadId: string) => {
    const { data } = await apiClient.patch(`/leads/${leadId}`, { reanalyze: true });
    return data;
  },

  syncMessages: async (leadId: string) => {
    const { data } = await apiClient.post(`/leads/${leadId}/sync_messages`);
    return data;
  },
};
