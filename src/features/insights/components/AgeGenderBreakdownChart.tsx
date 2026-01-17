
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { FloatingCard, FloatingCardContent, FloatingCardHeader, FloatingCardTitle } from '@/components/custom';
import { Users } from 'lucide-react';

interface AgeGenderStats {
    age: string;
    gender: string;
    spend: number;
    impressions: number;
    clicks: number;
    results: number;
}

interface Props {
    data: AgeGenderStats[];
    loading?: boolean;
}

const GENDER_COLORS: Record<string, string> = {
    male: '#3b82f6',   // Blue
    female: '#ec4899', // Pink
    unknown: '#94a3b8' // Gray
};

export function AgeGenderBreakdownChart({ data, loading }: Props) {
    if (loading) {
        return (
            <FloatingCard className="animate-pulse">
                <div className="h-64 bg-slate-800/50 rounded-lg" />
            </FloatingCard>
        );
    }

    // Process data for chart: Group by Age, with Male/Female as keys
    const chartData = Object.values(data.reduce((acc, curr) => {
        const age = curr.age;
        if (!acc[age]) {
            acc[age] = { age, male: 0, female: 0, unknown: 0 };
        }
        const genderKey = curr.gender.toLowerCase() as 'male' | 'female' | 'unknown';
        if (genderKey in acc[age]) {
            acc[age][genderKey] += curr.spend;
        } else {
            acc[age].unknown += curr.spend;
        }
        return acc;
    }, {} as Record<string, any>)).sort((a, b) => a.age.localeCompare(b.age));

    const formatMoney = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
                    <p className="font-bold text-slate-200 mb-2">Độ tuổi: {label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-slate-300 capitalize">{entry.name === 'male' ? 'Nam' : entry.name === 'female' ? 'Nữ' : 'Khác'}:</span>
                            <span className="font-mono text-slate-100">{formatMoney(entry.value)}</span>
                        </div>
                    ))}
                    <div className="mt-2 pt-2 border-t border-slate-700 font-bold text-slate-200">
                        Tổng: {formatMoney(payload.reduce((sum: number, p: any) => sum + p.value, 0))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <FloatingCard padding="none">
            <FloatingCardHeader className="p-4 border-b border-border/30">
                <FloatingCardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-pink-400" />
                    Phân bổ theo Độ tuổi & Giới tính (Chi phí)
                </FloatingCardTitle>
            </FloatingCardHeader>
            <FloatingCardContent className="p-4 h-[350px]">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="age" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000000}M`} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                            <Legend formatter={(val) => val === 'male' ? 'Nam' : val === 'female' ? 'Nữ' : 'Khác'} />
                            <Bar dataKey="male" name="male" stackId="a" fill={GENDER_COLORS.male} radius={[0, 0, 4, 4]} />
                            <Bar dataKey="female" name="female" stackId="a" fill={GENDER_COLORS.female} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="unknown" name="unknown" stackId="a" fill={GENDER_COLORS.unknown} />
                        </BarChart>
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
