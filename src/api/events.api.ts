import { apiClient } from '@/lib/apiClient';
import type {
    PromoEvent, PromoReward, PromoCode, PromoRedemption,
    EventStats, CreateCodesRequest
} from '@/types/events.types';

export const eventsApi = {
    // Events
    getEvents: async (): Promise<PromoEvent[]> => {
        const { data } = await apiClient.get('/chatbot/events');
        return data.result || data;
    },

    getEvent: async (id: string): Promise<PromoEvent> => {
        const { data } = await apiClient.get(`/chatbot/events/${id}`);
        return data.result || data;
    },

    saveEvent: async (event: Partial<PromoEvent>): Promise<PromoEvent> => {
        const { data } = await apiClient.post('/chatbot/events', event);
        return data.result || data;
    },

    deleteEvent: async (id: string): Promise<void> => {
        await apiClient.delete(`/chatbot/events/${id}`);
    },

    // Codes
    getCodes: async (eventId: string): Promise<PromoCode[]> => {
        const { data } = await apiClient.get(`/chatbot/events/${eventId}/codes`);
        return data.result || data;
    },

    createCodes: async (eventId: string, req: CreateCodesRequest): Promise<PromoCode[]> => {
        const { data } = await apiClient.post(`/chatbot/events/${eventId}/codes`, req);
        return data.result || data;
    },

    deleteCode: async (eventId: string, codeId: string): Promise<void> => {
        await apiClient.delete(`/chatbot/events/${eventId}/codes/${codeId}`);
    },

    updateCode: async (eventId: string, codeId: string, req: Partial<PromoCode>): Promise<PromoCode> => {
        const { data } = await apiClient.post(`/chatbot/events/${eventId}/codes/${codeId}`, req);
        return data.result || data;
    },

    // Rewards
    getRewards: async (eventId: string): Promise<PromoReward[]> => {
        const { data } = await apiClient.get(`/chatbot/events/${eventId}/rewards`);
        return data.result || data;
    },

    saveReward: async (eventId: string, reward: Partial<PromoReward>): Promise<PromoReward> => {
        const { data } = await apiClient.post(`/chatbot/events/${eventId}/rewards`, reward);
        return data.result || data;
    },

    deleteReward: async (eventId: string, rewardId: string): Promise<void> => {
        await apiClient.delete(`/chatbot/events/${eventId}/rewards/${rewardId}`);
    },

    // Stats & Redemptions
    getStats: async (eventId: string): Promise<EventStats> => {
        const { data } = await apiClient.get(`/chatbot/events/${eventId}/stats`);
        return data.result || data;
    },

    getRedemptions: async (eventId: string, page = 1, limit = 50): Promise<{
        result: PromoRedemption[];
        total: number;
        page: number;
    }> => {
        const { data } = await apiClient.get(`/chatbot/events/${eventId}/redemptions?page=${page}&limit=${limit}`);
        return data;
    },
};
