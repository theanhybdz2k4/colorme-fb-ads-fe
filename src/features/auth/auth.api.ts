import { apiClient } from '@/lib/apiClient';
import type { LoginCredentials, RegisterCredentials } from './auth.types';

export const authApi = {
  register: ({ email, password, name }: RegisterCredentials) =>
    apiClient.post('/auth/register', { email, password, name }),

  login: ({ email, password }: LoginCredentials) =>
    apiClient.post('/auth/login', { email, password }),

  logout: () => apiClient.post('/auth/logout'),

  getMe: () => apiClient.get('/auth/me'),

  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
};
