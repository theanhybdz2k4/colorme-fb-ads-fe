import { useState, useMemo, useEffect } from 'react';
import { useInsights } from '@/hooks/useInsights';
import { useAds } from '@/hooks/useAds';
import { useBranches } from '@/hooks/useBranches';
import { useAdAccounts } from '@/hooks/useAdAccounts';
import { branchesApi } from '@/api/branches.api'; // Updated import
import {
    PageHeader,
    FloatingCard,
    FloatingCardHeader,
    FloatingCardTitle,
    FloatingCardContent,
    LoadingState,
    EmptyState,
} from '@/components/custom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getVietnamDateString, getVietnamYesterdayString } from '@/lib/utils';
import { TrendingUp, LayoutDashboard, BarChart, Activity } from 'lucide-react';
import {
    BarChart as ReBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { DeviceBreakdownChart } from '@/features/insights/components/DeviceBreakdownChart';
import { AgeGenderBreakdownChart } from '@/features/insights/components/AgeGenderBreakdownChart';
import { RegionBreakdownList } from '@/features/insights/components/RegionBreakdownList';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export function BranchAnalytics() {
    const today = getVietnamDateString();
    const yesterday = getVietnamYesterdayString();
    const [dateStart, setDateStart] = useState(yesterday);
    const [dateEnd, setDateEnd] = useState(today);

    const { data: branches, isLoading: loadingBranches } = useBranches();
    const { data: adAccounts, isLoading: loadingAccounts } = useAdAccounts();
    const { data: ads, isLoading: loadingAds } = useAds();
    const { data: insights, isLoading: loadingInsights, refetch } = useInsights({
        dateStart,
        dateEnd,
    });

    // Breakdown Data States
    const [deviceStats, setDeviceStats] = useState<any[]>([]);
    const [ageGenderStats, setAgeGenderStats] = useState<any[]>([]);
    const [regionStats, setRegionStats] = useState<any[]>([]);
    const [loadingBreakdowns, setLoadingBreakdowns] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Fetch breakdown stats when branches, dates or refreshTrigger changes
    useEffect(() => {
        const fetchBreakdowns = async () => {
            if (!branches || branches.length === 0) return;

            setLoadingBreakdowns(true);
            try {
                // Fetch for all branches and aggregate
                const devicePromises = branches.map(b =>
                    branchesApi.getDeviceStats(b.id, dateStart, dateEnd)
                );
                const ageGenderPromises = branches.map(b =>
                    branchesApi.getAgeGenderStats(b.id, dateStart, dateEnd)
                );
                const regionPromises = branches.map(b =>
                    branchesApi.getRegionStats(b.id, dateStart, dateEnd)
                );

                const [deviceRes, ageGenderRes, regionRes] = await Promise.all([
                    Promise.all(devicePromises),
                    Promise.all(ageGenderPromises),
                    Promise.all(regionPromises)
                ]);

                // Aggregate Device Stats
                const aggDevice: Record<string, any> = {};
                deviceRes.forEach((items: any[]) => {
                    items.forEach((item: any) => {
                        const key = item.device;
                        if (!aggDevice[key]) aggDevice[key] = { ...item, spend: 0, impressions: 0, clicks: 0, results: 0 };
                        aggDevice[key].spend += item.spend;
                        aggDevice[key].impressions += item.impressions;
                        aggDevice[key].clicks += item.clicks;
                        aggDevice[key].results += item.results;
                    });
                });
                setDeviceStats(Object.values(aggDevice));

                // Aggregate Age/Gender Stats
                const aggAgeGender: Record<string, any> = {};
                ageGenderRes.forEach((items: any[]) => {
                    items.forEach((item: any) => {
                        const key = `${item.age}-${item.gender}`;
                        if (!aggAgeGender[key]) aggAgeGender[key] = { ...item, spend: 0, impressions: 0, clicks: 0, results: 0 };
                        aggAgeGender[key].spend += item.spend;
                        aggAgeGender[key].impressions += item.impressions;
                        aggAgeGender[key].clicks += item.clicks;
                        aggAgeGender[key].results += item.results;
                    });
                });
                setAgeGenderStats(Object.values(aggAgeGender));

                // Aggregate Region Stats
                const aggRegion: Record<string, any> = {};
                regionRes.forEach((items: any[]) => {
                    items.forEach((item: any) => {
                        // Composite key to separate by country/region
                        const key = `${item.country}-${item.region}`;
                        if (!aggRegion[key]) aggRegion[key] = { ...item, spend: 0, impressions: 0, clicks: 0, results: 0 };
                        aggRegion[key].spend += item.spend;
                        aggRegion[key].impressions += item.impressions;
                        aggRegion[key].clicks += item.clicks;
                        aggRegion[key].results += item.results;
                    });
                });
                setRegionStats(Object.values(aggRegion));

            } catch (error) {
                console.error("Failed to fetch breakdown stats", error);
            } finally {
                setLoadingBreakdowns(false);
            }
        };

        fetchBreakdowns();
    }, [branches, dateStart, dateEnd, refreshTrigger]);

    const isLoading = loadingBranches || loadingAccounts || loadingAds || loadingInsights;

    const getMessagingStats = (actions: any[]) => {
        if (!actions || !Array.isArray(actions)) return 0;
        const messagingTypes = [
            'onsite_conversion.messaging_conversation_started_7d',
            'onsite_conversion.messaging_first_reply',
            'lead',
            'omni_complete_registration',
        ];

        return actions.reduce((sum, action) => {
            if (messagingTypes.includes(action.action_type)) {
                return sum + Number(action.value || 0);
            }
            return sum;
        }, 0);
    };

    const aggregatedData = useMemo(() => {
        if (!branches || !adAccounts || !ads || !insights) return [];

        // Build accountId -> branch mappings
        const accountToBranchMap = new Map<string, number>();
        adAccounts.forEach(acc => {
            if (acc.branch?.id) {
                accountToBranchMap.set(acc.id, acc.branch.id);
            }
        });

        // Build adId -> branch mapping
        const adToBranchMap = new Map<string, number>();
        ads.forEach(ad => {
            const branchId = accountToBranchMap.get(ad.accountId);
            if (branchId) {
                adToBranchMap.set(ad.id, branchId);
            }
        });

        // Aggregate by branch
        const statsByBranch = branches.map(branch => {
            const branchInsights = insights.filter(ins => adToBranchMap.get(ins.adId) === branch.id);

            const totalSpend = branchInsights.reduce((sum, ins) => sum + Number(ins.spend || 0), 0);
            const totalImpressions = branchInsights.reduce((sum, ins) => sum + Number(ins.impressions || 0), 0);
            const totalClicks = branchInsights.reduce((sum, ins) => sum + Number(ins.clicks || 0), 0);
            const totalMessages = branchInsights.reduce((sum, ins) => sum + getMessagingStats(ins.actions || []), 0);

            return {
                id: branch.id,
                name: branch.name,
                spend: totalSpend,
                impressions: totalImpressions,
                clicks: totalClicks,
                messages: totalMessages,
                cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
                ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
                cpm: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0,
                costPerMessage: totalMessages > 0 ? totalSpend / totalMessages : 0,
            };
        });

        return statsByBranch.sort((a, b) => b.spend - a.spend);
    }, [branches, adAccounts, ads, insights]);

    const totalSpend = aggregatedData.reduce((sum: number, b: any) => sum + b.spend, 0);
    const totalClicks = aggregatedData.reduce((sum: number, b: any) => sum + b.clicks, 0);
    const totalMessages = aggregatedData.reduce((sum: number, b: any) => sum + b.messages, 0);
    const avgCostPerMessage = totalMessages > 0 ? totalSpend / totalMessages : 0;

    if (isLoading) return <LoadingState text="Đang thống kê dữ liệu cơ sở..." />;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
                    <p className="text-sm font-medium text-slate-200 mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-xs" style={{ color: entry.color }}>
                            {entry.name}: {entry.name.includes('Chi phí') || entry.name.includes('CPC') || entry.name.includes('Cost')
                                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(entry.value)
                                : entry.value.toLocaleString()}
                            {entry.name.includes('CTR') ? '%' : ''}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-float-up pb-10">
            <PageHeader
                title="Phân tích cơ sở"
                description="Tổng quan hiệu suất quảng cáo gom theo chi nhánh. Tự động gom nhóm dựa trên tài khoản quảng cáo của cơ sở."
            />

            <FloatingCard>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="space-y-2">
                        <Label htmlFor="dateStart" className="text-xs text-muted-foreground">Từ ngày</Label>
                        <Input
                            id="dateStart"
                            type="date"
                            value={dateStart}
                            onChange={(e) => setDateStart(e.target.value)}
                            className="w-44 bg-muted/30 border-border/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dateEnd" className="text-xs text-muted-foreground">Đến ngày</Label>
                        <Input
                            id="dateEnd"
                            type="date"
                            value={dateEnd}
                            onChange={(e) => setDateEnd(e.target.value)}
                            className="w-44 bg-muted/30 border-border/50"
                        />
                    </div>
                    <Button
                        disabled={loadingBreakdowns}
                        onClick={async () => {
                            if (!branches || branches.length === 0) return;

                            setLoadingBreakdowns(true);
                            try {
                                // Sync each branch
                                for (const branch of branches) {
                                    await branchesApi.syncBranch(branch.id, dateStart, dateEnd);
                                }

                                // After sync, force refetch
                                await refetch();
                                setRefreshTrigger(prev => prev + 1);
                            } catch (error) {
                                console.error("Sync failed", error);
                            } finally {
                                setLoadingBreakdowns(false);
                            }
                        }}
                        className="px-6"
                    >
                        {loadingBreakdowns ? 'Đang đồng bộ...' : 'Cập nhật dữ liệu'}
                    </Button>
                </div>
            </FloatingCard>

            {/* TOP METRICS */}
            <div className="grid gap-4 md:grid-cols-4">
                <FloatingCard className="bg-linear-to-br from-indigo-500/10 to-transparent">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Tổng chi phí</p>
                        <p className="text-2xl font-bold text-indigo-400">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(totalSpend)}
                        </p>
                    </div>
                </FloatingCard>
                <FloatingCard className="bg-linear-to-br from-emerald-500/10 to-transparent">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Tổng Clicks</p>
                        <p className="text-2xl font-bold text-emerald-400">{totalClicks.toLocaleString()}</p>
                    </div>
                </FloatingCard>
                <FloatingCard className="bg-linear-to-br from-amber-500/10 to-transparent">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">CPC Trung bình</p>
                        <p className="text-2xl font-bold text-amber-400">
                            {new Intl.NumberFormat('vi-VN').format(Math.round(totalClicks > 0 ? totalSpend / totalClicks : 0))}đ
                        </p>
                    </div>
                </FloatingCard>
                <FloatingCard className="bg-linear-to-br from-pink-500/10 to-transparent">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Tin nhắn mới</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-pink-400">{totalMessages.toLocaleString()}</p>
                            <span className="text-xs text-muted-foreground">
                                ({new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(avgCostPerMessage)}đ / tin)
                            </span>
                        </div>
                    </div>
                </FloatingCard>
            </div>

            {/* CHARTS ROW 1: Spend & CTR */}
            <div className="grid gap-6 lg:grid-cols-2">
                <FloatingCard padding="none">
                    <FloatingCardHeader className="p-4 border-b border-border/30 flex justify-between items-center">
                        <FloatingCardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Phân bổ chi phí theo cơ sở
                        </FloatingCardTitle>
                    </FloatingCardHeader>
                    <FloatingCardContent className="p-4 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart data={aggregatedData} layout="vertical" margin={{ left: 40, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    width={100}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                                <Bar dataKey="spend" name="Chi phí (VND)" radius={[0, 4, 4, 0]}>
                                    {aggregatedData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </ReBarChart>
                        </ResponsiveContainer>
                    </FloatingCardContent>
                </FloatingCard>

                <FloatingCard padding="none">
                    <FloatingCardHeader className="p-4 border-b border-border/30">
                        <FloatingCardTitle className="text-sm font-medium flex items-center gap-2">
                            <Activity className="h-4 w-4 text-emerald-400" />
                            Hiệu quả CTR (%) giữa các cơ sở
                        </FloatingCardTitle>
                    </FloatingCardHeader>
                    <FloatingCardContent className="p-4 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart data={aggregatedData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                                <Bar dataKey="ctr" name="CTR (%)" radius={[4, 4, 0, 0]}>
                                    {aggregatedData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </ReBarChart>
                        </ResponsiveContainer>
                    </FloatingCardContent>
                </FloatingCard>
            </div>

            {/* CHARTS ROW 2: DETAILED BREAKDOWNS */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                <DeviceBreakdownChart data={deviceStats} loading={loadingBreakdowns} />
                <AgeGenderBreakdownChart data={ageGenderStats} loading={loadingBreakdowns} />
                <RegionBreakdownList data={regionStats} loading={loadingBreakdowns} />
            </div>

            {/* DATA TABLE */}
            <FloatingCard padding="none">
                <FloatingCardHeader className="p-4 border-b border-border/30">
                    <FloatingCardTitle className="text-sm font-medium flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-indigo-400" />
                        Bảng thống kê chi tiết theo cơ sở
                    </FloatingCardTitle>
                </FloatingCardHeader>
                <FloatingCardContent className="p-0">
                    <div className="overflow-auto border-t border-border/10">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/30 hover:bg-transparent bg-muted/20">
                                    <TableHead className="text-xs font-bold text-muted-foreground uppercase py-4">Cơ sở</TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground uppercase text-right py-4">Chi phí (VND)</TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground uppercase text-right py-4">Hiển thị</TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground uppercase text-right py-4">Click</TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground uppercase text-right py-4">Tin nhắn mới</TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground uppercase text-right py-4">Chi phí/Tin</TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground uppercase text-right py-4">CTR</TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground uppercase text-right py-4">CPC</TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground uppercase text-right py-4">CPM</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {aggregatedData.map((row) => (
                                    <TableRow key={row.id} className="border-border/30 hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-semibold text-slate-200">{row.name}</TableCell>
                                        <TableCell className="text-right text-orange-400 font-mono font-medium">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(row.spend)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-slate-400">{row.impressions.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-mono text-slate-400">{row.clicks.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-mono font-bold text-pink-400">{row.messages.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-mono text-slate-300">
                                            {new Intl.NumberFormat('vi-VN').format(Math.round(row.costPerMessage))}đ
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-medium text-emerald-400">
                                            {row.ctr.toFixed(2)}%
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-slate-300">
                                            {new Intl.NumberFormat('vi-VN').format(Math.round(row.cpc))}đ
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-slate-400">
                                            {new Intl.NumberFormat('vi-VN').format(Math.round(row.cpm))}đ
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {aggregatedData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-32">
                                            <EmptyState
                                                icon={<LayoutDashboard className="h-8 w-8 text-muted-foreground/30" />}
                                                title="Không có dữ liệu"
                                                description="Vui lòng kiểm tra lại khoảng thời gian hoặc sync dữ liệu mới"
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </FloatingCardContent>
            </FloatingCard>
        </div>
    );
}
