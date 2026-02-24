// Chatbot types

export interface ChatbotConfig {
    id: number | null;
    user_id: number;
    page_id: string | null;
    is_enabled: boolean;
    test_mode: boolean;
    test_psids: string[];
    created_at?: string;
    updated_at?: string;
}

export type MessageType = 'text' | 'quick_reply' | 'buttons' | 'carousel';

export interface QuickReply {
    content_type: 'text';
    title: string;
    payload: string;
}

export interface ButtonItem {
    type: 'postback' | 'web_url';
    title: string;
    payload?: string;
    url?: string;
}

export interface CarouselElement {
    title: string;
    subtitle?: string;
    image_url?: string;
    buttons?: ButtonItem[];
}

export interface FlowContent {
    text?: string;
    text_before?: string;
    quick_replies?: QuickReply[];
    buttons?: ButtonItem[];
    elements?: CarouselElement[];
    handoff?: boolean;
}

export interface ChatbotFlow {
    id: number;
    user_id: number;
    flow_key: string;
    display_name: string;
    message_type: MessageType;
    content: FlowContent;
    trigger_payloads: string[];
    trigger_keywords: string[];
    is_entry_point: boolean;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ChatbotSession {
    id: string;
    lead_id: string | null;
    page_id: string;
    customer_id: string;
    current_step: string;
    is_active: boolean;
    handed_off: boolean;
    last_interaction_at: string;
    created_at: string;
}
