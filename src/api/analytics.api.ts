
import { apiClient } from '@/lib/apiClient';

export const analyticsApi = {
    /**
     * Get global age/gender breakdown
     */
    getAgeGenderBreakdown: async (params?: {
        dateStart?: string;
        dateEnd?: string;
        accountId?: string;
        branchId?: string
    }) => {
        const { data } = await apiClient.get('/analytics/global-breakdown/age-gender', { params });
        return data;
    },

    /**
     * Get ad-level analytics
     */
    getAdAnalytics: async (adId: string, params?: { dateStart?: string; dateEnd?: string }) => {
        const { data } = await apiClient.get(`/analytics/ad/${adId}`, { params });
        return data;
    },
};
