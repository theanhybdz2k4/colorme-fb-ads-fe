import { useQuery } from '@tanstack/react-query';
import { adsApi } from '@/api/ads.api';
import type { Ad } from '@/types/ads.types';

export interface UseAdsParams {
    accountId?: string;
    adsetId?: string;
    effectiveStatus?: string;
    search?: string;
    branchId?: string;
    dateStart?: string;
    dateEnd?: string;
}

export function useAds(params: UseAdsParams = {}) {
    return useQuery({
        queryKey: ['ads', params],
        queryFn: async () => {
            const { data } = await adsApi.list({
                ...params,
                accountId: params.accountId ? Number(params.accountId) : undefined,
                status: params.effectiveStatus,
                adGroupId: params.adsetId,
                limit: 100, // Higher limit for ads
            });
            const result = data.result || data.data || data || [];
            if (Array.isArray(result)) return result;
            return (result.data || []) as Ad[];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        placeholderData: (previousData) => previousData,
    });
}
