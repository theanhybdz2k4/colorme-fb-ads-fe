
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
import { ChartContainer, ChartTooltip } from '@/components/shared/common';
import { formatCurrency } from '@/lib/format';

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
    male: 'var(--primary-01)',
    female: 'var(--primary-02)',
    unknown: 'var(--t-tertiary)'
};

export function AgeGenderBreakdownChart({ data, loading }: Props) {
    if (loading) {
        return (
            <div className="card animate-pulse">
                <div className="h-64 bg-b-surface2 rounded-xl" />
            </div>
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

    return (
        <ChartContainer
            title="Độ tuổi & Giới tính"
            subtitle="Phân bổ chi phí theo nhân khẩu học"
            icon="profile"
            height={350}
        >
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--s-border)" vertical={false} />
                        <XAxis
                            dataKey="age"
                            stroke="var(--t-tertiary)"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            fontWeight={600}
                        />
                        <YAxis
                            stroke="var(--t-tertiary)"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                            fontWeight={600}
                        />
                        <Tooltip
                            content={<ChartTooltip formatter={(val: number) => formatCurrency(val)} />}
                            cursor={{ fill: 'var(--b-surface2)', opacity: 0.5 }}
                        />
                        <Legend
                            formatter={(val) => val === 'male' ? 'Nam' : val === 'female' ? 'Nữ' : 'Khác'}
                            wrapperStyle={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        />
                        <Bar dataKey="male" name="male" stackId="a" fill={GENDER_COLORS.male} radius={[0, 0, 4, 4]} />
                        <Bar dataKey="female" name="female" stackId="a" fill={GENDER_COLORS.female} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="unknown" name="unknown" stackId="a" fill={GENDER_COLORS.unknown} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-t-tertiary text-sm">
                    Chưa có dữ liệu phân tích
                </div>
            )}
        </ChartContainer>
    );
}
