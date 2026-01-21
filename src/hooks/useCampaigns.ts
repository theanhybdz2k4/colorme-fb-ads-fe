import { useQuery } from '@tanstack/react-query';
import { campaignsApi } from '@/api/campaigns.api';
import type { Campaign } from '@/types/campaigns.types';

export interface UseCampaignsParams {
    accountId?: string;
    effectiveStatus?: string;
    search?: string;
    branchId?: string;
}

export function useCampaigns(params: UseCampaignsParams = {}) {
    return useQuery({
        queryKey: ['campaigns', params],
        queryFn: async () => {
            const { data } = await campaignsApi.list({
                ...params,
                accountId: params.accountId ? Number(params.accountId) : undefined,
                status: params.effectiveStatus
            });
            const result = data.result || data.data || data || [];
            if (Array.isArray(result)) return result;
            return (result.data || []) as Campaign[];
        },
    });
}
