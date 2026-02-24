
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, adAccountsApi } from '@/api';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

const formatLocalDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
};

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
    activeFilter: 'all' | 'unread' | 'mine' | 'qualified' | 'potential' | 'today';
    setActiveFilter: (filter: 'all' | 'unread' | 'mine' | 'qualified' | 'potential' | 'today') => void;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    setPage: (page: number) => void;
    agents: any[];
    agentsLoading: boolean;
    assignAgent: (agent: { id: string; name: string }) => Promise<void>;
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
    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;
    isRealtime: boolean;
    setIsRealtime: (isRealtime: boolean) => void;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
    const [selectedPageId, setSelectedPageId] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'mine' | 'qualified' | 'potential' | 'today'>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date()
    });
    const [isRealtime, setIsRealtime] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 200; // Increased to show more leads in stats tab

    const activeBranchId = "all";

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [activeBranchId, selectedAccountId, selectedPageId, activeFilter, searchQuery]);

    // 1. Leads Query
    const { data: leadsData, isLoading: leadsLoading } = useQuery({
        queryKey: ['leads', activeBranchId, selectedAccountId, selectedPageId, activeFilter, page, dateRange, isRealtime],
        queryFn: async () => {
            const dateStart = (!isRealtime && dateRange?.from) ? formatLocalDate(dateRange.from) : undefined;
            const dateEnd = (!isRealtime && dateRange?.to) ? formatLocalDate(dateRange.to) : undefined;

            const res = await leadsApi.list({
                branchId: activeBranchId,
                accountId: selectedAccountId === "all" ? undefined : selectedAccountId,
                pageId: selectedPageId === "all" ? undefined : selectedPageId,
                page,
                limit,
                qualified: activeFilter === 'qualified' ? true : undefined,
                potential: activeFilter === 'potential' ? true : undefined,
                today: activeFilter === 'today' ? true : undefined,
                dateStart,
                dateEnd
            });
            return res; // Return full response including pagination
        },
        staleTime: 5000, // Data considered fresh for 5 seconds
        refetchInterval: 30000, // Auto-refresh every 30 seconds instead of on every DB change
    });

    const leads = leadsData?.result || [];
    const pagination = leadsData?.pagination || { page, limit, total: 0, totalPages: 0 };

    // 2. Stats Query
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['leads-stats', activeBranchId, selectedAccountId, selectedPageId, dateRange],
        queryFn: async () => {
            const dateStart = dateRange?.from ? formatLocalDate(dateRange.from) : undefined;
            const dateEnd = dateRange?.to ? formatLocalDate(dateRange.to) : undefined;

            const res = await leadsApi.getStats({
                branchId: activeBranchId,
                accountId: selectedAccountId === "all" ? undefined : selectedAccountId,
                pageId: selectedPageId === "all" ? undefined : selectedPageId,
                dateStart,
                dateEnd
            } as any);
            return res.data?.result || res.result || {};
        },
        staleTime: 10000, // Stats are fresh for 10 seconds
        refetchInterval: 60000, // Refresh stats every 60 seconds
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

    // 6. Agents
    const { data: agents = [], isLoading: agentsLoading } = useQuery({
        queryKey: ['agents'],
        queryFn: async () => {
            const res = await leadsApi.getAgents();
            return res.result || [];
        }
    });

    // Throttled Realtime Subscription — max 1 invalidation per 3 seconds
    const lastInvalidateRef = useRef<number>(0);
    const pendingInvalidateRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const throttledInvalidate = useCallback((keys: string[][]) => {
        const now = Date.now();
        const elapsed = now - lastInvalidateRef.current;
        const THROTTLE_MS = 3000;

        if (pendingInvalidateRef.current) {
            clearTimeout(pendingInvalidateRef.current);
        }

        const doInvalidate = () => {
            lastInvalidateRef.current = Date.now();
            keys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
        };

        if (elapsed >= THROTTLE_MS) {
            doInvalidate();
        } else {
            pendingInvalidateRef.current = setTimeout(doInvalidate, THROTTLE_MS - elapsed);
        }
    }, [queryClient]);

    useEffect(() => {
        const channel = supabase
            .channel('leads-realtime-global')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'lead_messages' }, () => {
                throttledInvalidate([['messages'], ['leads']]);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
                throttledInvalidate([['leads'], ['leads-stats']]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            if (pendingInvalidateRef.current) clearTimeout(pendingInvalidateRef.current);
        };
    }, [queryClient, throttledInvalidate]);

    // Auto mark-as-read when lead is selected
    // KEY FIX: Only trigger on selectedLeadId change, NOT on leads refetch
    const markedReadRef = useRef<string | null>(null);
    useEffect(() => {
        if (!selectedLeadId || selectedLeadId === markedReadRef.current) return;

        const lead = leads.find((l: any) => l.id === selectedLeadId);
        if (lead && !lead.is_read) {
            markedReadRef.current = selectedLeadId;
            console.log(`[LeadContext] Marking lead ${selectedLeadId} (${lead.customer_name}) as read...`);
            leadsApi.updateLead(selectedLeadId, { is_read: true })
                .then(() => {
                    console.log(`[LeadContext] Lead ${selectedLeadId} marked as read successfully`);
                    // Update local cache directly instead of invalidating (avoids refetch cascade)
                    queryClient.setQueryData(['leads', activeBranchId, selectedAccountId, selectedPageId, activeFilter, page, dateRange, isRealtime], (old: any) => {
                        if (!old?.result) return old;
                        return {
                            ...old,
                            result: old.result.map((l: any) =>
                                l.id === selectedLeadId ? { ...l, is_read: true } : l
                            )
                        };
                    });
                })
                .catch(err => {
                    console.error(`[LeadContext] Failed to mark lead ${selectedLeadId} as read:`, err);
                    markedReadRef.current = null; // Allow retry
                });
        }
    }, [selectedLeadId]);

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

    const assignAgentMutation = useMutation({
        mutationFn: (agent: { id: string; name: string }) =>
            leadsApi.updateLead(selectedLeadId!, {
                assigned_agent_id: agent.id,
                assigned_agent_name: agent.name
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success("Phân công nhân viên thành công");
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
        pagination,
        setPage,
        agents,
        agentsLoading,
        assignAgent: async (agent: { id: string; name: string }) => { await assignAgentMutation.mutateAsync(agent); },
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
        dateRange,
        setDateRange,
        isRealtime,
        setIsRealtime
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
