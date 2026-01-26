import { useQuery } from '@tanstack/react-query';
import { adsetsApi } from '@/api/adSets.api';
import type { Adset } from '@/types/adSets.types';

export interface UseAdsetsParams {
    accountId?: string;
    campaignId?: string;
    effectiveStatus?: string;
    search?: string;
    branchId?: string;
}

export function useAdsets(params: UseAdsetsParams = {}) {
    return useQuery({
        queryKey: ['adsets', params],
        queryFn: async () => {
            const { data } = await adsetsApi.list({
                ...params,
                accountId: params.accountId ? Number(params.accountId) : undefined,
                status: params.effectiveStatus,
                limit: 100, // Higher limit for ad sets
            });
            const result = data.result || data.data || data || [];
            if (Array.isArray(result)) return result;
            return (result.data || []) as Adset[];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}
