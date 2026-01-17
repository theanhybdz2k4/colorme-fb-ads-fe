import { useQuery } from '@tanstack/react-query';
import { insightsApi } from '@/api/insights.api';

interface UseAdAnalyticsParams {
    adId: string;
    dateStart?: string;
    dateEnd?: string;
    enabled?: boolean;
}

export function useAdAnalytics({ adId, dateStart, dateEnd, enabled = true }: UseAdAnalyticsParams) {
    return useQuery({
        queryKey: ['ad-analytics', adId, dateStart, dateEnd],
        queryFn: async () => {
            const { data } = await insightsApi.getAdAnalytics(adId, dateStart, dateEnd);
            return data;
        },
        enabled: !!adId && enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
