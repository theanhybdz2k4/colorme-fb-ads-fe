import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAdDetail, useAdAnalytics, useSyncAdInsights } from '@/hooks/useAdDetail';
import { PerformanceChart } from '../components/PerformanceChart';
import type { DailyInsight, DeviceBreakdown, PlacementBreakdown, AgeGenderBreakdown } from '@/api/adDetail.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Image as ImageIcon, TrendingUp, Users, MousePointerClick, DollarSign, Target, Eye, RefreshCw } from 'lucide-react';
import { getVietnamDateString } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  FloatingCard,
  FloatingCardHeader,
  FloatingCardTitle,
  FloatingCardContent,
  LoadingPage,
  EmptyState,
  StatsCard,
  StatsGrid,
} from '@/components/custom';

const formatCurrency = (value: number, currency = 'VND') => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(2)}%`;
};

export function AdDetailPage() {
  const queryClient = useQueryClient();
  const { adId } = useParams<{ adId: string }>();
  const navigate = useNavigate();
  const [syncingSection, setSyncingSection] = useState<string | null>(null);

  const { data: ad, isLoading: isLoadingAd } = useAdDetail(adId || '');
  const { data: analytics, isLoading: isLoadingAnalytics, refetch: refetchAnalytics } = useAdAnalytics(adId || '');
  const syncInsightsMutation = useSyncAdInsights(adId || '');

  // Tính toán 7 ngày từ hôm nay
  const getDateRange7Days = () => {
    const today = getVietnamDateString();
    const [year, month, day] = today.split('-').map(Number);
    const startDate = new Date(year, month - 1, day);
    startDate.setDate(startDate.getDate() - 6); // 7 ngày bao gồm cả hôm nay
    const dateStart = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    return { dateStart, dateEnd: today };
  };

  const handleSync = async (section: string) => {
    if (!adId) return;

    setSyncingSection(section);
    try {
      const { dateStart, dateEnd } = getDateRange7Days();
      // Luôn sync tất cả insights (bao gồm hourly và các breakdowns khác) trong 7 ngày
      const result = await syncInsightsMutation.mutateAsync({ dateStart, dateEnd, breakdown: 'all' });

      toast.success('Sync insights thành công!', {
        description: `Đã sync ${result || 0} insights từ ${dateStart} đến ${dateEnd}`,
      });

      // Re-trigger analytics fetch
      await refetchAnalytics();

      // Specifically invalidate by adId to be safe
      queryClient.invalidateQueries({ queryKey: ['ad-analytics', adId] });
      queryClient.invalidateQueries({ queryKey: ['ad-hourly', adId] });
    } catch (error: any) {
      console.error('Sync failed:', error);
      toast.error('Sync insights thất bại', {
        description: error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi sync insights',
      });
    } finally {
      setSyncingSection(null);
    }
  };

  if (isLoadingAd || isLoadingAnalytics) {
    return <LoadingPage />;
  }

  if (!ad) {
    return (
      <EmptyState
        icon={<ImageIcon className="h-12 w-12" />}
        title="Không tìm thấy Ad"
        description="Ad này không tồn tại hoặc bạn không có quyền truy cập"
      />
    );
  }

  const currency = ad.account?.currency || 'VND';
  const summary = analytics?.summary;

  const getStatusVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
    if (!status) return 'secondary';
    if (status === 'ACTIVE') return 'default';
    if (status === 'PAUSED') return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/ads')}
          className="shrink-0 mt-1"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-4 flex-1">
          {/* Thumbnail */}
          <div className="w-24 h-24 rounded-lg bg-muted/30 overflow-hidden shrink-0 border border-border/30">
            {ad.thumbnailUrl ? (
              <img
                src={ad.thumbnailUrl}
                alt={ad.name || 'Ad preview'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 opacity-30" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{ad.name || 'Untitled Ad'}</h1>
              <Badge variant={getStatusVariant(ad.effectiveStatus)}>
                {ad.effectiveStatus || ad.status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><span className="opacity-60">ID:</span> <span className="font-mono">{ad.id}</span></p>
              <p><span className="opacity-60">Campaign:</span> {ad.campaign?.name || '-'}</p>
              <p><span className="opacity-60">Ad Set:</span> {ad.adset?.name || '-'}</p>
            </div>
          </div>

          {/* Sync Button */}
          <div className="shrink-0">
            <Button
              variant="default"
              size="default"
              onClick={() => handleSync('header')}
              disabled={syncingSection === 'header'}
              className="h-10"
            >
              {syncingSection === 'header' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Đang sync...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Insights
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (() => {
        // Helper to convert growth value to trend prop
        const toTrend = (value: number | null | undefined) =>
          value != null ? { value: Math.round(value * 10) / 10 } : undefined;

        return (
          <StatsGrid>
            <StatsCard
              title="Tổng chi tiêu"
              value={formatCurrency(summary.totalSpend, currency)}
              icon={<DollarSign className="h-4 w-4" />}
              trend={toTrend(summary.growth?.spend)}
            />
            <StatsCard
              title="Impressions"
              value={formatNumber(summary.totalImpressions)}
              icon={<Eye className="h-4 w-4" />}
              trend={toTrend(summary.growth?.impressions)}
            />
            <StatsCard
              title="Reach"
              value={formatNumber(summary.totalReach)}
              icon={<Users className="h-4 w-4" />}
              trend={toTrend(summary.growth?.reach)}
            />
            <StatsCard
              title="Clicks"
              value={formatNumber(summary.totalClicks)}
              icon={<MousePointerClick className="h-4 w-4" />}
              trend={toTrend(summary.growth?.clicks)}
            />
            <StatsCard
              title="CTR"
              value={formatPercent(summary.avgCtr)}
              icon={<TrendingUp className="h-4 w-4" />}
              trend={toTrend(summary.growth?.ctr)}
            />
            <StatsCard
              title="CPC"
              value={formatCurrency(summary.avgCpc, currency)}
              icon={<DollarSign className="h-4 w-4" />}
              trend={toTrend(summary.growth?.cpc)}
            />
            <StatsCard
              title="CPM"
              value={formatCurrency(summary.avgCpm, currency)}
              icon={<DollarSign className="h-4 w-4" />}
              trend={toTrend(summary.growth?.cpm)}
            />
            <StatsCard
              title="Results"
              value={formatNumber(summary.totalResults)}
              icon={<Target className="h-4 w-4" />}
              trend={toTrend(summary.growth?.results)}
            />
            <StatsCard
              title="CPR"
              value={formatCurrency(summary.avgCpr, currency)}
              icon={<DollarSign className="h-4 w-4" />}
              trend={toTrend(summary.growth?.cpr)}
            />
            <StatsCard
              title="Messages"
              value={formatNumber(summary.totalMessages)}
              icon={<Target className="h-4 w-4" />}
              trend={toTrend(summary.growth?.messages)}
            />
            <StatsCard
              title="Cost/Message"
              value={formatCurrency(summary.avgCostPerMessage, currency)}
              icon={<DollarSign className="h-4 w-4" />}
              trend={toTrend(summary.growth?.costPerMessage)}
            />
          </StatsGrid>
        );
      })()}

      {/* Performance Charts */}
      {analytics?.dailyInsights && analytics.dailyInsights.length > 0 && (
        <FloatingCard>
          <FloatingCardHeader>
            <div className="flex items-center justify-between w-full">
              <FloatingCardTitle>Biểu đồ tăng trưởng</FloatingCardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync('chart')}
                disabled={syncingSection === 'chart'}
                className="h-8"
              >
                {syncingSection === 'chart' ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                    Đang sync...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Sync
                  </>
                )}
              </Button>
            </div>
          </FloatingCardHeader>
          <FloatingCardContent>
            <PerformanceChart adId={ad.id} dailyData={analytics.dailyInsights} currency={currency} />
          </FloatingCardContent>
        </FloatingCard>
      )}

      {/* Daily Insights */}
      {analytics?.dailyInsights && analytics.dailyInsights.length > 0 && (
        <FloatingCard>
          <FloatingCardHeader>
            <div className="flex items-center justify-between w-full">
              <FloatingCardTitle>Hiệu suất theo ngày</FloatingCardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync('daily')}
                disabled={syncingSection === 'daily'}
                className="h-8"
              >
                {syncingSection === 'daily' ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                    Đang sync...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Sync
                  </>
                )}
              </Button>
            </div>
          </FloatingCardHeader>
          <FloatingCardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Ngày</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Chi tiêu</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Impressions</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Clicks</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">CTR</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Results</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">CPR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.dailyInsights.map((day: DailyInsight) => (
                    <TableRow key={day.date} className="border-border/30 hover:bg-muted/30">
                      <TableCell>{new Date(day.date).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(day.spend, currency)}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(day.impressions)}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(day.clicks)}</TableCell>
                      <TableCell className="text-right font-mono">{formatPercent(day.ctr)}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(day.results)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(day.costPerResult, currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </FloatingCardContent>
        </FloatingCard>
      )}

      {/* Breakdowns Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Device Breakdown */}
        {analytics?.deviceBreakdown && analytics.deviceBreakdown.length > 0 && (
          <FloatingCard>
            <FloatingCardHeader>
              <div className="flex items-center justify-between w-full">
                <FloatingCardTitle>Theo thiết bị</FloatingCardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSync('device')}
                  disabled={syncingSection === 'device'}
                  className="h-8"
                >
                  {syncingSection === 'device' ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                      Đang sync...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Sync
                    </>
                  )}
                </Button>
              </div>
            </FloatingCardHeader>
            <FloatingCardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-xs">Thiết bị</TableHead>
                    <TableHead className="text-xs text-right">Chi tiêu</TableHead>
                    <TableHead className="text-xs text-right">Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.deviceBreakdown.map((d: DeviceBreakdown) => (
                    <TableRow key={d.device} className="border-border/30">
                      <TableCell className="capitalize">{d.device}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(d.spend, currency)}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(d.clicks)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </FloatingCardContent>
          </FloatingCard>
        )}

        {/* Placement Breakdown */}
        {analytics?.placementBreakdown && analytics.placementBreakdown.length > 0 && (
          <FloatingCard>
            <FloatingCardHeader>
              <div className="flex items-center justify-between w-full">
                <FloatingCardTitle>Theo vị trí đặt</FloatingCardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSync('placement')}
                  disabled={syncingSection === 'placement'}
                  className="h-8"
                >
                  {syncingSection === 'placement' ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                      Đang sync...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Sync
                    </>
                  )}
                </Button>
              </div>
            </FloatingCardHeader>
            <FloatingCardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-xs">Platform</TableHead>
                    <TableHead className="text-xs">Position</TableHead>
                    <TableHead className="text-xs text-right">Chi tiêu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.placementBreakdown.map((p: PlacementBreakdown, i: number) => (
                    <TableRow key={i} className="border-border/30">
                      <TableCell className="capitalize">{p.platform}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.position}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(p.spend, currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </FloatingCardContent>
          </FloatingCard>
        )}
      </div>

      {/* Age/Gender Breakdown */}
      {analytics?.ageGenderBreakdown && analytics.ageGenderBreakdown.length > 0 && (
        <FloatingCard>
          <FloatingCardHeader>
            <div className="flex items-center justify-between w-full">
              <FloatingCardTitle>Theo độ tuổi & giới tính</FloatingCardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync('age_gender')}
                disabled={syncingSection === 'age_gender'}
                className="h-8"
              >
                {syncingSection === 'age_gender' ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                    Đang sync...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Sync
                  </>
                )}
              </Button>
            </div>
          </FloatingCardHeader>
          <FloatingCardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-xs">Độ tuổi</TableHead>
                    <TableHead className="text-xs">Giới tính</TableHead>
                    <TableHead className="text-xs text-right">Chi tiêu</TableHead>
                    <TableHead className="text-xs text-right">Impressions</TableHead>
                    <TableHead className="text-xs text-right">Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.ageGenderBreakdown.map((a: AgeGenderBreakdown, i: number) => (
                    <TableRow key={i} className="border-border/30">
                      <TableCell>{a.age}</TableCell>
                      <TableCell className="capitalize">{a.gender}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(a.spend, currency)}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(a.impressions)}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(a.clicks)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </FloatingCardContent>
        </FloatingCard>
      )}

      {/* Empty state for no analytics */}
      {(!analytics?.dailyInsights || analytics.dailyInsights.length === 0) && (
        <EmptyState
          icon={<TrendingUp className="h-12 w-12" />}
          title="Chưa có dữ liệu insights"
          description="Sync insights cho ad này để xem phân tích chi tiết"
          action={{
            label: syncingSection === 'empty' ? 'Đang sync...' : 'Sync Insights',
            onClick: () => handleSync('empty'),
            disabled: syncingSection === 'empty',
            icon: syncingSection === 'empty' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            ),
          }}
        />
      )}
    </div>
  );
}
