import { useQuery } from '@tanstack/react-query';
import { jobsApi } from './jobs.api';
import type { Job } from './jobs.types';

export function useJobs(limit: number = 50) {
    return useQuery({
        queryKey: ['jobs', limit],
        queryFn: async () => {
            try {
                const { data } = await jobsApi.list(limit);
                return (data.result || data.data || data || []) as Job[];
            } catch {
                return [] as Job[];
            }
        },
        refetchInterval: 5000,
    });
}
