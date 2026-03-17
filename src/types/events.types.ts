// Event Builder types

export interface PromoEvent {
    id: string;
    user_id: number;
    name: string;
    description: string | null;
    status: 'draft' | 'active' | 'paused' | 'ended';
    starts_at: string | null;
    ends_at: string | null;
    page_ids: string[];
    code_used_reply: ReplyTemplate;
    code_expired_reply: ReplyTemplate | null;
    no_reward_reply: ReplyTemplate | null;
    created_at: string;
    updated_at: string;
    _stats?: EventQuickStats;
}

export interface EventQuickStats {
    totalCodes: number;
    usedCodes: number;
    totalRedemptions: number;
    successRedemptions: number;
}

export interface PromoReward {
    id: string;
    event_id: string;
    name: string;
    reply_template: ReplyTemplate;
    weight: number;
    max_claims: number | null;
    claimed_count: number;
    is_active: boolean;
    created_at: string;
}

export interface PromoCode {
    id: string;
    event_id: string;
    code: string;
    max_uses: number;
    used_count: number;
    expires_at: string | null;
    created_at: string;
}

export interface PromoRedemption {
    id: string;
    code_id: string;
    event_id: string;
    reward_id: string | null;
    customer_psid: string;
    customer_name: string | null;
    lead_id: string | null;
    page_id: string;
    status: 'success' | 'already_used' | 'expired' | 'no_reward_available';
    redeemed_at: string;
    promo_codes?: { code: string };
    promo_rewards?: { name: string } | null;
}

export interface ReplyTemplate {
    message_type: 'text' | 'buttons' | 'carousel';
    content: {
        text?: string;
        buttons?: any[];
        elements?: any[];
    };
}

export interface EventStats {
    codes: {
        total: number;
        used: number;
        available: number;
    };
    rewards: {
        id: string;
        name: string;
        claimed_count: number;
        max_claims: number | null;
        weight: number;
        is_active: boolean;
    }[];
    redemptions: {
        total: number;
        success: number;
        already_used: number;
        expired: number;
        no_reward: number;
    };
}

export interface CreateCodesRequest {
    codes?: string[];
    prefix?: string;
    count?: number;
    max_uses?: number;
    expires_at?: string | null;
}
