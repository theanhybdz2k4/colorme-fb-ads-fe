import { apiClient } from '@/lib/apiClient';
import type { CronSettingsResponse, EstimatedApiCalls, UpsertCronSettingDto, CronSetting } from './settings.types';

export const cronSettingsApi = {
    /**
     * Get all cron settings for current user
     */
    getSettings: async (): Promise<CronSettingsResponse> => {
        const { data } = await apiClient.get('/cron/settings');
        // Backend wraps response in { result: ... }
        return data.result || data;
    },

    /**
     * Create a new cron setting
     */
    createSetting: async (dto: { cronType: string; allowedHours: number[]; enabled?: boolean }): Promise<CronSetting> => {
        const { data } = await apiClient.post('/cron/settings', dto);
        return data;
    },

    /**
     * Update an existing cron setting
     */
    updateSetting: async (cronType: string, dto: UpsertCronSettingDto): Promise<CronSetting> => {
        const { data } = await apiClient.put(`/cron/settings/${cronType}`, dto);
        return data;
    },

    /**
     * Create or update a cron setting (backward compatibility)
     */
    upsertSetting: async (cronType: string, dto: UpsertCronSettingDto): Promise<CronSetting> => {
        const { data } = await apiClient.put(`/cron/settings/${cronType}`, dto);
        return data;
    },

    /**
     * Delete a cron setting
     */
    deleteSetting: async (cronType: string): Promise<void> => {
        await apiClient.delete(`/cron/settings/${cronType}`);
    },

    /**
     * Get estimated API calls for current configuration
     */
    getEstimate: async (): Promise<EstimatedApiCalls> => {
        const { data } = await apiClient.get('/cron/settings/estimated-calls');
        // Backend wraps response in { result: ... }
        return data.result || data;
    },
};

export const telegramApi = {
    /**
     * Get all registered Telegram chat IDs
     */
    getChatIds: async (): Promise<{ chatIds: string[] }> => {
        const { data } = await apiClient.get('/telegram/chat-ids');
        return data;
    },

    /**
     * Refresh chat IDs from Telegram getUpdates
     */
    refreshChatIds: async (): Promise<{ success: boolean; chatIds: string[] }> => {
        const { data } = await apiClient.post('/telegram/refresh');
        return data;
    },

    /**
     * Manually add a chat ID
     */
    addChatId: async (chatId: string): Promise<{ success: boolean; chatId: string }> => {
        const { data } = await apiClient.post('/telegram/add-chat', { chatId });
        return data;
    },

    /**
     * Send test message to all subscribers
     */
    sendTest: async (): Promise<{ success: boolean; subscriberCount: number }> => {
        const { data } = await apiClient.post('/telegram/test');
        return data;
    },
};

export interface UserTelegramBot {
    id: number;
    userId: number;
    adAccountId: string | null;
    botToken: string;
    botName: string | null;
    botUsername: string | null;
    isActive: boolean;
    adAccount?: { id: string; name: string };
    subscriberCount?: number;
    activeSubscribers?: number;
    telegramLink?: string | null;
    notificationSettings?: TelegramBotNotificationSetting | null;
}

export interface TelegramBotNotificationSetting {
    id: number;
    userId: number;
    botId: number;
    allowedHours: number[];
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export const userTelegramBotApi = {
    /**
     * Get user's telegram bot configurations
     */
    getBots: async (): Promise<{ bots: UserTelegramBot[] }> => {
        const { data } = await apiClient.get('/telegram/bots');
        // API returns { result: { bots: [...] } } or { bots: [...] }
        return data.result || data;
    },

    /**
     * Create or update a telegram bot
     */
    upsertBot: async (dto: {
        botToken: string;
        botName?: string;
        adAccountId?: string;
    }): Promise<{ success: boolean; bot: UserTelegramBot; error?: string; telegramLink?: string }> => {
        const { data } = await apiClient.post('/telegram/bots', dto);
        return data;
    },

    /**
     * Delete a telegram bot
     */
    deleteBot: async (id: number): Promise<{ success: boolean }> => {
        const { data } = await apiClient.delete(`/telegram/bots/${id}`);
        return data;
    },

    /**
     * Get notification settings for a bot
     */
    getBotSettings: async (botId: number): Promise<{ setting: TelegramBotNotificationSetting | null }> => {
        const { data } = await apiClient.get(`/telegram/bots/${botId}/settings`);
        return data.result || data;
    },

    /**
     * Create or update notification settings for a bot
     */
    upsertBotSettings: async (
        botId: number,
        dto: { allowedHours: number[]; enabled?: boolean }
    ): Promise<{ success: boolean; setting: TelegramBotNotificationSetting }> => {
        const { data } = await apiClient.post(`/telegram/bots/${botId}/settings`, dto);
        return data.result || data;
    },

    /**
     * Delete notification settings for a bot
     */
    deleteBotSettings: async (botId: number): Promise<{ success: boolean }> => {
        const { data } = await apiClient.delete(`/telegram/bots/${botId}/settings`);
        return data.result || data;
    },
};
