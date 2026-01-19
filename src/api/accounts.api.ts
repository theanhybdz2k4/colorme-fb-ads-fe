import { apiClient } from '@/lib/apiClient';

export const accountsApi = {
    /**
     * Connect a new platform identity (identity-level, e.g. FB User Token)
     */
    connect: (platformCode: string, token: string, name?: string) =>
        apiClient.post('/accounts/connect', { platformCode, token, name }),

    /**
     * List all connected platform identities for the user
     */
    listIdentities: () => apiClient.get('/accounts/identities'),

    /**
     * Sync sub-accounts (e.g. FB Ad Accounts) for a given identity
     */
    syncSubAccounts: (identityId: number) =>
        apiClient.post(`/accounts/identities/${identityId}/sync-accounts`),

    /**
     * List all platform accounts (can be filtered by branch)
     */
    listAccounts: (params?: { branchId?: number | 'all'; status?: string }) =>
        apiClient.get('/ad-accounts', { params }), // Redirected to legacy controller if not yet unified

    /**
     * Get single account detail
     */
    getAccount: (id: number) => apiClient.get(`/ad-accounts/${id}`),

    /**
     * Assign account to a branch
     */
    assignBranch: (accountId: number, branchId: number | null) =>
        apiClient.put(`/ad-accounts/${accountId}/branch`, { branchId }),
};
