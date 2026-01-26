
import { useState, useMemo } from 'react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { branchesApi, insightsApi } from '@/api';
import { usePlatform } from '@/contexts';
import { PageHeader } from '@/components/custom/PageHeader';
import { FloatingCard, FloatingCardHeader, FloatingCardTitle, FloatingCardContent } from '@/components/custom/FloatingCard';
import { LoadingState } from '@/components/custom/LoadingState';
import { EmptyState } from '@/components/custom/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRangeFilter } from '@/components/custom';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TrendingUp, LayoutDashboard, BarChart, Activity, Loader2, Trash2 } from 'lucide-react';
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
import { PlatformIcon } from '@/components/custom/PlatformIcon';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export function BranchAnalytics() {
    // Default to this year
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(),
    });

    const { activePlatform } = usePlatform();
    const [activePreset, setActivePreset] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [rebuildingBranchStats, setRebuildingBranchStats] = useState(false);
    const [cleaningUp, setCleaningUp] = useState(false);

    const handleRebuildBranchStats = async () => {
        const confirmed = window.confirm(
            'Cập nhật lại dữ liệu thống kê cho tất cả cơ sở từ toàn bộ lịch sử insights?\n\nThao tác này có thể mất vài phút nếu dữ liệu nhiều.',
        );
        if (!confirmed) return;

        setRebuildingBranchStats(true);
        try {
            const { data } = await branchesApi.rebuildStats();
            const result = data.result || data;
            toast.success('Đã bắt đầu cập nhật dữ liệu cơ sở', {
                description: result?.dates
                    ? `Đã xử lý ${result.dates} ngày cho ${result.branches} cơ sở.`
                    : undefined,
            });
        } catch {
            toast.error('Lỗi cập nhật dữ liệu cơ sở');
        } finally {
            setRebuildingBranchStats(false);
        }
    };

    const handleCleanupHourlyInsights = async () => {
        const confirmed = window.confirm(
            'Xóa tất cả hourly insights cũ hơn ngày hôm qua?\nDữ liệu này không cần thiết và chiếm dung lượng database.',
        );
        if (!confirmed) return;

        setCleaningUp(true);
        try {
            const { data } = await insightsApi.cleanupHourlyInsights();
            toast.success(`Đã xóa ${data.deletedCount || 0} bản ghi cũ`, {
                description: 'Hourly insights cleanup thành công',
            });
        } catch {
            toast.error('Lỗi cleanup hourly insights');
        } finally {
            setCleaningUp(false);
        }
    };

    const dateStart = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
    const dateEnd = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';

    const { data: dashboardData, isLoading, refetch } = useDashboardStats({
        dateStart,
        dateEnd,
        platformCode: activePlatform
    });

    const branches = dashboardData?.branches || [];
    const breakdowns = dashboardData?.breakdowns || { device: [], ageGender: [], region: [] };

    // Derived Metrics from Branches Summary
    const statsByBranch = useMemo(() => {
        return [...branches]
            .map((b: any) => {
                const spend = Number(b.totalSpend || 0);
                const impressions = Number(b.totalImpressions || 0);
                const clicks = Number(b.totalClicks || 0);
                const messaging = Number(b.totalMessaging || 0);

                return {
                    ...b,
                    totalSpend: spend,
                    totalImpressions: impressions,
                    totalClicks: clicks,
                    totalMessaging: messaging,
                    costPerMessage: messaging > 0 ? spend / messaging : 0,
                    ctrPercent: impressions > 0 ? (clicks / impressions) * 100 : 0,
                    cpc: clicks > 0 ? spend / clicks : 0,
                    cpm: impressions > 0 ? (spend / (impressions / 1000)) : 0,
                };
            })
            .sort((a: any, b: any) => b.totalSpend - a.totalSpend);
    }, [branches]);

    const totalSpend = statsByBranch.reduce((sum: number, b: any) => sum + Number(b.totalSpend || 0), 0);
    const totalClicks = statsByBranch.reduce((sum: number, b: any) => sum + Number(b.totalClicks || 0), 0);
    const totalMessages = statsByBranch.reduce((sum: number, b: any) => sum + Number(b.totalMessaging || 0), 0);
    const avgCostPerMessage = totalMessages > 0 ? totalSpend / totalMessages : 0;
    const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;

    if (isLoading) return <LoadingState text="Đang thống kê dữ liệu cơ sở..." />;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover border border-border p-3 rounded-lg shadow-xl">
                    <p className="text-sm font-medium text-popover-foreground mb-1">{label}</p>
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
            >
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCleanupHourlyInsights}
                        disabled={cleaningUp}
                        className="text-orange-400 hover:text-orange-300 border-orange-500/50 hover:border-orange-500"
                    >
                        {cleaningUp ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Dọn Hourly Insights
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleRebuildBranchStats}
                        disabled={rebuildingBranchStats}
                    >
                        {rebuildingBranchStats ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Sync dữ liệu cơ sở
                    </Button>
                </div>
            </PageHeader>

            <FloatingCard>
                <div className="flex flex-wrap items-end gap-4">
                    <DateRangeFilter 
                      dateRange={dateRange} 
                      setDateRange={setDateRange} 
                      activePreset={activePreset} 
                      onPresetChange={setActivePreset}
                      className="flex-1"
                    />
                    <Button
                        disabled={syncing || !dateRange?.from || !dateRange?.to}
                        onClick={async () => {
                            if (!dateRange?.from || !dateRange?.to) return;

                            setSyncing(true);
                            try {
                                const startStr = format(dateRange.from, 'yyyy-MM-dd');
                                const endStr = format(dateRange.to, 'yyyy-MM-dd');

                                // Get all branches if dashboardData.branches is empty
                                let branchesToSync = branches;
                                if (branchesToSync.length === 0) {
                                    const { data } = await branchesApi.list();
                                    branchesToSync = data.result || data || [];
                                }

                                if (branchesToSync.length === 0) {
                                    toast.error('Không tìm thấy cơ sở nào để đồng bộ');
                                    return;
                                }

                                // Sync branches for the user
                                toast.info(`Đang đồng bộ ${branchesToSync.length} cơ sở...`);
                                for (const branch of branchesToSync) {
                                    await branchesApi.syncBranch(branch.id, startStr, endStr);
                                }

                                // After sync, force refetch
                                await refetch();
                                toast.success('Đồng bộ dữ liệu thành công');
                            } catch (error) {
                                console.error("Sync failed", error);
                                toast.error('Đồng bộ thất bại');
                            } finally {
                                setSyncing(false);
                            }
                        }}
                        className="px-6 h-9"
                    >
                        {syncing ? 'Đang đồng bộ...' : 'Cập nhật dữ liệu'}
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
                            {new Intl.NumberFormat('vi-VN').format(Math.round(avgCPC))}đ
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
                            <ReBarChart data={statsByBranch} layout="vertical" margin={{ left: 40, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
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
                                <Bar dataKey="totalSpend" name="Chi phí (VND)" radius={[0, 4, 4, 0]}>
                                    {statsByBranch.map((_entry: any, index: number) => (
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
                            <ReBarChart data={statsByBranch}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                                <Bar dataKey="ctrPercent" name="CTR (%)" radius={[4, 4, 0, 0]}>
                                    {statsByBranch.map((_entry: any, index: number) => (
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
                <DeviceBreakdownChart data={breakdowns.device} loading={isLoading} />
                <AgeGenderBreakdownChart data={breakdowns.ageGender} loading={isLoading} />
                <RegionBreakdownList data={breakdowns.region} loading={isLoading} />
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
                                {statsByBranch.map((row: any) => (
                                    <TableRow key={row.id} className="border-border/30 hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-semibold text-foreground">
                                            <div className="flex flex-col gap-1">
                                                <span>{row.name}</span>
                                                <div className="flex gap-1">
                                                    {row.platforms?.map((p: any) => (
                                                        <PlatformIcon key={p.code} platformCode={p.code} className="h-3 w-3" />
                                                    ))}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-orange-400 font-mono font-medium">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(row.totalSpend)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-muted-foreground">{row.totalImpressions.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-mono text-muted-foreground">{row.totalClicks.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-mono font-bold text-pink-400">{row.totalMessaging.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-mono text-foreground/80">
                                            {new Intl.NumberFormat('vi-VN').format(Math.round(row.costPerMessage))}đ
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-medium text-emerald-400">
                                            {row.ctrPercent.toFixed(2)}%
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-foreground/80">
                                            {new Intl.NumberFormat('vi-VN').format(Math.round(row.cpc))}đ
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-muted-foreground">
                                            {new Intl.NumberFormat('vi-VN').format(Math.round(row.cpm))}đ
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {statsByBranch.length === 0 && (
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
