export { BranchAnalytics } from './sections/BranchAnalytics';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInsights } from '@/hooks/useInsights';
import { useAds } from '@/features/advertisements';
import { BranchFilter, syncApi } from '@/features/adAccounts';
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
import {
    PageHeader,
    FloatingCard,
    FloatingCardHeader,
    FloatingCardTitle,
    FloatingCardContent,
    LoadingState,
    EmptyState,
} from '@/components/custom';
import { getVietnamDateString, getVietnamYesterdayString } from '@/lib/utils';

export function InsightsPage() {
    const queryClient = useQueryClient();
    const [selectedAd, setSelectedAd] = useState<string>('all');
    const [selectedBranch, setSelectedBranch] = useState<string>('all');
    const [syncing, setSyncing] = useState(false);
    
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

    const handleSync = async () => {
        setSyncing(true);
        try {
            // If specific ad selected, sync just that ad
            if (selectedAd !== 'all') {
                await syncApi.insightsByAd(selectedAd, dateStart, dateEnd, 'all');
                toast.success('Đã bắt đầu sync Insights', {
                    description: `Ad: ${selectedAd}`,
                });
            } else {
                // Sync insights for TODAY only:
                await Promise.all([
                    syncApi.fullSync(1),      // Daily insights (hôm nay)
                    syncApi.syncHourlyToday() // Hourly insights (hôm nay)
                ]);
                toast.success('Đã bắt đầu sync Insights', {
                    description: 'Đang sync: Daily + Hourly (hôm nay)',
                });
            }
            
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
        <div className="space-y-6 animate-float-up">
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
                    <FloatingCardTitle>Kết quả ({data?.length || 0})</FloatingCardTitle>
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
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Ngày</TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Ad ID</TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Impressions</TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Reach</TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Clicks</TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Spend</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.map((insight, idx) => (
                                        <TableRow key={idx} className="border-border/30 hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-muted-foreground">
                                                {new Date(insight.date).toLocaleDateString('vi-VN')}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{insight.adId}</TableCell>
                                            <TableCell className="text-right font-medium">{insight.impressions || '0'}</TableCell>
                                            <TableCell className="text-right font-medium">{insight.reach || '0'}</TableCell>
                                            <TableCell className="text-right font-medium">{insight.clicks || '0'}</TableCell>
                                            <TableCell className="text-right font-medium">{insight.spend || '0'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </FloatingCardContent>
            </FloatingCard>
        </div>
    );
}
