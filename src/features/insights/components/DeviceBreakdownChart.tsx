
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { FloatingCard, FloatingCardContent, FloatingCardHeader, FloatingCardTitle } from '@/components/custom';
import { Smartphone } from 'lucide-react';

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

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ef4444'];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    ) : null;
};

export function DeviceBreakdownChart({ data, loading }: Props) {
    if (loading) {
        return (
            <FloatingCard className="animate-pulse">
                <div className="h-64 bg-slate-800/50 rounded-lg" />
            </FloatingCard>
        );
    }

    // Sort by spend
    const chartData = [...data].sort((a, b) => b.spend - a.spend);

    const formatMoney = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const entry = payload[0].payload;
            return (
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
                    <p className="font-bold text-slate-200 mb-1">{entry.device}</p>
                    <p className="text-slate-300">Chi phí: <span className="text-indigo-400 font-mono">{formatMoney(entry.spend)}</span></p>
                    <p className="text-slate-300">Impressions: <span className="text-slate-200 font-mono">{entry.impressions.toLocaleString()}</span></p>
                    <p className="text-slate-300">Clicks: <span className="text-slate-200 font-mono">{entry.clicks.toLocaleString()}</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <FloatingCard padding="none">
            <FloatingCardHeader className="p-4 border-b border-border/30">
                <FloatingCardTitle className="text-sm font-medium flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-purple-400" />
                    Phân bổ theo Thiết bị (Chi phí)
                </FloatingCardTitle>
            </FloatingCardHeader>
            <FloatingCardContent className="p-4 h-[350px]">
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
                                fill="#8884d8"
                                dataKey="spend"
                                nameKey="device"
                            >
                                {chartData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                        Chưa có dữ liệu phân tích
                    </div>
                )}
            </FloatingCardContent>
        </FloatingCard>
    );
}
