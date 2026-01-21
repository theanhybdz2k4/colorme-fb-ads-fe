import { useQuery } from '@tanstack/react-query';
import { insightsApi } from '@/api/insights.api';
import type { Insight } from '@/types/insights.types';

export interface UseInsightsParams {
    accountId?: string;
    dateStart?: string;
    dateEnd?: string;
    branchId?: string;
}

export function useInsights({ accountId, dateStart, dateEnd, branchId }: UseInsightsParams) {
    return useQuery({
        queryKey: ['insights', accountId, dateStart, dateEnd, branchId],
        queryFn: async () => {
            const { data } = await insightsApi.list({
                accountId: accountId ? Number(accountId) : undefined,
                branchId: branchId ? Number(branchId) : undefined,
                dateStart,
                dateEnd
            });
            const result = data.result || data.data || data || [];
            if (Array.isArray(result)) return result;
            return (result.data || []) as Insight[];
        },
        enabled: !!dateStart && !!dateEnd,
    });
}
