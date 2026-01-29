import { apiClient } from '@/lib/apiClient';
import type { CronSettingsResponse, EstimatedApiCalls, UpsertCronSettingDto, CronSetting } from '@/types/settings.types';

export const cronSettingsApi = {
    /**
     * Get all cron settings for current user
     */
    getSettings: async (): Promise<CronSettingsResponse> => {
        const { data } = await apiClient.get('/fb-settings');
        // Edge Function wraps response in { result: ... } to match NestJS format
        return data.result || data;
    },

    /**
     * Create or update a cron setting (upsert)
     */
    createSetting: async (dto: { cronType: string; allowedHours: number[]; enabled?: boolean }): Promise<CronSetting> => {
        const { data } = await apiClient.post('/fb-settings', dto);
        return data.result || data;
    },

    /**
     * Update an existing cron setting (uses upsert logic)
     */
    updateSetting: async (cronType: string, dto: UpsertCronSettingDto): Promise<CronSetting> => {
        const { data } = await apiClient.post('/fb-settings', { ...dto, cronType });
        return data.result || data;
    },

    /**
     * Create or update a cron setting (backward compatibility)
     */
    upsertSetting: async (cronType: string, dto: UpsertCronSettingDto): Promise<CronSetting> => {
        const { data } = await apiClient.post('/fb-settings', { ...dto, cronType });
        return data.result || data;
    },

    /**
     * Delete a cron setting
     */
    deleteSetting: async (cronType: string): Promise<void> => {
        await apiClient.delete(`/fb-settings?type=${cronType}`);
    },

    /**
     * Get estimated API calls for current configuration
     */
    getEstimate: async (): Promise<EstimatedApiCalls> => {
        const { data } = await apiClient.get('/fb-settings?estimate=true');
        return data.result || data;
    },

    /**
     * Trigger immediate sync for a cron type (calls fb-dispatch)
     */
    triggerSync: async (cronType: string): Promise<{ success: boolean; data?: any; error?: string }> => {
        const { data } = await apiClient.post('/fb-settings/trigger', { cronType });
        return data;
    },
};

// Legacy telegram API routes removed - use userTelegramBotApi instead
export const telegramApi = {
    // These routes no longer exist in backend - use userTelegramBotApi methods instead
    // getChatIds, refreshChatIds, addChatId, sendTest have been replaced with bot-based APIs
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

    /**
     * Send test message to all subscribers of a bot
     */
    sendTestMessage: async (botId: number): Promise<{ success: boolean; subscriberCount: number; message: string }> => {
        const { data } = await apiClient.post(`/telegram/bots/${botId}/test`);
        return data;
    },

    // migrateSubscribers route removed - migration should be done via backend directly

    /**
     * Manually add a subscriber to a bot
     */
    addSubscriber: async (botId: number, dto: { chatId: string; name?: string }): Promise<{ success: boolean; subscriber: any; message: string }> => {
        const { data } = await apiClient.post(`/telegram/bots/${botId}/add-subscriber`, dto);
        return data;
    },

    /**
     * Register webhook for a bot
     */
    registerWebhook: async (botId: number): Promise<{ success: boolean; message: string; url: string }> => {
        const { data } = await apiClient.post(`/telegram/bots/${botId}/register-webhook`);
        return data;
    },

    /**
     * Get webhook info for a bot
     */
    getWebhookInfo: async (botId: number): Promise<{ success: boolean; result: any; isRegistered: boolean }> => {
        const { data } = await apiClient.get(`/telegram/bots/${botId}/webhook-info`);
        return data;
    },
};
