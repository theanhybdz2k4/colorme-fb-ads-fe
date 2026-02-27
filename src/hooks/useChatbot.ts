import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotApi } from '@/api/chatbot.api';
import type { ChatbotConfig, ChatbotFlow } from '@/types/chatbot.types';

const KEYS = {
    config: ['chatbot', 'config'],
    flows: ['chatbot', 'flows'],
    ads: ['chatbot', 'ads'],
    sessions: ['chatbot', 'sessions'],
};

export function useChatbotConfig() {
    return useQuery({
        queryKey: KEYS.config,
        queryFn: chatbotApi.getConfig,
    });
}

export function useUpdateChatbotConfig() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: Partial<ChatbotConfig>) => chatbotApi.updateConfig(dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.config }),
    });
}

export function useChatbotFlows() {
    return useQuery({
        queryKey: KEYS.flows,
        queryFn: chatbotApi.getFlows,
    });
}

export function useSaveChatbotFlow() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (flow: Partial<ChatbotFlow>) => chatbotApi.saveFlow(flow),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.flows }),
    });
}

export function useDeleteChatbotFlow() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => chatbotApi.deleteFlow(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.flows }),
    });
}

export function useBulkToggleAdFlows() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (isActive: boolean) => chatbotApi.bulkToggleAdFlows(isActive),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.flows }),
    });
}

export function useChatbotAds() {
    return useQuery({
        queryKey: KEYS.ads,
        queryFn: chatbotApi.getAds,
    });
}

export function useChatbotSessions() {
    return useQuery({
        queryKey: KEYS.sessions,
        queryFn: chatbotApi.getSessions,
    });
}

export function useTestChatbot() {
    return useMutation({
        mutationFn: ({ psid, pageId }: { psid: string; pageId?: string }) =>
            chatbotApi.testSend(psid, pageId),
    });
}
