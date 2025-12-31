import { useQuery } from '@tanstack/react-query';
import { adsApi } from './ads.api';
import type { Ad } from './ads.types';

export interface UseAdsParams {
    accountId?: string;
    adsetId?: string;
    effectiveStatus?: string;
    search?: string;
}

export function useAds({ accountId, adsetId, effectiveStatus, search }: UseAdsParams = {}) {
    return useQuery({
        queryKey: ['ads', accountId, adsetId, effectiveStatus, search],
        queryFn: async () => {
            const { data } = await adsApi.list(accountId, adsetId, effectiveStatus, search);
            return (data.result || data.data || data || []) as Ad[];
        },
    });
}
