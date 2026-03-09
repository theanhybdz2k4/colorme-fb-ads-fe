
import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adAccountsApi, campaignsApi, analyticsApi } from '@/api';
import { useInsights } from '@/hooks/useInsights';
import { useAuth } from '@/features/auth';
import { usePlatform } from '@/contexts';
import type { DateRange } from 'react-day-picker';
import { subDays, format, isSameDay } from 'date-fns';

interface DashboardContextType {
    adAccounts: any[];
    campaigns: any[];
    insights: any[];
    dailyInsights: any[];
    prevInsights: any[];
    prevDailyInsights: any[];
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
    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;
    granularity: 'DAILY' | 'HOURLY';
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { activePlatform } = usePlatform();

    // Date range state
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    // Detect granularity
    const granularity = React.useMemo<'DAILY' | 'HOURLY'>(() => {
        if (!dateRange?.from || !dateRange?.to) return 'DAILY';
        return isSameDay(dateRange.from, dateRange.to) ? 'HOURLY' : 'DAILY';
    }, [dateRange]);

    // Date ranges for queries
    const dateStart = React.useMemo(() =>
        dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : format(subDays(new Date(), 29), 'yyyy-MM-dd'),
        [dateRange]);

    const dateEnd = React.useMemo(() =>
        dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        [dateRange]);

    // Previous period calculation (smart comparison)
    const prevDateRange = React.useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) return null;

        const duration = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Smart offset logic
        let prevTo = subDays(dateRange.from, 1);
        let prevFrom = subDays(prevTo, duration - 1);

        // If it's "Today", comparison should be "Yesterday"
        const isToday = (range: { from?: Date, to?: Date }) => {
            const today = new Date();
            return range.from && range.to &&
                format(range.from, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') &&
                format(range.to, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
        };

        // If it's "Yesterday", comparison should be "Day Before Yesterday"
        const isYesterday = (range: { from?: Date, to?: Date }) => {
            const yesterday = subDays(new Date(), 1);
            return range.from && range.to &&
                format(range.from, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd') &&
                format(range.to, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd');
        };

        if (isToday(dateRange)) {
            prevTo = subDays(new Date(), 1);
            prevFrom = prevTo;
        } else if (isYesterday(dateRange)) {
            prevTo = subDays(new Date(), 2);
            prevFrom = prevTo;
        }

        return {
            from: format(prevFrom, 'yyyy-MM-dd'),
            to: format(prevTo, 'yyyy-MM-dd')
        };
    }, [dateRange]);

    const prevDateStart = prevDateRange?.from || dateStart;
    const prevDateEnd = prevDateRange?.to || dateEnd;

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

    const { data: rawCampaigns = [], isLoading: loadingCampaigns } = useQuery({
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

    const TAX_MULTIPLIER = 1.1;

    const campaigns = useMemo(() => {
        return rawCampaigns.map((c: any) => ({
            ...c,
            stats: c.stats ? {
                ...c.stats,
                spend: (Number(c.stats.spend) || 0) * TAX_MULTIPLIER
            } : c.stats
        }));
    }, [rawCampaigns]);

    const { data: insights = [], isLoading: loadingInsights } = useInsights({
        dateStart,
        dateEnd,
        platformCode: activePlatform,
        granularity
    });

    const { data: dailyInsights = [], isLoading: loadingDailyInsights } = useInsights({
        dateStart,
        dateEnd,
        platformCode: activePlatform,
        granularity: 'DAILY'
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
        platformCode: activePlatform,
        granularity
    });

    const { data: prevDailyInsights = [], isLoading: loadingPrevDailyInsights } = useInsights({
        dateStart: prevDateStart,
        dateEnd: prevDateEnd,
        platformCode: activePlatform,
        granularity: 'DAILY'
    });

    const isLoading = loadingAccounts || loadingCampaigns || loadingInsights || loadingDailyInsights || loadingPrevInsights || loadingPrevDailyInsights || loadingBreakdown;

    // Derived Metrics (Use Daily Insights for Aggregate Totals to ensure reliability)
    const metrics = useMemo(() => {
        const safeInsights = Array.isArray(dailyInsights) ? dailyInsights : [];
        const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];

        // Apply tax markup consistently with Branch Analytics
        const totalSpend = safeInsights.reduce((sum, item) => sum + (Number(item.spend) || 0), 0) * TAX_MULTIPLIER;
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
    }, [dailyInsights, campaigns]);

    // Trend Calculations
    const trends = useMemo(() => {
        const safePrev = Array.isArray(prevDailyInsights) ? prevDailyInsights : [];

        const prevSpend = safePrev.reduce((sum, item) => sum + (Number(item.spend) || 0), 0) * TAX_MULTIPLIER;
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
    }, [metrics, prevDailyInsights]);

    const value = {
        adAccounts,
        campaigns,
        insights,
        dailyInsights,
        prevInsights,
        prevDailyInsights,
        ageGenderBreakdown,
        isLoading,
        metrics,
        trends,
        user,
        activePlatform,
        dateRange,
        setDateRange,
        granularity
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
