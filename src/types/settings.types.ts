export interface CronSetting {
    id: number;
    userId: number;
    cronType: CronType;
    allowedHours: number[];
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export type CronType = 'insight' | 'ads' | 'adset' | 'campaign' | 'ad_account' | 'full';

export interface CronSettingsResponse {
    settings: CronSetting[];
    adAccountCount: number;
}

export interface EstimatedApiCalls {
    totalCalls: number;
    perHour: Record<number, number>;
    warning?: string;
    adAccountCount: number;
}

export interface UpsertCronSettingDto {
    allowedHours: number[];
    enabled?: boolean;
}

export const CRON_TYPES: { value: CronType; label: string; description: string }[] = [
    { value: 'insight', label: 'Insights', description: 'Sync dữ liệu insights (spend, impressions, clicks...)' },
    { value: 'ads', label: 'Ads', description: 'Sync danh sách quảng cáo' },
    { value: 'adset', label: 'Ad Sets', description: 'Sync danh sách nhóm quảng cáo' },
    { value: 'campaign', label: 'Campaigns', description: 'Sync danh sách chiến dịch' },
    { value: 'ad_account', label: 'Ad Accounts', description: 'Sync thông tin tài khoản quảng cáo' },
    { value: 'full', label: 'Full Sync', description: 'Sync toàn bộ dữ liệu (entities + insights)' },
];

export const HOURS = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${i.toString().padStart(2, '0')}:00`,
}));
