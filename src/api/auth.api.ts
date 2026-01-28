import { apiClient } from '@/lib/apiClient';
import type { LoginCredentials, RegisterCredentials } from '@/types/auth.types';

export const authApi = {
  // ... existing methods
  register: ({ email, password, name }: RegisterCredentials) =>
    apiClient.post('/auth/register', { email, password, name }),

  login: ({ email, password }: LoginCredentials) =>
    apiClient.post('/auth/login', { email, password }),

  logout: () => apiClient.post('/auth/logout'),

  getMe: () => apiClient.get('/auth/me'),

  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),

  updateProfile: (data: { email?: string; name?: string; avatar_url?: string; gemini_api_key?: string }) =>
    apiClient.post('/auth/profile', data),

  updatePassword: (data: any) =>
    apiClient.post('/auth/password', data),

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('accessToken');
    const baseURL = apiClient.defaults.baseURL;

    // Nuclear option: Use raw fetch to avoid ANY axios header pollution or legacy interceptors
    const response = await fetch(`${baseURL}/auth/upload-avatar`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
        // IMPORTANT: DO NOT set Content-Type, let the browser do it with the boundary!
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    const data = await response.json();
    return { data };
  },
};
