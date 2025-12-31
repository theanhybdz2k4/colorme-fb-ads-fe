import { useQuery } from '@tanstack/react-query';
import { insightsApi } from './insights.api';
import type { Insight } from './insights.types';

export interface UseInsightsParams {
    accountId?: string;
    dateStart?: string;
    dateEnd?: string;
}

export function useInsights({ accountId, dateStart, dateEnd }: UseInsightsParams) {
    return useQuery({
        queryKey: ['insights', accountId, dateStart, dateEnd],
        queryFn: async () => {
            const { data } = await insightsApi.list(accountId, dateStart, dateEnd);
            return (data.result || data.data || data || []) as Insight[];
        },
        enabled: !!dateStart && !!dateEnd,
    });
}
