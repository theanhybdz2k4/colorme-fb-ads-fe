export { BranchAnalytics } from './sections/BranchAnalytics';
import { AdAnalyticsDetail } from './sections/AdAnalyticsDetail';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInsights } from '@/hooks/useInsights';
import { useAds } from '@/hooks/useAds';
import { useAdAccounts } from '@/hooks/useAdAccounts';
import { usePlatform } from '@/contexts';
import { BranchFilter } from '@/features/adAccounts';
import { insightsApi, branchesApi } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, RefreshCw, BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/custom/PageHeader';
import { FloatingCard, FloatingCardHeader, FloatingCardTitle, FloatingCardContent } from '@/components/custom/FloatingCard';
import { LoadingState } from '@/components/custom/LoadingState';
import { EmptyState } from '@/components/custom/EmptyState';
import { PlatformIcon } from '@/components/custom/PlatformIcon';
import { getVietnamDateString, getVietnamYesterdayString } from '@/lib/utils';

// Platform filter moved to global PlatformContext (header tabs)

export function InsightsPage() {
    const queryClient = useQueryClient();
    const [selectedAd, setSelectedAd] = useState<string>('all');
    const [selectedBranch, setSelectedBranch] = useState<string>('all');
    const { activePlatform } = usePlatform();
    const [syncing, setSyncing] = useState(false);
    const [detailAd, setDetailAd] = useState<{ id: string; name?: string } | null>(null);

    // Use Vietnam timezone (GMT+7) for date defaults
    const today = getVietnamDateString();
    const yesterday = getVietnamYesterdayString();
    const [dateStart, setDateStart] = useState(yesterday);
    const [dateEnd, setDateEnd] = useState(today);

    const { data: ads } = useAds({
        effectiveStatus: 'ACTIVE',
        branchId: selectedBranch === 'all' ? undefined : selectedBranch,
    });

    const { data, isLoading, refetch } = useInsights({
        dateStart,
        dateEnd,
        branchId: selectedBranch === 'all' ? undefined : selectedBranch,
    });

    const { data: adAccounts } = useAdAccounts();

    const filteredData = data?.filter(insight => {
        if (activePlatform === 'all') return true;
        return (insight as any).ad?.account?.platform?.code === activePlatform || (activePlatform === 'facebook' && !(insight as any).ad?.account?.platform);
    });

    const handleSync = async () => {
        setSyncing(true);
        try {
            // If specific ad selected -> sync its account
            if (selectedAd !== 'all') {
                const ad = ads?.find(a => a.id === selectedAd);
                if (ad) {
                    toast.info('Đang sync daily insights...');
                    await insightsApi.syncAccount(ad.accountId, dateStart, dateEnd);
                    toast.info('Đang sync hourly insights...');
                    await insightsApi.syncAccount(ad.accountId, dateStart, dateEnd, 'HOURLY');
                    toast.success('Đã hoàn tất sync Insights (Daily + Hourly)', {
                        description: `Account: ${ad.accountId}, Ad: ${selectedAd}`,
                    });
                }
            } else if (selectedBranch !== 'all') {
                // Sync branch
                toast.info('Đang sync daily insights data cho cơ sở...');
                await insightsApi.syncBranch(Number(selectedBranch), dateStart, dateEnd);
                toast.info('Đang sync hourly insights data cho cơ sở...');
                await insightsApi.syncBranch(Number(selectedBranch), dateStart, dateEnd, 'HOURLY');
                toast.success('Đã hoàn tất sync Insights cho cơ sở (Daily + Hourly)', {
                    description: `Branch: ${selectedBranch}`,
                });
            } else {
                // Sync all active accounts
                const activeAccounts = adAccounts?.filter(acc => acc.accountStatus === 'ACTIVE') || [];
                if (activeAccounts.length === 0) {
                    toast.error('Không có ad accounts nào active');
                    return;
                }

                toast.info(`Đang sync daily insights cho ${activeAccounts.length} accounts...`);
                await Promise.all(activeAccounts.map(acc => insightsApi.syncAccount(acc.id, dateStart, dateEnd)));

                toast.info(`Đang sync hourly insights cho ${activeAccounts.length} accounts...`);
                await Promise.all(activeAccounts.map(acc => insightsApi.syncAccount(acc.id, dateStart, dateEnd, 'HOURLY')));

                toast.success('Đã hoàn tất sync Insights (Daily + Hourly)', {
                    description: `Đã sync ${activeAccounts.length} accounts`,
                });
            }

            // Auto-rebuild branch stats after insights sync
            try { await branchesApi.rebuildStats(); } catch { /* ignore */ }

            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['insights'] });
            }, 5000);
        } catch {
            toast.error('Lỗi sync Insights');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="space-y-6 animate-float-up p-6">
            {/* Header */}
            <PageHeader
                title="Insights"
                description="Dữ liệu hiệu suất quảng cáo theo ngày"
            >
                <BranchFilter value={selectedBranch} onChange={setSelectedBranch} />
                <Select value={selectedAd} onValueChange={setSelectedAd}>
                    <SelectTrigger className="w-52 bg-muted/30 border-border/50">
                        <SelectValue placeholder="Chọn Ad" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả Ads</SelectItem>
                        {ads?.map((ad) => (
                            <SelectItem key={ad.id} value={ad.id} title={ad.name || ad.id}>
                                <span className="block max-w-[180px] truncate">{ad.name || ad.id}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={handleSync} disabled={syncing}>
                    {syncing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Sync Insights
                </Button>
            </PageHeader>

            {/* Filter Card */}
            <FloatingCard>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="space-y-2">
                        <Label htmlFor="dateStart" className="text-xs text-muted-foreground">Từ ngày</Label>
                        <Input
                            id="dateStart"
                            type="date"
                            value={dateStart}
                            onChange={(e) => setDateStart(e.target.value)}
                            className="w-40 bg-muted/30 border-border/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dateEnd" className="text-xs text-muted-foreground">Đến ngày</Label>
                        <Input
                            id="dateEnd"
                            type="date"
                            value={dateEnd}
                            onChange={(e) => setDateEnd(e.target.value)}
                            className="w-40 bg-muted/30 border-border/50"
                        />
                    </div>
                    <Button onClick={() => refetch()} variant="outline" className="bg-muted/30 border-border/50">
                        Tìm kiếm
                    </Button>
                </div>
            </FloatingCard>

            {/* Table */}
            <FloatingCard padding="none">
                <FloatingCardHeader className="p-4">
                    <FloatingCardTitle>Kết quả ({filteredData?.length || 0})</FloatingCardTitle>
                </FloatingCardHeader>
                <FloatingCardContent className="p-0">
                    {isLoading ? (
                        <LoadingState text="Đang tải dữ liệu..." />
                    ) : data?.length === 0 ? (
                        <EmptyState
                            icon={<BarChart3 className="h-8 w-8" />}
                            title="Không có dữ liệu"
                            description="Chọn khoảng thời gian và sync insights"
                            className="py-12"
                        />
                    ) : (
                        <div className="overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border/30 hover:bg-transparent">
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Ngày</TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Ad ID</TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Impressions</TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Reach</TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Clicks</TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Spend</TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData?.map((insight, idx) => (
                                        <TableRow key={idx} className="border-border/30 hover:bg-muted/30 transition-colors">
                                            <TableCell>
                                                <PlatformIcon platformCode={(insight as any).ad?.account?.platform?.code || 'facebook'} />
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(insight.date).toLocaleDateString('vi-VN')}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{insight.adId}</TableCell>
                                            <TableCell className="text-right font-medium">{insight.impressions || '0'}</TableCell>
                                            <TableCell className="text-right font-medium">{insight.reach || '0'}</TableCell>
                                            <TableCell className="text-right font-medium">{insight.clicks || '0'}</TableCell>
                                            <TableCell className="text-right font-medium">{insight.spend || '0'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => setDetailAd({ id: insight.adId, name: insight.ad?.name || undefined })}
                                                >
                                                    <BarChart3 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </FloatingCardContent>
            </FloatingCard>

            {/* Ad Detail Modal */}
            <AdAnalyticsDetail
                adId={detailAd?.id || null}
                adName={detailAd?.name}
                dateStart={dateStart}
                dateEnd={dateEnd}
                onClose={() => setDetailAd(null)}
            />
        </div>
    );
}
