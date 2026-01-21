
import { useQuery } from '@tanstack/react-query';
import { branchesApi } from '@/api/branches.api';

export interface UseDashboardStatsParams {
    dateStart?: string;
    dateEnd?: string;
    platformCode?: string;
}

export function useDashboardStats({ dateStart, dateEnd, platformCode }: UseDashboardStatsParams) {
    return useQuery({
        queryKey: ['dashboard-stats', dateStart, dateEnd, platformCode],
        queryFn: async () => {
            if (!dateStart || !dateEnd) return null;
            return branchesApi.getDashboardStats(dateStart, dateEnd, platformCode);
        },
        enabled: !!dateStart && !!dateEnd,
    });
}
