import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

// ------- Types -------
export interface ReportMetrics {
    spend: number;
    impressions: number;
    clicks: number;
    totalResults: number;
    ctr: number;
    cpl: number;
    cpc: number;
    dateStart?: string;
    dateEnd?: string;
}

export interface ReportData {
    campaignName: string;
    metrics: ReportMetrics;
    report: string;
    createdAt: string;
}

interface ReportContextValue {
    loading: boolean;
    data: ReportData | null;
    error: string;
    status: string;
    completedSections: string[];
    localMetrics: ReportMetrics | null;
    stats: { potential: number; total: number };
    loadCachedReport: (id: string, type: 'campaign' | 'account' | 'branch', dateStart?: string, dateEnd?: string) => Promise<void>;
    generateReport: (id: string, type: 'campaign' | 'account' | 'branch', dateStart?: string, dateEnd?: string) => Promise<void>;
}

const ReportContext = createContext<ReportContextValue | null>(null);

export function useReport() {
    const ctx = useContext(ReportContext);
    if (!ctx) throw new Error('useReport must be used within ReportProvider');
    return ctx;
}

// ------- Provider -------
export function ReportProvider({ children }: { children: ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ReportData | null>(null);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [completedSections, setCompletedSections] = useState<string[]>([]);
    const [localMetrics, setLocalMetrics] = useState<ReportMetrics | null>(null);
    const [stats, setStats] = useState({ potential: 0, total: 0 });

    // Load fresh KPI metrics logic
    const fetchBaseMetrics = useCallback(async (id: string, type: 'campaign' | 'account' | 'branch', customDateStart?: string, customDateEnd?: string) => {
        const dateEnd = customDateEnd || new Date().toISOString().split('T')[0];
        const dateStart = customDateStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        if (type === 'campaign') {
            // 1. Fetch campaign info to get the name
            let campaignName = `Chiến dịch: ${id}`;
            try {
                const { data: campaignData } = await apiClient.get(`/campaigns/${id}`);
                const res = campaignData.result || campaignData.data || campaignData;
                const campaignInfo = Array.isArray(res) ? res[0] : res;
                if (campaignInfo?.name) {
                    campaignName = `Chiến dịch: ${campaignInfo.name}`;
                }
            } catch (e) {
                console.warn('[Report] Could not fetch campaign name, using ID as fallback');
            }

            // 2. Fetch insights for this campaign
            const { data: insightsData } = await apiClient.get('/insights', { params: { campaignId: id, dateStart, dateEnd } });

            const insights = insightsData.result || insightsData.data || insightsData || [];
            const campaignInsights = Array.isArray(insights) ? insights : [];

            const spend = campaignInsights.reduce((s: number, i: any) => s + (Number(i.spend) || 0), 0);
            const impressions = campaignInsights.reduce((s: number, i: any) => s + (Number(i.impressions) || 0), 0);
            const clicks = campaignInsights.reduce((s: number, i: any) => s + (Number(i.clicks) || 0), 0);
            const totalResults = campaignInsights.reduce((s: number, i: any) => s + (Number(i.results || i.messagingStarted) || 0), 0);
            let potentialCount = 0;
            let totalLeadCount = 0;
            let messagingNewFromAds = 0;

            try {
                const { data: statsData } = await apiClient.get('/leads/stats', {
                    params: { campaignId: id, dateStart, dateEnd }
                });
                const s = statsData.result || statsData.data || statsData || {};
                potentialCount = (s.potentialFromAds || 0) + (s.potentialFromOrganic || 0);
                totalLeadCount = s.totalLeads || 0;
                messagingNewFromAds = s.messagingNewFromAds || 0;
            } catch (e) {
                console.error("[Report] Error fetching lead stats for campaign:", e);
            }

            return {
                spend, impressions, clicks, totalResults,
                insights: campaignInsights,
                name: campaignName,
                dateStart,
                dateEnd,
                potentialCount,
                totalLeadCount,
                messagingNewFromAds
            };
        } else {
            let fbAccountIds: string[] = [];
            let internalAccountIds: number[] = [];
            let entityName = '';

            if (type === 'branch') {
                const { data: branchData } = await apiClient.get(`/branches/${id}`);
                entityName = `Cơ sở: ${branchData.result?.name || branchData.data?.name || id}`;

                const { data: branchAccounts } = await apiClient.get('/ad-accounts', { params: { branchId: Number(id) } });
                const accounts = branchAccounts.result || branchAccounts.data || branchAccounts || [];
                fbAccountIds = accounts.map((acc: any) => acc.externalId).filter(Boolean);
                internalAccountIds = accounts.map((acc: any) => acc.id).filter(Boolean);
            } else if (type === 'account') {
                const { data: allAccountsData } = await apiClient.get('/ad-accounts');
                const accounts = allAccountsData.result || allAccountsData.data || allAccountsData || [];
                const account = accounts.find((a: any) => a.externalId === id);
                entityName = account ? `Tài khoản: ${account.name}` : `Tài khoản: ${id}`;
                fbAccountIds = [id];
                if (account) internalAccountIds = [account.id];
            }

            // Aggregate insights for all linked FB accounts
            let totalSpend = 0, totalImpressions = 0, totalClicks = 0, totalResults = 0;
            let allInsights: any[] = [];

            for (const intId of internalAccountIds) {
                try {
                    const { data: insightsData } = await apiClient.get('/insights', { params: { accountId: intId, dateStart, dateEnd } });
                    const insightsArr = Array.isArray(insightsData.result || insightsData.data || insightsData)
                        ? (insightsData.result || insightsData.data || insightsData) : [];

                    allInsights = [...allInsights, ...insightsArr];
                    totalSpend += insightsArr.reduce((s: number, i: any) => s + (Number(i.spend) || 0), 0);
                    totalImpressions += insightsArr.reduce((s: number, i: any) => s + (Number(i.impressions) || 0), 0);
                    totalClicks += insightsArr.reduce((s: number, i: any) => s + (Number(i.clicks) || 0), 0);
                    totalResults += insightsArr.reduce((s: number, i: any) => s + (Number(i.results || i.messagingStarted) || 0), 0);
                } catch (e) { console.error(`Failed to fetch insights for ${intId}`, e); }
            }

            // Query lead quality using the same /leads/stats API as Lead Insights
            // This ensures 100% consistency with the Lead Insights page
            let potentialCount = 0;
            let totalLeadCount = 0;
            let messagingNewFromAds = 0;
            for (const intId of internalAccountIds) {
                try {
                    const { data: statsData } = await apiClient.get('/leads/stats', {
                        params: { accountId: intId, dateStart, dateEnd }
                    });
                    const s = statsData.result || statsData.data || statsData || {};
                    potentialCount += (s.potentialFromAds || 0) + (s.potentialFromOrganic || 0);
                    totalLeadCount += s.totalLeads || 0;
                    messagingNewFromAds += s.messagingNewFromAds || 0;
                } catch (e) { console.error('[Report] Lead stats query error for account', intId, e); }
            }

            return {
                spend: totalSpend,
                impressions: totalImpressions,
                clicks: totalClicks,
                totalResults,
                insights: allInsights,
                fbAccountIds,
                internalAccountIds,
                name: entityName,
                potentialCount,
                totalLeadCount,
                messagingNewFromAds,
                dateStart,
                dateEnd
            };
        }
    }, []);

    const loadFreshMetrics = useCallback(async (id: string, type: 'campaign' | 'account' | 'branch', dateStart?: string, dateEnd?: string) => {
        try {
            const result = await fetchBaseMetrics(id, type, dateStart, dateEnd);
            const { spend, impressions, clicks, totalResults, name } = result;
            const potentialCount = (result as any).potentialCount || 0;
            const totalLeadCount = (result as any).totalLeadCount || 0;
            const avgCtr = impressions > 0 ? (clicks / impressions) * 100 : 0;
            const avgCpl = totalResults > 0 ? spend / totalResults : 0;
            const avgCpc = clicks > 0 ? spend / clicks : 0;
            const updatedDateStart = result.dateStart;
            const updatedDateEnd = result.dateEnd;

            const activeMetrics = {
                spend, impressions, clicks, totalResults,
                ctr: avgCtr, cpl: avgCpl, cpc: avgCpc,
                dateStart: updatedDateStart,
                dateEnd: updatedDateEnd
            } as ReportMetrics;

            setLocalMetrics(activeMetrics);
            setData({ campaignName: name || '', metrics: activeMetrics, report: '', createdAt: '' });

            // Stats for Lead Quality KPI (For campaigns, trust totalResults from Insights. For others, fallback to database if necessary)
            setStats({
                potential: potentialCount,
                total: type === 'campaign' ? totalResults : (totalLeadCount > 0 ? totalLeadCount : totalResults)
            });
        } catch (err) {
            console.error("[Report] Fresh metrics load error:", err);
        }
    }, [fetchBaseMetrics]);

    // Load cached report from DB (no Gemini call)
    const loadCachedReport = useCallback(async (id: string, type: 'campaign' | 'account' | 'branch', dateStart?: string, dateEnd?: string) => {
        if (!id || id === 'undefined') {
            console.error("[Report] Invalid ID provided to loadCachedReport:", id);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const { data: cached } = await supabase
                .from('ai_reports')
                .select('*')
                .eq('reference_id', id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (cached) {
                // Refresh KPI metrics to show live database counts (potential vs total)
                try {
                    const fallbackDateStart = cached.metrics?.dateStart;
                    const fallbackDateEnd = cached.metrics?.dateEnd;
                    const result = await fetchBaseMetrics(id, type, dateStart || fallbackDateStart, dateEnd || fallbackDateEnd);
                    const { spend, impressions, clicks, totalResults } = result;
                    const potentialCount = (result as any).potentialCount || 0;
                    const totalLeadCount = (result as any).totalLeadCount || 0;

                    const activeMetrics = {
                        spend, impressions, clicks, totalResults,
                        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
                        cpl: totalResults > 0 ? spend / totalResults : 0,
                        cpc: clicks > 0 ? spend / clicks : 0,
                        dateStart: result.dateStart,
                        dateEnd: result.dateEnd
                    } as ReportMetrics;

                    // Update everything at once to prevent multiple renders/flickers
                    setLocalMetrics(activeMetrics);
                    setData({
                        campaignName: cached.campaign_name,
                        metrics: activeMetrics, // Use fresh metrics instead of cached ones
                        report: cached.report_content,
                        createdAt: cached.created_at
                    });
                    setStats({
                        potential: potentialCount,
                        total: type === 'campaign' ? totalResults : (totalLeadCount > 0 ? totalLeadCount : totalResults)
                    });
                } catch (e) {
                    console.error("[Report] Error refreshing live metrics for cached report:", e);
                    // Only if fetch fails do we fallback to cached stats to avoid showing 0
                    setLocalMetrics(cached.metrics);
                    setStats({
                        potential: (cached.metrics as any).leadQuality?.potentialCount || 0,
                        total: cached.metrics.totalResults || 0
                    });
                }
            } else {
                await loadFreshMetrics(id, type, dateStart, dateEnd);
            }
        } catch (err: any) {
            console.error("[Report] Cache load error:", err);
        } finally {
            setLoading(false);
        }
    }, [loadFreshMetrics]);

    // Generate new report via Edge Function (Gemini)
    const generateReport = useCallback(async (id: string, type: 'campaign' | 'account' | 'branch', dateStart?: string, dateEnd?: string) => {
        if (!id || id === 'undefined') {
            toast.error("ID không hợp lệ để tạo báo cáo");
            return;
        }
        try {
            setLoading(true);
            setError('');
            setData(null);
            setCompletedSections([]);

            const {
                spend, impressions, clicks, totalResults,
                insights: filteredInsights,
                name, dateStart: fetchedDateStart, dateEnd: fetchedDateEnd,
                potentialCount, totalLeadCount
            } = await fetchBaseMetrics(id, type, dateStart, dateEnd);

            let campaignName = name;

            // Entity breakdown (Meticulous full scanning)
            const breakdownMap: Record<string, any> = {};
            filteredInsights.forEach((i: any) => {
                const entityId = type === 'campaign' ? (i.adId || 'unknown') : (i.campaignId || 'unknown');
                const entityName = type === 'campaign' ? (i.ad?.name || 'Mẫu QC') : (i.campaign?.name || 'Chiến dịch');

                if (!breakdownMap[entityId]) {
                    breakdownMap[entityId] = { name: entityName, spend: 0, leads: 0, clicks: 0, impressions: 0 };
                }
                breakdownMap[entityId].spend += (Number(i.spend) || 0);
                breakdownMap[entityId].leads += (Number(i.results || i.messagingStarted) || 0);
                breakdownMap[entityId].clicks += (Number(i.clicks) || 0);
                breakdownMap[entityId].impressions += (Number(i.impressions) || 0);
            });

            // Keep top 50 for AI analysis (Gemini supports large context) and add summary for the rest
            const allEntities = Object.entries(breakdownMap).map(([eid, e]: [string, any]) => ({
                id: eid, name: e.name, spend: e.spend, leads: e.leads,
                cpl: e.leads > 0 ? e.spend / e.leads : e.spend,
                ctr: e.impressions > 0 ? (e.clicks / e.impressions) * 100 : 0
            })).sort((a, b) => b.spend - a.spend);
            
            const entityBreakdown = allEntities.slice(0, 50);
            
            // Summary for remaining entities beyond top 50
            const remainingEntities = allEntities.slice(50);
            const remainingSummary = remainingEntities.length > 0 ? {
                count: remainingEntities.length,
                spend: remainingEntities.reduce((s, e) => s + e.spend, 0),
                leads: remainingEntities.reduce((s, e) => s + e.leads, 0),
            } : null;

            const avgCtr = impressions > 0 ? (clicks / impressions) * 100 : 0;
            const avgCpl = totalResults > 0 ? spend / totalResults : 0;
            const avgCpc = clicks > 0 ? spend / clicks : 0;

            // 2. LEAD QUALITY ANALYSIS (Exhaustive DB Query - Only for Branch and Account)
            // Note: potentialCount and totalLeadCount are already fetched in fetchBaseMetrics in the latest update
            // so we don't necessarily need to re-query here, but keeping for logic consistency if needed.
            // For now, let's rely on what fetchBaseMetrics returned.

            setStats({
                potential: potentialCount || 0,
                total: type === 'campaign' ? totalResults : (totalLeadCount || totalResults)
            });
            setLocalMetrics({
                spend, impressions, clicks, totalResults,
                ctr: avgCtr, cpl: avgCpl, cpc: avgCpc,
                dateStart: fetchedDateStart,
                dateEnd: fetchedDateEnd
            });

            // For account/branch: use actual lead count from DB (totalLeadCount) instead of FB results
            const actualLeads = type === 'campaign' ? totalResults : (totalLeadCount || totalResults);
            const actualCpl = actualLeads > 0 ? spend / actualLeads : 0;

            // 3. GENERATE VIA EDGE FUNCTION (force=true to bypass cache and always generate fresh)
            const baseUrl = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
            const response = await fetch(`${baseUrl}/ai-reports/report/generate?force=true`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
                },
                body: JSON.stringify({
                    type,
                    referenceId: id,
                    campaignName,
                    metrics: {
                        spend, impressions, clicks,
                        totalResults: actualLeads,
                        ctr: avgCtr, cpl: actualCpl, cpc: avgCpc,
                        entityBreakdown,
                        remainingSummary,
                        leadQuality: { potentialCount, totalCount: totalLeadCount || totalResults },
                        dateStart: fetchedDateStart,
                        dateEnd: fetchedDateEnd
                    }
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Lỗi khi gọi Edge Function');
            }

            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const json = await response.json();
                if (json.success && json.data) {
                    setData(json.data);
                    toast.success('Đã tải báo cáo!');
                }
            } else {
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                if (!reader) throw new Error("Không thể khởi tạo stream reader");

                let buffer = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const payload = JSON.parse(line);
                            if (payload.type === 'status') {
                                setStatus(payload.message);
                                if (payload.sectionId) setCompletedSections(prev => [...prev, payload.sectionId]);
                            } else if (payload.type === 'final') {
                                setData(payload.data);
                                toast.success('Đã tạo mới báo cáo thành công!');
                            } else if (payload.type === 'error') {
                                throw new Error(payload.message);
                            }
                        } catch (e: any) {
                            if (e.message && !e.message.includes('JSON')) throw e;
                        }
                    }
                }
            }
        } catch (err: any) {
            console.error("[Report] Generate Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
            setStatus('');
        }
    }, [fetchBaseMetrics]);

    return (
        <ReportContext.Provider value={{
            loading, data, error, status, completedSections, localMetrics, stats,
            loadCachedReport, generateReport
        }}>
            {children}
        </ReportContext.Provider>
    );
}
