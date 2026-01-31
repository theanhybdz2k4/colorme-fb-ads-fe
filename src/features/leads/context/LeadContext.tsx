
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, adAccountsApi } from '@/api';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface LeadContextType {
    leads: any[];
    leadsLoading: boolean;
    stats: any;
    statsLoading: boolean;
    adAccounts: any[];
    availablePages: { id: string; name: string }[];
    pagesLoading: boolean;
    messages: any[];
    messagesLoading: boolean;
    selectedLeadId: string | null;
    setSelectedLeadId: (id: string | null) => void;
    selectedAccountId: string;
    setSelectedAccountId: (id: string) => void;
    selectedPageId: string;
    setSelectedPageId: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    activeFilter: 'all' | 'unread' | 'mine';
    setActiveFilter: (filter: 'all' | 'unread' | 'mine') => void;
    syncLeads: () => Promise<void>;
    syncHistoricLeads: () => Promise<void>;
    isSyncing: boolean;
    sendReply: (text: string) => Promise<void>;
    isSending: boolean;
    updateLead: (data: any) => void;
    reanalyzeLead: () => void;
    isReanalyzing: boolean;
    syncMessages: () => Promise<void>;
    isSyncingMessages: boolean;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
    const [selectedPageId, setSelectedPageId] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'mine'>('all');

    const activeBranchId = "all";

    // 1. Leads Query
    const { data: leads = [], isLoading: leadsLoading } = useQuery({
        queryKey: ['leads', activeBranchId, selectedAccountId, selectedPageId],
        queryFn: async () => {
            const res = await leadsApi.list({
                branchId: activeBranchId,
                accountId: selectedAccountId === "all" ? undefined : selectedAccountId,
                pageId: selectedPageId === "all" ? undefined : selectedPageId
            });
            return res.result || [];
        }
    });

    // 2. Stats Query
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['leads-stats', activeBranchId, selectedAccountId, selectedPageId],
        queryFn: async () => {
            const res = await leadsApi.getStats({
                branchId: activeBranchId,
                accountId: selectedAccountId === "all" ? undefined : selectedAccountId,
                pageId: selectedPageId === "all" ? undefined : selectedPageId
            } as any);
            return res.data?.result || res.result || {};
        }
    });

    // 3. Ad Accounts
    const { data: adAccounts = [] } = useQuery({
        queryKey: ['ad-accounts-list'],
        queryFn: async () => {
            const res = await adAccountsApi.list({ branchId: activeBranchId });
            return res.data?.result || res.data || [];
        }
    });

    // 4. Available Pages from FB API
    const { data: availablePages = [], isLoading: pagesLoading } = useQuery({
        queryKey: ['fb-pages'],
        queryFn: async () => {
            const data = await leadsApi.getPages();
            return data.result || [];
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // 5. Messages
    const { data: messages = [], isLoading: messagesLoading } = useQuery({
        queryKey: ['messages', selectedLeadId],
        queryFn: async () => {
            if (!selectedLeadId) return [];
            const res = await leadsApi.getMessages(selectedLeadId);
            return res.result || [];
        },
        enabled: !!selectedLeadId
    });

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('leads-realtime-global')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'lead_messages' }, () => {
                queryClient.invalidateQueries({ queryKey: ['messages'] });
                queryClient.invalidateQueries({ queryKey: ['leads'] });
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
                queryClient.invalidateQueries({ queryKey: ['leads'] });
                queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    // Mutations
    const syncMutation = useMutation({
        mutationFn: (options?: any) => leadsApi.syncLeadsFromFacebook(options),
        onSuccess: (data) => {
            if (data.success) {
                toast.success(`Đã đồng bộ ${data.result.leadsSynced} khách hàng mới!`);
                queryClient.invalidateQueries({ queryKey: ['leads'] });
                queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
                queryClient.invalidateQueries({ queryKey: ['messages'] });
            } else {
                toast.error("Đồng bộ thất bại: " + data.error);
            }
        }
    });

    const replyMutation = useMutation({
        mutationFn: (text: string) => leadsApi.reply(selectedLeadId!, text),
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['messages', selectedLeadId] });
            } else {
                toast.error("Gửi tin nhắn thất bại: " + data.error);
            }
        }
    });

    const updateLeadMutation = useMutation({
        mutationFn: (data: any) => leadsApi.updateLead(selectedLeadId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success("Cập nhật thông tin thành công");
        }
    });

    const reanalyzeMutation = useMutation({
        mutationFn: () => leadsApi.reanalyzeLead(selectedLeadId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success("Đã yêu cầu AI phân tích lại hội thoại");
        }
    });

    const syncMessagesMutation = useMutation({
        mutationFn: () => leadsApi.syncMessages(selectedLeadId!),
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['messages', selectedLeadId] });
                // Also invalidate leads to update sorting/last_message_at
                queryClient.invalidateQueries({ queryKey: ['leads'] });
                
                toast.success(`Đã đồng bộ ${data.count} tin nhắn mới`);
            } else {
                toast.error("Đồng bộ thất bại: " + data.error);
            }
        },
        onError: (e: any) => {
            toast.error("Đồng bộ thất bại: " + (e.response?.data?.error || e.message));
        }
    });

    const value = {
        leads,
        leadsLoading,
        stats,
        statsLoading,
        adAccounts,
        availablePages,
        pagesLoading,
        messages,
        messagesLoading,
        selectedLeadId,
        setSelectedLeadId,
        selectedAccountId,
        setSelectedAccountId,
        selectedPageId,
        setSelectedPageId,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        syncLeads: async () => { await syncMutation.mutateAsync({}); },
        isSyncing: syncMutation.isPending,
        syncHistoricLeads: async () => { await syncMutation.mutateAsync({ force_historic: true } as any); },
        sendReply: async (text: string) => { await replyMutation.mutateAsync(text); },
        isSending: replyMutation.isPending,
        updateLead: (data: any) => updateLeadMutation.mutate(data),
        reanalyzeLead: () => reanalyzeMutation.mutate(),
        isReanalyzing: reanalyzeMutation.isPending,
        syncMessages: async () => { await syncMessagesMutation.mutateAsync(); },
        isSyncingMessages: syncMessagesMutation.isPending,
    };

    return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>;
}

export const useLeads = () => {
    const context = useContext(LeadContext);
    if (context === undefined) {
        throw new Error('useLeads must be used within a LeadProvider');
    }
    return context;
};
