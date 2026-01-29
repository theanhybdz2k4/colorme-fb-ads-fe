
import { apiClient } from '@/lib/apiClient';

const SUPABASE_FUNCTIONS_URL = 'https://lncgmaxtqjfbcypncfoe.supabase.co/functions/v1';

export const leadsApi = {
  list: (params?: { date?: string; branchId?: string; accountId?: string; pageId?: string }) =>
    apiClient.get('/leads', { params }),

  getStats: (params?: { branchId?: string; dateStart?: string; dateEnd?: string }) =>
    apiClient.get('/leads/stats', { params }),

  getMessages: (leadId: string) =>
    apiClient.get(`/leads/${leadId}/messages`),

  getPages: async () => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/leads/pages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  assignUser: (leadId: string, userId: number) =>
    apiClient.post(`/leads/${leadId}/assign`, { userId }),

  reply: (leadId: string, message: string) =>
    fetch(`${SUPABASE_FUNCTIONS_URL}/fb-reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ leadId, message }),
    }).then(r => r.json()),

  updateLead: (leadId: string, data: { notes?: string; phone?: string; is_qualified?: boolean }) =>
    apiClient.patch(`/leads/${leadId}`, data),

  markAsRead: (leadId: string) =>
    apiClient.patch(`/leads/${leadId}`, { is_read: true }),

  syncLeadsFromFacebook: async () => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/fb-sync-leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({}),
    });
    return response.json();
  },
};
