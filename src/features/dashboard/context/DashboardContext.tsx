
import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adAccountsApi, campaignsApi, analyticsApi } from '@/api';
import { useInsights } from '@/hooks/useInsights';
import { useAuth } from '@/features/auth';
import { usePlatform } from '@/contexts';

interface DashboardContextType {
    adAccounts: any[];
    campaigns: any[];
    insights: any[];
    prevInsights: any[];
    ageGenderBreakdown: any[];
    isLoading: boolean;
    metrics: {
        totalSpend: number;
        totalLeads: number;
        totalClicks: number;
        totalImpressions: number;
        overallCPL: number;
        overallCTR: number;
        activeCampaignsCount: number;
    };
    trends: {
        spend: number;
        leads: number;
        clicks: number;
        cpl: number;
        ctr: number;
    };
    user: any;
    activePlatform: string;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { activePlatform } = usePlatform();

    // Date ranges
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(today.getDate() - 31);

    const dateEnd = today.toISOString().split('T')[0];
    const dateStart = thirtyDaysAgo.toISOString().split('T')[0];

    const prevDateEnd = thirtyOneDaysAgo.toISOString().split('T')[0];
    const prevDateStart = sixtyDaysAgo.toISOString().split('T')[0];

    // Data Fetching
    const { data: adAccounts = [], isLoading: loadingAccounts } = useQuery({
        queryKey: ['ad-accounts', activePlatform],
        queryFn: async () => {
            const { data } = await adAccountsApi.list();
            const accounts = data.result || data.data || data || [];
            if (activePlatform !== 'all') {
                return accounts.filter((acc: any) => acc.platform?.code === activePlatform || (activePlatform === 'facebook' && !acc.platform));
            }
            return accounts;
        },
    });

    const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
        queryKey: ['campaigns', activePlatform],
        queryFn: async () => {
            const { data } = await campaignsApi.list();
            const campaignList = data.result || data.data || data || [];
            if (activePlatform !== 'all') {
                return campaignList.filter((c: any) => c.account?.platform?.code === activePlatform || (activePlatform === 'facebook' && !c.account?.platform));
            }
            return campaignList;
        },
    });

    const { data: insights = [], isLoading: loadingInsights } = useInsights({
        dateStart,
        dateEnd,
        platformCode: activePlatform
    });

    const { data: ageGenderBreakdown = [], isLoading: loadingBreakdown } = useQuery({
        queryKey: ['ageGenderBreakdown', dateStart, dateEnd, activePlatform],
        queryFn: () => analyticsApi.getAgeGenderBreakdown({
            dateStart,
            dateEnd,
            branchId: activePlatform === 'all' ? undefined : activePlatform
        }),
    });

    const { data: prevInsights = [], isLoading: loadingPrevInsights } = useInsights({
        dateStart: prevDateStart,
        dateEnd: prevDateEnd,
        platformCode: activePlatform
    });

    const isLoading = loadingAccounts || loadingCampaigns || loadingInsights || loadingPrevInsights || loadingBreakdown;

    // Derived Metrics
    const metrics = useMemo(() => {
        const safeInsights = Array.isArray(insights) ? insights : [];
        const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];

        const totalSpend = safeInsights.reduce((sum, item) => sum + (Number(item.spend) || 0), 0);
        const totalLeads = safeInsights.reduce((sum, item) => sum + (Number(item.results || item.messagingStarted) || 0), 0);
        const totalClicks = safeInsights.reduce((sum, item) => sum + (Number(item.clicks) || 0), 0);
        const totalImpressions = safeInsights.reduce((sum, item) => sum + (Number(item.impressions) || 0), 0);

        const overallCPL = totalLeads > 0 ? totalSpend / totalLeads : 0;
        const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const activeCampaignsCount = safeCampaigns.filter((c: any) => c.effectiveStatus === 'ACTIVE' || c.status === 'ACTIVE').length;

        return {
            totalSpend,
            totalLeads,
            totalClicks,
            totalImpressions,
            overallCPL,
            overallCTR,
            activeCampaignsCount
        };
    }, [insights, campaigns]);

    // Trend Calculations
    const trends = useMemo(() => {
        const safePrev = Array.isArray(prevInsights) ? prevInsights : [];

        const prevSpend = safePrev.reduce((sum, item) => sum + (Number(item.spend) || 0), 0);
        const prevLeads = safePrev.reduce((sum, item) => sum + (Number(item.results || item.messagingStarted) || 0), 0);
        const prevClicks = safePrev.reduce((sum, item) => sum + (Number(item.clicks) || 0), 0);
        const prevImpressions = safePrev.reduce((sum, item) => sum + (Number(item.impressions) || 0), 0);

        const prevCPL = prevLeads > 0 ? prevSpend / prevLeads : 0;
        const prevCTR = prevImpressions > 0 ? (prevClicks / prevImpressions) * 100 : 0;

        const calculateTrend = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        return {
            spend: calculateTrend(metrics.totalSpend, prevSpend),
            leads: calculateTrend(metrics.totalLeads, prevLeads),
            clicks: calculateTrend(metrics.totalClicks, prevClicks),
            cpl: calculateTrend(metrics.overallCPL, prevCPL),
            ctr: calculateTrend(metrics.overallCTR, prevCTR),
        };
    }, [metrics, prevInsights]);

    const value = {
        adAccounts,
        campaigns,
        insights,
        prevInsights,
        ageGenderBreakdown,
        isLoading,
        metrics,
        trends,
        user,
        activePlatform
    };

    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
