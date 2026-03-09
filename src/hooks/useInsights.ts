import { useQuery } from '@tanstack/react-query';
import { insightsApi } from '@/api/insights.api';
import type { Insight } from '@/types/insights.types';

export interface UseInsightsParams {
    accountId?: string;
    dateStart?: string;
    dateEnd?: string;
    branchId?: string;
    platformCode?: string;
    granularity?: 'DAILY' | 'HOURLY';
    enabled?: boolean;
}

export function useInsights({ accountId, dateStart, dateEnd, branchId, platformCode, granularity, enabled = true }: UseInsightsParams) {
    return useQuery({
        queryKey: ['insights', accountId, dateStart, dateEnd, branchId, platformCode, granularity],
        queryFn: async () => {
            const { data } = await insightsApi.list({
                accountId: accountId ? Number(accountId) : undefined,
                branchId: branchId ? Number(branchId) : undefined,
                dateStart,
                dateEnd,
                platformCode: platformCode !== 'all' ? platformCode : undefined,
                granularity
            });
            const result = data.result || data.data || data || [];
            if (Array.isArray(result)) return result;
            return (result.data || []) as Insight[];
        },
        enabled: enabled && !!dateStart && !!dateEnd,
    });
}

