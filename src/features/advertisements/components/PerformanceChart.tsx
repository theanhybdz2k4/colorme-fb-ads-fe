import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import type { DailyInsight, HourlyInsight } from '@/api/adDetail.api';
import { useAdHourly } from '@/hooks/useAdDetail';
import { Button } from '@/components/ui/button';
import { getVietnamDateString, getVietnamYesterdayString } from '@/lib/utils';

interface PerformanceChartProps {
  adId: string;
  dailyData: DailyInsight[];
  currency?: string;
}

type TimeRange = '3d' | '7d' | 'today' | 'yesterday';

const formatCurrency = (value: number | undefined) => {
  if (value === undefined) return '';
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toFixed(0);
};

const formatNumber = (value: number | undefined) => {
  if (value === undefined) return '';
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

const getDateForRange = (range: TimeRange): { isHourly: boolean; date?: string; days?: number } => {
  switch (range) {
    case 'today':
      // Always use Vietnam timezone (GMT+7) for today
      return { isHourly: true, date: getVietnamDateString() };
    case 'yesterday':
      // Always use Vietnam timezone (GMT+7) for yesterday
      return { isHourly: true, date: getVietnamYesterdayString() };
    case '3d':
      return { isHourly: false, days: 3 };
    case '7d':
      return { isHourly: false, days: 7 };
    default:
      return { isHourly: false, days: 7 };
  }
};

export function PerformanceChart({ adId, dailyData, currency = 'VND' }: PerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');

  const rangeConfig = getDateForRange(timeRange);

  // Fetch hourly data when needed
  const hourlyDate = rangeConfig.isHourly ? rangeConfig.date : undefined;
  const { data: hourlyData } = useAdHourly(adId, hourlyDate);

  // Process chart data based on time range
  const chartData = useMemo(() => {
    if (rangeConfig.isHourly) {
      // Hourly view - always show 24 hour slots
      const hourlyMap = new Map<number, HourlyInsight>();
      if (hourlyData) {
        for (const h of hourlyData as HourlyInsight[]) {
          hourlyMap.set(h.hour, h);
        }
      }

      // Generate 24 hour slots
      return Array.from({ length: 24 }, (_, hour) => {
        const data = hourlyMap.get(hour);
        return {
          label: `${hour}:00`,
          spend: data?.spend ?? null,
          impressions: data?.impressions ?? null,
          clicks: data?.clicks ?? null,
          reach: data?.reach ?? null,
          ctr: data?.ctr ?? null,
          results: data?.results ?? null,
          messagingStarted: data?.messagingStarted ?? null,
          costPerResult: data?.costPerResult ?? null,
          costPerMessaging: data?.costPerMessaging ?? null,
        };
      });
    } else {
      // Daily view with filter
      const days = rangeConfig.days || 7;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return dailyData
        .filter((d) => new Date(d.date) >= cutoffDate)
        .map((d) => ({
          label: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          spend: d.spend,
          impressions: d.impressions,
          clicks: d.clicks,
          reach: d.reach,
          ctr: d.ctr,
          results: d.results,
          messagingStarted: d.messagingStarted,
          costPerResult: d.costPerResult,
          costPerMessaging: d.costPerMessaging,
        }));
    }
  }, [rangeConfig, hourlyData, dailyData]);

  if (!dailyData.length && !hourlyData) return null;

  const timeRangeButtons: { value: TimeRange; label: string }[] = [
    { value: '3d', label: '3 ngày' },
    { value: '7d', label: '7 ngày' },
    { value: 'today', label: 'Hôm nay (giờ)' },
    { value: 'yesterday', label: 'Hôm qua (giờ)' },
  ];

  return (
    <div className="space-y-4">
      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-2">
        {timeRangeButtons.map((btn) => (
          <Button
            key={btn.value}
            variant={timeRange === btn.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(btn.value)}
            className="text-xs"
          >
            {btn.label}
          </Button>
        ))}
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Spend Chart */}
        <div className="rounded-lg bg-muted/10 border border-border/30 p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Chi tiêu {rangeConfig.isHourly ? 'theo giờ' : 'theo ngày'}
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#888' }} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={formatCurrency} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                formatter={(value: number | undefined) => [`${formatCurrency(value)} ${currency}`, 'Chi tiêu']}
              />
              <Area type="monotone" dataKey="spend" stroke="#3b82f6" fillOpacity={1} fill="url(#spendGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Result & New Message */}
        <div className="rounded-lg bg-muted/10 border border-border/30 p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Result & New Message</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#888' }} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={formatNumber} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                formatter={(value: number | undefined, name?: string) => [formatNumber(value), name === 'results' ? 'Result' : 'New Message']}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="results" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} name="Result" />
              <Line type="monotone" dataKey="messagingStarted" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} name="New Message" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cost per Result & Cost per New Message */}
        <div className="rounded-lg bg-muted/10 border border-border/30 p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Cost per Result & Cost per New Message</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#888' }} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={formatCurrency} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                formatter={(value: number | undefined, name?: string) => {
                  return [`${formatCurrency(value)} ${currency}`, name === 'costPerResult' ? 'Cost per Result' : 'Cost per New Message'];
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="costPerResult" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} name="Cost per Result" />
              <Line type="monotone" dataKey="costPerMessaging" stroke="#ec4899" strokeWidth={2} dot={{ r: 2 }} name="Cost per New Message" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
