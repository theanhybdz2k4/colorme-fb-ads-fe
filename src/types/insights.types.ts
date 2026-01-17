export interface Insight {
    date: string;
    adId: string;
    impressions: string | null;
    clicks: string | null;
    spend: string | null;
    reach: string | null;
    ad?: {
        id: string;
        name: string | null;
    };
    actions?: any[];
    action_values?: any[];
    messagingStarted?: number | string | null;
    costPerMessaging?: number | string | null;
    results?: number | string | null;
    costPerResult?: number | string | null;
}
