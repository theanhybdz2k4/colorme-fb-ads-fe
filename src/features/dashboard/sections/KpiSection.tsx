
import { MetricCard } from '@/components/custom';
import { DollarSign, Users, Target, MousePointer } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export function KpiSection() {
    const { metrics, trends } = useDashboard();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
                title="Tổng chi tiêu"
                value={`$${metrics.totalSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                subtitle={`${metrics.activeCampaignsCount} campaigns đang hoạt động`}
                icon={DollarSign}
                trend={{ 
                    value: Math.abs(trends.spend), 
                    isPositive: trends.spend >= 0, 
                    label: '30 ngày qua' 
                }}
                color="blue"
                chart="area"
            />
            <MetricCard
                title="Tổng Leads"
                value={metrics.totalLeads.toLocaleString()}
                subtitle="Số khách hàng tiềm năng"
                icon={Users}
                trend={{ 
                    value: Math.abs(trends.leads), 
                    isPositive: trends.leads >= 0, 
                    label: '30 ngày qua' 
                }}
                color="green"
                status={metrics.totalLeads > 0 ? 'excellent' : undefined}
                chart="bar"
            />
            <MetricCard
                title="Chi phí/Lead (CPL)"
                value={`$${metrics.overallCPL.toFixed(2)}`}
                subtitle={`CTR trung bình: ${metrics.overallCTR.toFixed(2)}%`}
                icon={Target}
                trend={{ 
                    value: Math.abs(trends.cpl), 
                    isPositive: trends.cpl <= 0, // Lower CPL is positive
                    label: '30 ngày qua' 
                }}
                color="purple"
                status={metrics.overallCPL > 0 && metrics.overallCPL <= 10 ? 'excellent' : metrics.overallCPL <= 15 ? 'good' : metrics.overallCPL > 15 ? 'poor' : undefined}
                chart="line"
            />
            <MetricCard
                title="Tổng Clicks"
                value={metrics.totalClicks.toLocaleString()}
                subtitle={`CPC: $${(metrics.totalClicks > 0 ? metrics.totalSpend / metrics.totalClicks : 0).toFixed(2)}`}
                icon={MousePointer}
                trend={{ 
                    value: Math.abs(trends.clicks), 
                    isPositive: trends.clicks >= 0, 
                    label: '30 ngày qua' 
                }}
                color="orange"
                chart="area"
            />
        </div>
    );
}
