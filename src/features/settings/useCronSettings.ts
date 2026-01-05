import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cronSettingsApi, telegramApi, userTelegramBotApi } from './settings.api';
import type { UpsertCronSettingDto } from './settings.types';

export function useCronSettings() {
    return useQuery({
        queryKey: ['cronSettings'],
        queryFn: cronSettingsApi.getSettings,
    });
}

export function useEstimatedApiCalls() {
    return useQuery({
        queryKey: ['cronSettings', 'estimate'],
        queryFn: cronSettingsApi.getEstimate,
    });
}

export function useCreateCronSetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: { cronType: string; allowedHours: number[]; enabled?: boolean }) =>
            cronSettingsApi.createSetting(dto),
        onSuccess: () => {
            // Invalidate và refetch ngay lập tức các query đang active
            queryClient.invalidateQueries({ queryKey: ['cronSettings'], refetchType: 'active' });
            queryClient.invalidateQueries({ queryKey: ['cronSettings', 'estimate'], refetchType: 'active' });
        },
    });
}

export function useUpdateCronSetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ cronType, dto }: { cronType: string; dto: UpsertCronSettingDto }) =>
            cronSettingsApi.updateSetting(cronType, dto),
        onSuccess: () => {
            // Invalidate và refetch ngay lập tức các query đang active
            queryClient.invalidateQueries({ queryKey: ['cronSettings'], refetchType: 'active' });
            queryClient.invalidateQueries({ queryKey: ['cronSettings', 'estimate'], refetchType: 'active' });
        },
    });
}

export function useUpsertCronSetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ cronType, dto }: { cronType: string; dto: UpsertCronSettingDto }) =>
            cronSettingsApi.upsertSetting(cronType, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cronSettings'] });
            queryClient.invalidateQueries({ queryKey: ['cronSettings', 'estimate'] });
        },
    });
}

export function useDeleteCronSetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (cronType: string) => cronSettingsApi.deleteSetting(cronType),
        onSuccess: () => {
            // Invalidate và refetch ngay lập tức các query đang active
            queryClient.invalidateQueries({ queryKey: ['cronSettings'], refetchType: 'active' });
            queryClient.invalidateQueries({ queryKey: ['cronSettings', 'estimate'], refetchType: 'active' });
        },
    });
}

// Telegram hooks
export function useTelegramChatIds() {
    return useQuery({
        queryKey: ['telegram', 'chatIds'],
        queryFn: telegramApi.getChatIds,
    });
}

export function useRefreshTelegramChatIds() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: telegramApi.refreshChatIds,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['telegram', 'chatIds'] });
        },
    });
}

export function useAddTelegramChatId() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: telegramApi.addChatId,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['telegram', 'chatIds'] });
        },
    });
}

export function useSendTelegramTest() {
    return useMutation({
        mutationFn: telegramApi.sendTest,
    });
}

// User Telegram Bot hooks
export function useUserTelegramBots() {
    return useQuery({
        queryKey: ['telegram', 'bots'],
        queryFn: userTelegramBotApi.getBots,
    });
}

export function useUpsertUserTelegramBot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userTelegramBotApi.upsertBot,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['telegram', 'bots'] });
        },
    });
}

export function useDeleteUserTelegramBot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userTelegramBotApi.deleteBot,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['telegram', 'bots'] });
        },
    });
}

// Removed useTestUserTelegramBot - not implemented in API

// Bot Notification Settings hooks
export function useBotSettings(botId: number) {
    return useQuery({
        queryKey: ['telegram', 'bots', botId, 'settings'],
        queryFn: () => userTelegramBotApi.getBotSettings(botId),
        enabled: !!botId,
    });
}

export function useUpsertBotSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ botId, dto }: { botId: number; dto: { allowedHours: number[]; enabled?: boolean } }) =>
            userTelegramBotApi.upsertBotSettings(botId, dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['telegram', 'bots'], refetchType: 'active' });
            queryClient.invalidateQueries({ queryKey: ['telegram', 'bots', variables.botId, 'settings'], refetchType: 'active' });
        },
    });
}

export function useDeleteBotSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (botId: number) => userTelegramBotApi.deleteBotSettings(botId),
        onSuccess: (_, botId) => {
            queryClient.invalidateQueries({ queryKey: ['telegram', 'bots'], refetchType: 'active' });
            queryClient.invalidateQueries({ queryKey: ['telegram', 'bots', botId, 'settings'], refetchType: 'active' });
        },
    });
}

export function useTestBotMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (botId: number) => userTelegramBotApi.sendTestMessage(botId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['telegram', 'bots'], refetchType: 'active' });
        },
    });
}

export function useMigrateSubscribers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (botId: number) => userTelegramBotApi.migrateSubscribers(botId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['telegram', 'bots'], refetchType: 'active' });
        },
    });
}