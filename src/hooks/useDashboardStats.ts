
import { useQuery } from '@tanstack/react-query';
import { branchesApi } from '@/api/branches.api';

export interface UseDashboardStatsParams {
    dateStart?: string;
    dateEnd?: string;
}

export function useDashboardStats({ dateStart, dateEnd }: UseDashboardStatsParams) {
    return useQuery({
        queryKey: ['dashboard-stats', dateStart, dateEnd],
        queryFn: async () => {
            if (!dateStart || !dateEnd) return null;
            return branchesApi.getDashboardStats(dateStart, dateEnd);
        },
        enabled: !!dateStart && !!dateEnd,
    });
}
