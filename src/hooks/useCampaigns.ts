import { useQuery } from '@tanstack/react-query';
import { campaignsApi } from '@/api/campaigns.api';
import type { Campaign } from '@/types/campaigns.types';

export interface UseCampaignsParams {
    accountId?: string;
    effectiveStatus?: string;
    search?: string;
    branchId?: string;
    page?: number;
    limit?: number;
    dateStart?: string;
    dateEnd?: string;
}

export function useCampaigns(params: UseCampaignsParams = {}) {
    return useQuery({
        queryKey: ['campaigns', params],
        queryFn: async () => {
            const { data } = await campaignsApi.list({
                ...params,
                accountId: params.accountId ? Number(params.accountId) : undefined,
                status: params.effectiveStatus,
                page: params.page || 1,
                limit: params.limit || 20,
                dateStart: params.dateStart,
                dateEnd: params.dateEnd,
            });
            const result = data.result || data.data || data || [];
            if (Array.isArray(result)) return result;
            return (result.data || []) as Campaign[];
        },
        // Refetch only when params change, not on window focus
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        // Stale time to avoid unnecessary refetches
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
