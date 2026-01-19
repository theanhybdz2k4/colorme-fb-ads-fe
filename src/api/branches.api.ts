import { apiClient } from '@/lib/apiClient';

export const branchesApi = {
    /**
     * List all branches
     */
    list: () => apiClient.get('/branches'),

    /**
     * Create a new branch
     */
    create: (payload: { name: string; code?: string }) => apiClient.post('/branches', payload),

    /**
     * Update an existing branch
     */
    update: (id: number, payload: { name?: string; code?: string | null }) =>
        apiClient.put(`/branches/${id}`, payload),

    /**
     * Delete a branch
     */
    delete: (id: number) => apiClient.delete(`/branches/${id}`),

    /**
     * Manually trigger aggregation stats rebuild
     */
    rebuildStats: () => apiClient.post('/branches/stats/rebuild'),

    /**
     * Get device breakdown stats for a branch
     */
    async getDeviceStats(branchId: number, dateStart: string, dateEnd: string) {
        const response = await apiClient.get(`/branches/${branchId}/stats/device`, { params: { dateStart, dateEnd } });
        return response.data.result || [];
    },

    /**
     * Get age/gender breakdown stats for a branch
     */
    async getAgeGenderStats(branchId: number, dateStart: string, dateEnd: string) {
        const response = await apiClient.get(`/branches/${branchId}/stats/age-gender`, { params: { dateStart, dateEnd } });
        return response.data.result || [];
    },

    /**
     * Get region breakdown stats for a branch
     */
    async getRegionStats(id: number, dateStart: string, dateEnd: string) {
        const response = await apiClient.get(`/branches/${id}/stats/region`, { params: { dateStart, dateEnd } });
        return response.data.result || response.data;
    },

    /**
     * Get dashboard summary for all branches
     */
    async getDashboardStats(dateStart: string, dateEnd: string) {
        const response = await apiClient.get('/branches/stats/dashboard', { params: { dateStart, dateEnd } });
        return response.data.result || response.data;
    },

    /**
     * Trigger full sync (entities + insights) for a branch
     */
    async syncBranch(id: number, dateStart: string, dateEnd: string, granularity: 'DAILY' | 'HOURLY' = 'DAILY') {
        const response = await apiClient.post(`/insights/sync/branch/${id}`, { dateStart, dateEnd, granularity });
        return response.data;
    },
};
