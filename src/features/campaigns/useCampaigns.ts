import { useQuery } from '@tanstack/react-query';
import { campaignsApi } from './campaigns.api';
import type { Campaign } from './campaigns.types';

export interface UseCampaignsParams {
    accountId?: string;
    effectiveStatus?: string;
    search?: string;
    branchId?: string;
}

export function useCampaigns({ accountId, effectiveStatus, search, branchId }: UseCampaignsParams = {}) {
    return useQuery({
        queryKey: ['campaigns', accountId, effectiveStatus, search, branchId],
        queryFn: async () => {
            const { data } = await campaignsApi.list(accountId, effectiveStatus, search, branchId);
            return (data.result || data.data || data || []) as Campaign[];
        },
    });
}
