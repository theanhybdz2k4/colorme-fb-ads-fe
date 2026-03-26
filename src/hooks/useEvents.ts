import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/api/events.api';
import type { PromoEvent, PromoReward, CreateCodesRequest } from '@/types/events.types';

const KEYS = {
    events: ['events'],
    event: (id: string) => ['events', id],
    codes: (eventId: string) => ['events', eventId, 'codes'],
    rewards: (eventId: string) => ['events', eventId, 'rewards'],
    stats: (eventId: string) => ['events', eventId, 'stats'],
    redemptions: (eventId: string, page: number) => ['events', eventId, 'redemptions', page],
};

// Events
export function useEvents() {
    return useQuery({ queryKey: KEYS.events, queryFn: eventsApi.getEvents });
}

export function useEvent(id: string | null) {
    return useQuery({
        queryKey: KEYS.event(id || ''),
        queryFn: () => eventsApi.getEvent(id!),
        enabled: !!id,
    });
}

export function useSaveEvent() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (event: Partial<PromoEvent>) => eventsApi.saveEvent(event),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.events }),
    });
}

export function useDeleteEvent() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => eventsApi.deleteEvent(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.events }),
    });
}

// Codes
export function useCodes(eventId: string | null) {
    return useQuery({
        queryKey: KEYS.codes(eventId || ''),
        queryFn: () => eventsApi.getCodes(eventId!),
        enabled: !!eventId,
    });
}

export function useCreateCodes() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ eventId, req }: { eventId: string; req: CreateCodesRequest }) =>
            eventsApi.createCodes(eventId, req),
        onSuccess: (_, { eventId }) => {
            qc.invalidateQueries({ queryKey: KEYS.codes(eventId) });
            qc.invalidateQueries({ queryKey: KEYS.events });
        },
    });
}

export function useDeleteCode() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ eventId, codeId }: { eventId: string; codeId: string }) =>
            eventsApi.deleteCode(eventId, codeId),
        onSuccess: (_, { eventId }) => {
            qc.invalidateQueries({ queryKey: KEYS.codes(eventId) });
            qc.invalidateQueries({ queryKey: KEYS.events });
        },
    });
}

export function useUpdateCode() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ eventId, codeId, req }: { eventId: string; codeId: string; req: any }) =>
            eventsApi.updateCode(eventId, codeId, req),
        onSuccess: (_, { eventId }) => {
            qc.invalidateQueries({ queryKey: KEYS.codes(eventId) });
            qc.invalidateQueries({ queryKey: KEYS.events });
        },
    });
}

// Rewards
export function useRewards(eventId: string | null) {
    return useQuery({
        queryKey: KEYS.rewards(eventId || ''),
        queryFn: () => eventsApi.getRewards(eventId!),
        enabled: !!eventId,
    });
}

export function useSaveReward() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ eventId, reward }: { eventId: string; reward: Partial<PromoReward> }) =>
            eventsApi.saveReward(eventId, reward),
        onSuccess: (_, { eventId }) => {
            qc.invalidateQueries({ queryKey: KEYS.rewards(eventId) });
            qc.invalidateQueries({ queryKey: KEYS.events });
        },
    });
}

export function useDeleteReward() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ eventId, rewardId }: { eventId: string; rewardId: string }) =>
            eventsApi.deleteReward(eventId, rewardId),
        onSuccess: (_, { eventId }) => {
            qc.invalidateQueries({ queryKey: KEYS.rewards(eventId) });
            qc.invalidateQueries({ queryKey: KEYS.events });
        },
    });
}

// Stats
export function useEventStats(eventId: string | null) {
    return useQuery({
        queryKey: KEYS.stats(eventId || ''),
        queryFn: () => eventsApi.getStats(eventId!),
        enabled: !!eventId,
        refetchInterval: 30000,
    });
}

// Redemptions
export function useRedemptions(eventId: string | null, page = 1) {
    return useQuery({
        queryKey: KEYS.redemptions(eventId || '', page),
        queryFn: () => eventsApi.getRedemptions(eventId!, page),
        enabled: !!eventId,
    });
}
