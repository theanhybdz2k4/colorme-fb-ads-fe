
import { apiClient } from '@/lib/apiClient';

export const branchesApi = {
    async getDeviceStats(branchId: number, dateStart: string, dateEnd: string) {
        const response = await apiClient.get(`/branches/${branchId}/stats/device`, { params: { dateStart, dateEnd } });
        return response.data.result || [];
    },

    async getAgeGenderStats(branchId: number, dateStart: string, dateEnd: string) {
        const response = await apiClient.get(`/branches/${branchId}/stats/age-gender`, { params: { dateStart, dateEnd } });
        return response.data.result || [];
    },

    async getRegionStats(id: number, dateStart: string, dateEnd: string) {
        const response = await apiClient.get(`/branches/${id}/stats/region`, { params: { dateStart, dateEnd } });
        return response.data.result || response.data;
    },

    async getDashboardStats(dateStart: string, dateEnd: string) {
        const response = await apiClient.get('/branches/stats/dashboard', { params: { dateStart, dateEnd } });
        return response.data.result || response.data;
    },

    async syncBranch(id: number, dateStart: string, dateEnd: string) {
        const response = await apiClient.post(`/branches/${id}/sync`, { dateStart, dateEnd });
        return response.data;
    },
};
