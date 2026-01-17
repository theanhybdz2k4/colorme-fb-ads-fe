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
}
