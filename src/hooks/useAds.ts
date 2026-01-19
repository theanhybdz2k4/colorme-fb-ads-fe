import { useQuery } from '@tanstack/react-query';
import { adsApi } from '@/api/ads.api';
import type { Ad } from '@/types/ads.types';

export interface UseAdsParams {
    accountId?: string;
    adsetId?: string;
    effectiveStatus?: string;
    search?: string;
    branchId?: string;
}

export function useAds(params: UseAdsParams = {}) {
    return useQuery({
        queryKey: ['ads', params],
        queryFn: async () => {
            const { data } = await adsApi.list({
                ...params,
                accountId: params.accountId ? Number(params.accountId) : undefined,
                status: params.effectiveStatus,
                adGroupId: params.adsetId
            });
            return (data.result || data.data || data || []) as Ad[];
        },
    });
}
