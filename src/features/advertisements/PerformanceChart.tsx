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
import type { DailyInsight, HourlyInsight } from './adDetail.api';
import { useAdHourly } from './useAdDetail';
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

        {/* Impressions & Reach */}
        <div className="rounded-lg bg-muted/10 border border-border/30 p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Impressions & Reach</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#888' }} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={formatNumber} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                formatter={(value: number | undefined, name?: string) => [formatNumber(value), name === 'impressions' ? 'Impressions' : 'Reach']}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="impressions" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} name="Impressions" />
              <Line type="monotone" dataKey="reach" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} name="Reach" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Clicks & CTR */}
        <div className="rounded-lg bg-muted/10 border border-border/30 p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Clicks & CTR</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#888' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#888' }} tickFormatter={formatNumber} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(v) => `${v.toFixed(1)}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                formatter={(value: number | undefined, name?: string) => {
                  if (name === 'ctr') return [`${(value ?? 0).toFixed(2)}%`, 'CTR'];
                  return [formatNumber(value), 'Clicks'];
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} name="Clicks" />
              <Line yAxisId="right" type="monotone" dataKey="ctr" stroke="#ec4899" strokeWidth={2} dot={{ r: 2 }} name="CTR" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
