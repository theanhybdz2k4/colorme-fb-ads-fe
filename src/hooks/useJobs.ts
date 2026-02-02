import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '@/api/jobs.api';
import type { Job } from '@/types/jobs.types';

export function useJobs(limit: number = 50) {
    return useQuery({
        queryKey: ['jobs', limit],
        queryFn: async () => {
            try {
                const { data } = await jobsApi.list({ limit });
                const result = data.result || data.data || data || [];
                if (Array.isArray(result)) return result;
                return (result.data || []) as Job[];
            } catch {
                return [] as Job[];
            }
        },
        refetchInterval: 5000,
    });
}
