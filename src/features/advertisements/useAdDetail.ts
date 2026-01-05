import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adDetailApi } from './adDetail.api';

export function useAdDetail(adId: string) {
    return useQuery({
        queryKey: ['ad', adId],
        queryFn: async () => {
            const response = await adDetailApi.getAd(adId);
            const data = response.data as any;
            return data.result || data;
        },
        enabled: !!adId,
        staleTime: 0,
        refetchOnMount: 'always',
    });
}

export function useAdAnalytics(adId: string, dateStart?: string, dateEnd?: string) {
    return useQuery({
        queryKey: ['ad-analytics', adId, dateStart, dateEnd],
        queryFn: async () => {
            const response = await adDetailApi.getAnalytics(adId, dateStart, dateEnd);
            // API returns { message, statusCode, result: {...analytics data} }
            const data = response.data as any;
            return data.result || data;
        },
        enabled: !!adId,
        staleTime: 0,
        refetchOnMount: 'always',
    });
}

export function useAdHourly(adId: string, date?: string) {
    return useQuery({
        queryKey: ['ad-hourly', adId, date],
        queryFn: async () => {
            if (!date) return []; // Return empty if no date
            const response = await adDetailApi.getHourly(adId, date);
            const data = response.data as any;
            return data.result || data;
        },
        enabled: !!adId && !!date, // Only fetch when BOTH adId AND date are provided
        staleTime: 0,
        refetchOnMount: 'always',
    });
}

export function useSyncAdInsights(adId: string) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ dateStart, dateEnd, breakdown = 'all' }: { dateStart: string; dateEnd: string; breakdown?: string }) => {
            const response = await adDetailApi.syncInsights(adId, dateStart, dateEnd, breakdown);
            const data = response.data as any;
            // Backend trả về số lượng insights đã sync
            return data?.result || data || 0;
        },
        onSuccess: () => {
            // Invalidate tất cả queries liên quan để trigger refetch
            // Sử dụng exact: false để invalidate tất cả queries có chứa adId
            queryClient.invalidateQueries({ queryKey: ['ad-analytics'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['ad-hourly'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['ad', adId] });
        },
    });
}

