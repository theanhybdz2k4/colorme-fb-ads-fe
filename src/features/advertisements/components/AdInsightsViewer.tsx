import { useAdAnalytics } from '@/hooks/useAdDetail';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp } from 'lucide-react';
import { LoadingPage, EmptyState } from '@/components/custom';
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
  const { data: analytics, isLoading: isLoadingAnalytics } = useAdAnalytics(adId, dateStart, dateEnd);

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

  return (
    <div className="space-y-6">
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
    </div>
  );
}
