import { useState } from 'react';
import { useAdAnalytics, useAdHourly } from '@/hooks/useAdDetail';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, DollarSign, Eye, Target, Users, MousePointerClick } from 'lucide-react';
import { LoadingPage, EmptyState, StatsCard, StatsGrid } from '@/components/custom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

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

const formatPercent = (value: number | null | undefined) => {
  if (value == null || isNaN(value)) return '0.00%';
  return `${value.toFixed(2)}%`;
};

interface AdInsightsViewerProps {
  adId: string;
  currency?: string;
  dateStart?: string;
  dateEnd?: string;
  onRefresh?: () => void;
}

export function AdInsightsViewer({
  adId,
  currency = 'VND',
  dateStart,
  dateEnd,
  onRefresh,
}: AdInsightsViewerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedHourlyDate, setSelectedHourlyDate] = useState<string>('');

  const { data: analytics, isLoading: isLoadingAnalytics } = useAdAnalytics(adId, dateStart, dateEnd);
  const { data: hourlyData, isLoading: isLoadingHourly } = useAdHourly(adId, selectedHourlyDate);

  if (isLoadingAnalytics) {
    return <LoadingPage />;
  }

  if (!analytics) {
    return (
      <EmptyState
        icon={<TrendingUp className="h-12 w-12" />}
        title="Chưa có dữ liệu insights"
        description="Sync insights cho ad này để xem phân tích chi tiết"
        action={onRefresh ? {
          label: 'Refresh',
          onClick: onRefresh,
        } : undefined}
      />
    );
  }

  const summary = analytics.summary || {};

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quát</TabsTrigger>
          <TabsTrigger value="daily">Hàng ngày</TabsTrigger>
          <TabsTrigger value="hourly">Theo giờ</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Stats */}
          <StatsGrid>
            <StatsCard
              title="Chi tiêu"
              value={formatCurrency(summary.totalSpend, currency)}
              icon={<DollarSign className="h-4 w-4" />}
            />
            <StatsCard
              title="Impressions"
              value={formatNumber(summary.totalImpressions)}
              icon={<Eye className="h-4 w-4" />}
            />
            <StatsCard
              title="Reach"
              value={formatNumber(summary.totalReach)}
              icon={<Users className="h-4 w-4" />}
            />
            <StatsCard
              title="Clicks"
              value={formatNumber(summary.totalClicks)}
              icon={<MousePointerClick className="h-4 w-4" />}
            />
            <StatsCard
              title="CTR"
              value={formatPercent(summary.avgCtr)}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <StatsCard
              title="CPC"
              value={formatCurrency(summary.avgCpc, currency)}
              icon={<DollarSign className="h-4 w-4" />}
            />
            <StatsCard
              title="CPM"
              value={formatCurrency(summary.avgCpm, currency)}
              icon={<DollarSign className="h-4 w-4" />}
            />
            <StatsCard
              title="Results"
              value={formatNumber(summary.totalResults)}
              icon={<Target className="h-4 w-4" />}
            />
            <StatsCard
              title="CPR"
              value={formatCurrency(summary.avgCpr, currency)}
              icon={<DollarSign className="h-4 w-4" />}
            />
            <StatsCard
              title="Messages"
              value={formatNumber(summary.totalMessages)}
              icon={<Target className="h-4 w-4" />}
            />
            <StatsCard
              title="Cost/Message"
              value={formatCurrency(summary.avgCostPerMessage, currency)}
              icon={<DollarSign className="h-4 w-4" />}
            />
          </StatsGrid>
        </TabsContent>

        {/* Daily Tab */}
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Insights hàng ngày</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.dailyInsights && analytics.dailyInsights.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ngày</TableHead>
                        <TableHead className="text-right">Chi tiêu</TableHead>
                        <TableHead className="text-right">Impressions</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">CTR</TableHead>
                        <TableHead className="text-right">Results</TableHead>
                        <TableHead className="text-right">CPR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.dailyInsights.map((day: any) => (
                        <TableRow key={day.date}>
                          <TableCell>
                            {format(new Date(day.date), 'dd/MM/yyyy', { locale: vi })}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(day.spend, currency)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(day.impressions)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(day.clicks)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatPercent(day.ctr)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(day.results)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(day.costPerResult, currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Không có dữ liệu insights
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hourly Tab */}
        <TabsContent value="hourly" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Insights theo giờ</CardTitle>
                <input
                  type="date"
                  value={selectedHourlyDate}
                  onChange={(e) => setSelectedHourlyDate(e.target.value)}
                  className="px-3 py-1 border border-border rounded text-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {!selectedHourlyDate ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  Chọn ngày để xem insights theo giờ
                </div>
              ) : isLoadingHourly ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : hourlyData && hourlyData.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Giờ</TableHead>
                        <TableHead className="text-right">Chi tiêu</TableHead>
                        <TableHead className="text-right">Impressions</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">CTR</TableHead>
                        <TableHead className="text-right">Results</TableHead>
                        <TableHead className="text-right">CPR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hourlyData.map((hour: any) => (
                        <TableRow key={`${hour.dateStart}-${hour.hour}`}>
                          <TableCell className="font-mono">
                            {String(hour.hour).padStart(2, '0')}:00
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(hour.spend, currency)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(hour.impressions)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(hour.clicks)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatPercent(hour.ctr)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(hour.results)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(hour.costPerResult, currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Không có dữ liệu hourly insights cho ngày này
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
