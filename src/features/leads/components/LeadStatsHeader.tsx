
import { useLeads } from '../context/LeadContext';
import { StatsGrid, StatsCard } from '@/components/custom/StatsCard';
import {
    Users,
    Target,
    MessageSquare,
    DollarSign,
    MessageCircle
} from 'lucide-react';
import { format, isToday, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';

export function LeadStatsHeader() {
    const { stats, dateRange } = useLeads();

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'tr';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
        return val.toString();
    };

    // Determine if selected range is "today"
    const isRangeToday = dateRange?.from && dateRange?.to && 
        isToday(dateRange.from) && isSameDay(dateRange.from, dateRange.to);
    
    // Generate label based on date range
    const getDateLabel = () => {
        if (!dateRange?.from) return 'KỲ NÀY';
        if (isRangeToday) return 'HÔM NAY';
        if (isSameDay(dateRange.from, dateRange.to || dateRange.from)) {
            return format(dateRange.from, 'dd/MM', { locale: vi }).toUpperCase();
        }
        return 'KỲ NÀY';
    };

    const dateLabel = getDateLabel();

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
                    subtitle={stats?.yesterdaySpend > 0 ? `${(((stats.spendToday - stats.yesterdaySpend) / stats.yesterdaySpend) * 100).toFixed(0)}% so với hôm qua` : 'Không bao gồm 10% thuế'}
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
                    title="QUALIFIED LEAD"
                    value={`${stats?.todayLeads || 0}`}
                    subtitle={`${stats?.todayQualified || 0} Ads • ${stats?.todayNewOrganic || 0} Tự nhiên`}
                    icon={<Users className="h-4 w-4" />}
                    className="bg-rose-500/5 border-rose-500/10"
                />
                <StatsCard
                    title={`TIN NHẮN ${dateLabel}`}
                    value={`${stats?.todayMessagesCount || 0}`}
                    subtitle="Mới + Cũ"
                    icon={<MessageCircle className="h-4 w-4" />}
                    className="bg-primary/5 border-primary/10"
                />
            </StatsGrid>
        </div>
    );
}
