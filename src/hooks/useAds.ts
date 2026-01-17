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

export function useAds({ accountId, adsetId, effectiveStatus, search, branchId }: UseAdsParams = {}) {
    return useQuery({
        queryKey: ['ads', accountId, adsetId, effectiveStatus, search, branchId],
        queryFn: async () => {
            const { data } = await adsApi.list(accountId, adsetId, effectiveStatus, search, branchId);
            return (data.result || data.data || data || []) as Ad[];
        },
    });
}
