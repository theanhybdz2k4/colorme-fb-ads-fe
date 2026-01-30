
import { useLeads } from '../context/LeadContext';
import { StatsGrid, StatsCard } from '@/components/custom/StatsCard';
import {
    Users,
    Target,
    MessageSquare,
    DollarSign
} from 'lucide-react';

export function LeadStatsHeader() {
    const { stats } = useLeads();

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'tr';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
        return val.toString();
    };

    return (
        <div className="space-y-6 shrink-0 z-20">
            <StatsGrid columns={4}>
                <StatsCard
                    title="ADS SPENT"
                    value={`${formatCurrency(stats?.spendTotal || 0)}`}
                    subtitle={`Trung bình ${formatCurrency(stats?.avgDailySpend || 0)} mỗi ngày`}
                    icon={<DollarSign className="h-4 w-4" />}
                    className="bg-emerald-500/5 border-emerald-500/10"
                />
                <StatsCard
                    title="ADS HÔM NAY"
                    value={`${formatCurrency(stats?.spendToday || 0)}`}
                    subtitle={stats?.yesterdaySpend > 0 ? `${(((stats.spendToday - stats.yesterdaySpend) / stats.yesterdaySpend) * 100).toFixed(0)}% so với hôm qua` : 'Mới'}
                    trend={stats?.yesterdaySpend > 0 ? { value: Math.round(((stats.spendToday - stats.yesterdaySpend) / stats.yesterdaySpend) * 100) } : undefined}
                    icon={<MessageSquare className="h-4 w-4" />}
                    className="bg-blue-500/5 border-blue-500/10"
                />
                <StatsCard
                    title="ADS/REVENUE"
                    value={`${(stats?.roas * 100 || 0).toFixed(0)}%`}
                    subtitle={`ROAS ${stats?.roas || 0}`}
                    icon={<Target className="h-4 w-4" />}
                    className="bg-amber-500/5 border-amber-500/10"
                />
                <StatsCard
                    title="QUALIFIED LEAD HÔM NAY"
                    value={`${stats?.todayQualified || 0}/${stats?.todayLeads || 0}`}
                    subtitle="Ok/Lead"
                    icon={<Users className="h-4 w-4" />}
                    className="bg-rose-500/5 border-rose-500/10"
                />
            </StatsGrid>
        </div>
    );
}
