
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { ChartContainer } from '@/components/shared/common';
import { formatCurrency, formatNumber } from '@/lib/format';

interface DeviceStats {
    device: string;
    spend: number;
    impressions: number;
    clicks: number;
    results: number;
    [key: string]: any;
}

interface Props {
    data: DeviceStats[];
    loading?: boolean;
}

const COLORS = ['var(--primary-01)', 'var(--primary-02)', 'var(--primary-03)', 'var(--chart-blue)', 'var(--t-tertiary)'];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight="bold">
            {`${(percent * 100).toFixed(1)}%`}
        </text>
    ) : null;
};

export function DeviceBreakdownChart({ data, loading }: Props) {
    if (loading) {
        return (
            <div className="card animate-pulse">
                <div className="h-64 bg-b-surface2 rounded-xl" />
            </div>
        );
    }

    // Sort by spend
    const chartData = [...data].sort((a, b) => b.spend - a.spend);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const entry = payload[0].payload;
            return (
                <div className="bg-b-surface2/90 backdrop-blur-md border border-s-border p-4 rounded-2xl shadow-2xl min-w-[180px]">
                    <div className="text-[11px] font-bold text-t-tertiary uppercase tracking-widest mb-3 border-b border-s-border pb-2">
                        {entry.device}
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-t-secondary">Chi phí:</span>
                            <span className="font-bold text-primary-01 font-mono">{formatCurrency(entry.spend)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-t-secondary">Impressions:</span>
                            <span className="font-bold text-t-primary font-mono">{formatNumber(entry.impressions ?? 0)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-t-secondary">Clicks:</span>
                            <span className="font-bold text-t-primary font-mono">{formatNumber(entry.clicks ?? 0)}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <ChartContainer
            title="Thiết bị"
            subtitle="Phân bổ chi phí theo thiết bị"
            icon="desktop"
            height={350}
        >
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={120}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="spend"
                            nameKey="device"
                            strokeWidth={2}
                            stroke="var(--b-surface1)"
                        >
                            {chartData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-t-tertiary text-sm">
                    Chưa có dữ liệu phân tích
                </div>
            )}
        </ChartContainer>
    );
}
