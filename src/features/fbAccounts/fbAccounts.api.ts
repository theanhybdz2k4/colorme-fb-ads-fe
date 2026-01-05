import { apiClient } from '@/lib/apiClient';

export const fbAccountsApi = {
    list: () => apiClient.get('/fb-accounts'),

    add: (accessToken: string, name?: string) =>
        apiClient.post('/fb-accounts', { accessToken, name }),

    delete: (id: number) => apiClient.delete(`/fb-accounts/${id}`),

    sync: (id: number) => apiClient.post(`/fb-accounts/${id}/sync`),

    addToken: (id: number, accessToken: string, name?: string, isDefault?: boolean) =>
        apiClient.post(`/fb-accounts/${id}/tokens`, { accessToken, name, isDefault }),
};
