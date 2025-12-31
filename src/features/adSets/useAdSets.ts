import { useQuery } from '@tanstack/react-query';
import { adsetsApi } from './adSets.api';
import type { Adset } from './adSets.types';

export interface UseAdsetsParams {
    accountId?: string;
    campaignId?: string;
    effectiveStatus?: string;
    search?: string;
}

export function useAdsets({ accountId, campaignId, effectiveStatus, search }: UseAdsetsParams = {}) {
    return useQuery({
        queryKey: ['adsets', accountId, campaignId, effectiveStatus, search],
        queryFn: async () => {
            const { data } = await adsetsApi.list(accountId, campaignId, effectiveStatus, search);
            return (data.result || data.data || data || []) as Adset[];
        },
    });
}
