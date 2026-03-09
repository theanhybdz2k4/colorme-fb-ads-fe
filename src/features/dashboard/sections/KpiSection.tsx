import * as React from 'react';
import { MetricItem, MetricGrid } from '@/components/shared/common';
import { useDashboard } from '../context/DashboardContext';
import { formatCurrency, formatNumber, formatPercent, formatCompactCurrency, formatCompactNumber } from '@/lib/format';
import { DateRangeSelector } from '../components/DateRangeSelector';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function KpiSection() {
    const { metrics, trends, insights, granularity } = useDashboard();
    const [activeTab, setActiveTab] = React.useState(0);

    // Group insights by date/hour for the chart
    const chartData = React.useMemo(() => {
        const TAX_MULTIPLIER = 1.1;
        const grouped = (insights || []).reduce((acc: any, item: any) => {
            // Use date + hour if in hourly mode, otherwise just date
            const key = granularity === 'HOURLY' && item.hour !== undefined ? `${item.date} ${item.hour}:00` : item.date;

            if (!acc[key]) {
                acc[key] = {
                    key,
                    date: item.date,
                    hour: item.hour,
                    spend: 0,
                    leads: 0,
                    clicks: 0,
                    impressions: 0
                };
            }
            acc[key].spend += (Number(item.spend || 0) * TAX_MULTIPLIER);
            acc[key].leads += Number(item.results || item.messagingStarted || 0);
            acc[key].clicks += Number(item.clicks || 0);
            acc[key].impressions += Number(item.impressions || 0);
            return acc;
        }, {});

        return Object.values(grouped).map((item: any) => ({
            ...item,
            cpl: item.leads > 0 ? item.spend / item.leads : 0
        })).sort((a: any, b: any) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return (a.hour || 0) - (b.hour || 0);
        });
    }, [insights, granularity]);

    const activeConfig = [
        { key: 'spend', color: '#00A656', formatter: formatCurrency, label: 'Chi tiêu' },
        { key: 'leads', color: '#FD7E14', formatter: formatNumber, label: 'Leads' },
        { key: 'cpl', color: '#7364DB', formatter: (v: any) => formatCurrency(v), label: 'CPL' },
        { key: 'clicks', color: '#2490FF', formatter: formatNumber, label: 'Clicks' },
    ][activeTab];

    return (
        <div className="card w-full">
            <div className="flex items-center h-12 pl-5 pr-5 max-lg:px-3 pt-5 pb-2">
                <div className="mr-auto text-h6 font-bold text-t-primary">Overview</div>
                <DateRangeSelector />
            </div>

            <div className="pt-3">
                <div className="pt-1">
                    <MetricGrid variant="grouped" className="overflow-x-auto flex-nowrap scrollbar-hide">
                        <MetricItem
                            variant="grouped-item"
                            title="Tổng chi tiêu"
                            value={formatCompactCurrency(metrics.totalSpend)}
                            isActive={activeTab === 0}
                            onClick={() => setActiveTab(0)}
                            trend={{ value: trends.spend }}
                            subtitle="đã bao gồm 10% thuế"
                        />
                        <MetricItem
                            variant="grouped-item"
                            title="Qualified Leads"
                            value={formatCompactNumber(metrics.totalLeads)}
                            icon="profile"
                            isActive={activeTab === 1}
                            onClick={() => setActiveTab(1)}
                            trend={{ value: trends.leads }}
                            subtitle="so với kỳ trước"
                        />
                        <MetricItem
                            variant="grouped-item"
                            title="Chi phí/Lead"
                            value={formatCompactCurrency(metrics.overallCPL)}
                            icon="chart"
                            isActive={activeTab === 2}
                            onClick={() => setActiveTab(2)}
                            trend={{ value: trends.cpl }}
                            subtitle="so với kỳ trước"
                        />
                        <MetricItem
                            variant="grouped-item"
                            title="Tổng Clicks"
                            value={formatCompactNumber(metrics.totalClicks)}
                            icon="mouse"
                            isActive={activeTab === 3}
                            onClick={() => setActiveTab(3)}
                            trend={{ value: trends.clicks }}
                            subtitle="so với kỳ trước"
                        />
                    </MetricGrid>

                    {/* Active Tab Content (Chart & Secondary Stats) */}
                    <div className="p-5 max-lg:px-3 max-lg:py-4">
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.15} />
                                            <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey={granularity === 'HOURLY' ? 'key' : 'date'}
                                        hide={false}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                                        tickFormatter={(val) => {
                                            if (granularity === 'HOURLY') {
                                                const parts = val.split(' ');
                                                return parts.length > 1 ? parts[1] : val;
                                            }
                                            const date = new Date(val);
                                            return `${date.getDate()}/${date.getMonth() + 1}`;
                                        }}
                                        minTickGap={granularity === 'HOURLY' ? 10 : 30}
                                    />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="var(--stroke-stroke2)" opacity={0.5} />
                                    <Tooltip
                                        content={(props: any) => {
                                            const { active, payload, label } = props;
                                            if (active && payload && payload.length) {
                                                const value = payload[0].value as number;
                                                const dataItem = payload[0].payload;

                                                let displayLabel = label;
                                                if (granularity === 'HOURLY') {
                                                    displayLabel = `Ngày ${dataItem.date} lúc ${dataItem.hour}:00`;
                                                } else {
                                                    const date = new Date(label);
                                                    displayLabel = `Ngày ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                                                }

                                                return (
                                                    <div className="bg-b-surface2/95 backdrop-blur-md border border-s-subtle p-3 rounded-2xl shadow-depth min-w-[120px]">
                                                        <div className="text-[10px] font-bold text-t-tertiary uppercase tracking-widest mb-2 pb-1 border-b border-s-subtle/50">
                                                            {displayLabel}
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[11px] font-bold text-t-secondary">{activeConfig.label}</span>
                                                            <span className="text-body-2 font-bold text-t-primary" style={{ color: activeConfig.color }}>
                                                                {activeConfig.formatter(value)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey={activeConfig.key}
                                        stroke={activeConfig.color}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorMetric)"
                                        activeDot={{ r: 6, fill: 'var(--b-surface2)', stroke: activeConfig.color, strokeWidth: 3 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Secondary Stats Group */}
                        <div className="mt-8 px-4 py-4 flex items-center justify-around rounded-[20px] bg-b-depth2/30">
                            <div className="flex flex-col items-center">
                                <div className="text-[10px] font-bold text-t-tertiary uppercase tracking-widest mb-1">Active Campaigns</div>
                                <div className="text-subtitle-1 font-bold text-t-primary text-[20px]">{metrics.activeCampaignsCount}</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-[10px] font-bold text-t-tertiary uppercase tracking-widest mb-1">Avg CTR</div>
                                <div className="text-subtitle-1 font-bold text-t-primary text-[20px]">{formatPercent(metrics.overallCTR)}</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-[10px] font-bold text-t-tertiary uppercase tracking-widest mb-1">Avg CPC</div>
                                <div className="text-subtitle-1 font-bold text-t-primary text-[20px]">
                                    {metrics.totalClicks > 0 ? formatCurrency(metrics.totalSpend / metrics.totalClicks) : '0 đ'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
