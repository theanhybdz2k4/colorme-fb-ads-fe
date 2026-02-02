
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

    /**
     * Get AI Optimization advice for a campaign
     */
    optimize: async (payload: { 
        campaignId: string; 
        name: string; 
        ctr: number; 
        cvr: number; 
        spend: number; 
        results: number 
    }) => {
        const { data } = await apiClient.post('/analytics/optimize', payload);
        return data;
    },

    /**
     * Get saved AI analysis for a campaign
     */
    getAnalysis: async (campaignId: string) => {
        const { data } = await apiClient.get(`/analytics/analysis/${campaignId}`);
        return data;
    },
};
