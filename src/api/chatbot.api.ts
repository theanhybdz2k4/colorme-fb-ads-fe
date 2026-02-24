import { apiClient } from '@/lib/apiClient';
import type { ChatbotConfig, ChatbotFlow, ChatbotSession } from '@/types/chatbot.types';

export const chatbotApi = {
    // Config
    getConfig: async (): Promise<ChatbotConfig> => {
        const { data } = await apiClient.get('/chatbot/config');
        return data.result || data;
    },

    updateConfig: async (dto: Partial<ChatbotConfig>): Promise<ChatbotConfig> => {
        const { data } = await apiClient.post('/chatbot/config', dto);
        return data.result || data;
    },

    // Flows
    getFlows: async (): Promise<ChatbotFlow[]> => {
        const { data } = await apiClient.get('/chatbot/flows');
        return data.result || data;
    },

    saveFlow: async (flow: Partial<ChatbotFlow>): Promise<ChatbotFlow> => {
        const { data } = await apiClient.post('/chatbot/flows', flow);
        return data.result || data;
    },

    deleteFlow: async (id: number): Promise<void> => {
        await apiClient.delete(`/chatbot/flows/${id}`);
    },

    // Sessions
    getSessions: async (): Promise<ChatbotSession[]> => {
        const { data } = await apiClient.get('/chatbot/sessions');
        return data.result || data;
    },

    deleteSession: async (id: string): Promise<void> => {
        await apiClient.delete(`/chatbot/sessions/${id}`);
    },

    // Test
    testSend: async (psid: string, pageId?: string): Promise<any> => {
        const { data } = await apiClient.post('/chatbot/test', { psid, pageId });
        return data.result || data;
    },
};
