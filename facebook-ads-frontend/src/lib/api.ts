import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (email: string, password: string, name?: string) =>
    api.post('/auth/register', { email, password, name }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get('/auth/me'),
};

// FB Accounts API
export const fbAccountsApi = {
  list: () => api.get('/fb-ads/fb-accounts'),

  add: (accessToken: string, name?: string) =>
    api.post('/fb-ads/fb-accounts', { accessToken, name }),

  delete: (id: number) => api.delete(`/fb-ads/fb-accounts/${id}`),

  sync: (id: number) => api.post(`/fb-ads/fb-accounts/${id}/sync`),

  addToken: (id: number, accessToken: string, name?: string, isDefault?: boolean) =>
    api.post(`/fb-ads/fb-accounts/${id}/tokens`, { accessToken, name, isDefault }),
};

// Ad Accounts API
export const adAccountsApi = {
  list: () => api.get('/fb-ads/accounts'),
};

// Campaigns API
export const campaignsApi = {
  list: (accountId?: string, effectiveStatus?: string, search?: string) =>
    api.get('/fb-ads/campaigns', { params: { accountId, effectiveStatus, search } }),
};

// Adsets API
export const adsetsApi = {
  list: (accountId?: string, campaignId?: string, effectiveStatus?: string, search?: string) =>
    api.get('/fb-ads/adsets', { params: { accountId, campaignId, effectiveStatus, search } }),
};

// Ads API
export const adsApi = {
  list: (accountId?: string, adsetId?: string, effectiveStatus?: string, search?: string) =>
    api.get('/fb-ads/ads', { params: { accountId, adsetId, effectiveStatus, search } }),
};

// Jobs API
export const jobsApi = {
  list: (limit?: number) =>
    api.get('/fb-ads/jobs', { params: { limit } }),

  get: (id: number) => api.get(`/fb-ads/jobs/${id}`),
};

// Sync API
export const syncApi = {
  entities: (accountId: string, entityType?: string) =>
    api.post('/fb-ads/sync/entities', { accountId, entityType }),

  entitiesByCampaign: (campaignId: string) =>
    api.post('/fb-ads/sync/entities', { campaignId }),

  entitiesByAdset: (adsetId: string) =>
    api.post('/fb-ads/sync/entities', { adsetId }),

  insights: (accountId: string, dateStart: string, dateEnd: string, breakdown?: string) =>
    api.post('/fb-ads/sync/insights', { accountId, dateStart, dateEnd, breakdown }),

  insightsByAd: (adId: string, dateStart: string, dateEnd: string, breakdown?: string) =>
    api.post('/fb-ads/sync/insights', { adId, dateStart, dateEnd, breakdown }),
};

// Insights API
export const insightsApi = {
  list: (accountId?: string, dateStart?: string, dateEnd?: string) =>
    api.get('/fb-ads/insights', { params: { accountId, dateStart, dateEnd } }),
};
