
import { apiClient } from '@/lib/apiClient';

const SUPABASE_FUNCTIONS_URL = 'https://lncgmaxtqjfbcypncfoe.supabase.co/functions/v1';

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

  // Direct call through NestJS proxy or Supabase Edge Function (using apiClient for Auth)
  syncLeadsFromFacebook: async () => {
    // We point to the same endpoint but through our apiClient to get the token automatically
    // The apiClient baseURL is http://localhost:3000/api/v1
    // The backend should proxy /fb-sync-leads to Supabase or we call it directly with headers
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
