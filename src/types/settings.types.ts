export interface CronSetting {
    id: number;
    userId: number;
    cronType: CronType;
    allowedHours: number[];
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export type CronType =
    | 'insight'
    | 'insight_daily'
    | 'insight_device'
    | 'insight_placement'
    | 'insight_age_gender'
    | 'insight_region'
    | 'insight_hourly'
    | 'ads'
    | 'adset'
    | 'campaign'
    | 'creative'
    | 'ad_account'
    | 'full';

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
    { value: 'insight', label: 'Quick Insights', description: 'Sync nhanh insights theo giờ + Telegram notification (chi tiết theo ad)' },
    { value: 'insight_daily', label: 'Insights Daily', description: 'Sync dữ liệu insights hàng ngày (chi tiết spend, results)' },
    { value: 'insight_device', label: 'Insights Device', description: 'Sync insights theo thiết bị (mobile, desktop)' },
    { value: 'insight_placement', label: 'Insights Placement', description: 'Sync insights theo vị trí hiển thị (feed, story)' },
    { value: 'insight_age_gender', label: 'Insights Age/Gender', description: 'Sync insights theo độ tuổi và giới tính' },
    { value: 'insight_region', label: 'Insights Region', description: 'Sync insights theo vùng miền/tỉnh thành' },
    { value: 'insight_hourly', label: 'Insights Hourly', description: 'Sync chi tiết insights theo từng giờ' },
    { value: 'ads', label: 'Ads', description: 'Sync danh sách quảng cáo' },
    { value: 'adset', label: 'Ad Sets', description: 'Sync danh sách nhóm quảng cáo' },
    { value: 'campaign', label: 'Campaigns', description: 'Sync danh sách chiến dịch' },
    { value: 'creative', label: 'Creatives', description: 'Sync danh sách mẫu quảng cáo (hình ảnh, nội dung)' },
    { value: 'ad_account', label: 'Ad Accounts', description: 'Sync thông tin tài khoản quảng cáo' },
    { value: 'full', label: 'Full Sync', description: 'Sync toàn bộ dữ liệu (entities + daily insights)' },
];

export const HOURS = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${i.toString().padStart(2, '0')}:00`,
}));
