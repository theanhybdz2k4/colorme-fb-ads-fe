import { useQuery } from '@tanstack/react-query';
import { insightsApi } from './insights.api';
import type { Insight } from './insights.types';

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
            const { data } = await insightsApi.list(accountId, dateStart, dateEnd, branchId);
            return (data.result || data.data || data || []) as Insight[];
        },
        enabled: !!dateStart && !!dateEnd,
    });
}
