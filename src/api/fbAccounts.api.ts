import { apiClient } from '@/lib/apiClient';
import { accountsApi } from './accounts.api';

export const fbAccountsApi = {
    list: () => accountsApi.listIdentities(),

    get: (id: number) => apiClient.get(`/accounts/identities/${id}`),

    add: (accessToken: string, name?: string) =>
        accountsApi.connect('facebook', accessToken, name),

    delete: (id: number) => apiClient.delete(`/accounts/identities/${id}`),

    sync: (id: number) => accountsApi.syncSubAccounts(id),

    // Tokens management - needs separate unified logic if needed
    addToken: (id: number, accessToken: string, name?: string, isDefault?: boolean) =>
        apiClient.post(`/accounts/identities/${id}/tokens`, { accessToken, name, isDefault }),
};
