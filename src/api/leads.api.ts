
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
    startTime?: string;
    endTime?: string;
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
    startTime?: string;
    endTime?: string;
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

  getAgents: async () => {
    const { data } = await apiClient.get('/leads/agents');
    return data;
  },

  reply: async (leadId: string, message: string) => {
    const { data } = await apiClient.post('/fb-reply', { leadId, message });
    return data;
  },

  updateLead: async (leadId: string, data: { notes?: string; phone?: string; is_qualified?: boolean; is_manual_potential?: boolean; assigned_agent_id?: string; assigned_agent_name?: string, is_read?: boolean }) => {
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


  syncLeadsFromFacebook: async (options?: { force_historic?: boolean }) => {
    const { data } = await apiClient.post('/fb-sync-leads', options || {});
    return data;
  },
};
