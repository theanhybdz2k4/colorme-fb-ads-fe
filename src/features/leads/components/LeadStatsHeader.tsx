
import { useLeads } from '../context/LeadContext';
import { StatsGrid, StatsCard } from '@/components/shared/common/StatsCard';
import {
    Users,
    Target,
    MessageSquare,
    DollarSign
} from 'lucide-react';

export function LeadStatsHeader() {
    const { stats } = useLeads();

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return (val / 1000000).toFixed(2) + 'tr';
        if (val >= 1000) return (val / 1000).toFixed(2) + 'k';
        return val.toString();
    };

    return (
        <div className="space-y-6 shrink-0 z-20">
            <StatsGrid columns={5}>
                <StatsCard
                    title="CHI PHÍ QUẢNG CÁO"
                    value={`${formatCurrency(stats?.spendTotal || 0)}`}
                    subtitle={`Trung bình ${formatCurrency(stats?.avgDailySpend || 0)} mỗi ngày • Đã bao gồm 10% thuế`}
                    icon={<DollarSign className="h-4 w-4" />}
                    className="bg-emerald-500/5 border-emerald-500/10"
                />
                <StatsCard
                    title="ADS HÔM NAY"
                    value={`${formatCurrency(stats?.spendTodayRaw || 0)}`}
                    subtitle={stats?.yesterdaySpend > 0 ? `${(((stats.spendToday - stats.yesterdaySpend) / stats.yesterdaySpend) * 100).toFixed(2)}% so với hôm qua` : 'Không bao gồm 10% thuế'}
                    trend={stats?.yesterdaySpend > 0 ? { value: Math.round(((stats.spendToday - stats.yesterdaySpend) / stats.yesterdaySpend) * 100) } : undefined}
                    icon={<MessageSquare className="h-4 w-4" />}
                    className="bg-blue-500/5 border-blue-500/10"
                />
                <StatsCard
                    title="ADS/REVENUE"
                    value={`${(stats?.roas * 100 || 0).toFixed(2)}%`}
                    subtitle={`ROAS ${stats?.roas || 0}`}
                    icon={<Target className="h-4 w-4" />}
                    className="bg-amber-500/5 border-amber-500/10"
                />
                <StatsCard
                    title="QUALIFIED LEAD ADS"
                    value={`${stats?.messagingNewFromAds ?? stats?.todayQualified ?? 0}`}
                    subtitle={`${stats?.potentialFromAds || 0}/${stats?.messagingNewFromAds ?? stats?.todayQualified ?? 0} tiềm năng • Dữ liệu Ads Insights`}
                    icon={<Users className="h-4 w-4" />}
                    className="bg-rose-500/5 border-rose-500/10"
                />
                <StatsCard
                    title="QUALIFIED LEAD Organic"
                    value={`${stats?.todayNewOrganic || 0}`}
                    subtitle={`${stats?.potentialFromOrganic || 0}/${stats?.todayNewOrganic || 0} tiềm năng`}
                    icon={<Users className="h-4 w-4" />}
                    className="bg-green-500/5 border-green-500/10"
                />
            </StatsGrid>
        </div>
    );
}
