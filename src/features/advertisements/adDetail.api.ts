import { apiClient } from '@/lib/apiClient';

export interface AdDetail {
    id: string;
    name: string | null;
    status: string;
    effectiveStatus: string | null;
    accountId: string;
    adsetId: string;
    campaignId: string;
    syncedAt: string;
    thumbnailUrl?: string | null;
    account?: { name: string; currency: string };
    adset?: { name: string };
    campaign?: { name: string };
}

export interface AdAnalyticsSummary {
    totalSpend: number;
    totalImpressions: number;
    totalReach: number;
    totalClicks: number;
    totalResults: number;
    totalMessages: number;
    avgCtr: number;
    avgCpc: number;
    avgCpm: number;
    avgCpr: number;
    avgCostPerMessage: number;
    growth?: {
        spend: number | null;
        impressions: number | null;
        reach: number | null;
        clicks: number | null;
        ctr: number | null;
        cpc: number | null;
        cpm: number | null;
        results: number | null;
        cpr: number | null;
        messages: number | null;
        costPerMessage: number | null;
    };
}

export interface DailyInsight {
    date: string;
    spend: number;
    impressions: number;
    reach: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
    results: number;
    costPerResult: number;
    qualityRanking?: string;
    engagementRateRanking?: string;
}

export interface DeviceBreakdown {
    device: string;
    spend: number;
    impressions: number;
    clicks: number;
}

export interface PlacementBreakdown {
    platform: string;
    position: string;
    spend: number;
    impressions: number;
    clicks: number;
}

export interface AgeGenderBreakdown {
    age: string;
    gender: string;
    spend: number;
    impressions: number;
    clicks: number;
}

export interface AdAnalytics {
    summary: AdAnalyticsSummary;
    dailyInsights: DailyInsight[];
    deviceBreakdown: DeviceBreakdown[];
    placementBreakdown: PlacementBreakdown[];
    ageGenderBreakdown: AgeGenderBreakdown[];
}

export interface HourlyInsight {
    hour: number;
    dateStart: string;
    spend: number;
    impressions: number;
    reach: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
    results: number;
    costPerResult: number;
}

export const adDetailApi = {
    getAd: (adId: string) => apiClient.get<AdDetail>(`/ads/${adId}`),
    getAnalytics: (adId: string, dateStart?: string, dateEnd?: string) => {
        const params = new URLSearchParams();
        if (dateStart) params.append('dateStart', dateStart);
        if (dateEnd) params.append('dateEnd', dateEnd);
        const query = params.toString() ? `?${params.toString()}` : '';
        return apiClient.get<AdAnalytics>(`/insights/ads/${adId}/analytics${query}`);
    },
    getHourly: (adId: string, date?: string) => {
        const query = date ? `?date=${date}` : '';
        return apiClient.get<HourlyInsight[]>(`/insights/ads/${adId}/hourly${query}`);
    },
    syncInsights: (adId: string, dateStart: string, dateEnd: string, breakdown: string = 'all') => {
        return apiClient.post(`/insights/sync`, {
            adId,
            dateStart,
            dateEnd,
            breakdown,
        });
    },
};
