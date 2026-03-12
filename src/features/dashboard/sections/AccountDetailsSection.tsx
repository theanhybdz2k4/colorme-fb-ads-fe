import { MetricItem, MetricGrid } from '@/components/shared/common';
import { useDashboard } from '../context/DashboardContext';
import { CampaignOptimizationSection } from './CampaignOptimizationSection';
import { formatCurrency } from '@/lib/format';
import { PerformanceList, PerformanceItem } from '@/components/shared/common/PerformanceList';
import Icon from '@/components/shared/common/Icon';

export function AccountDetailsSection() {
    const { adAccounts, campaigns } = useDashboard();

    // Sort campaigns by spend for the recent list
    const sortedCampaigns = [...campaigns].sort((a, b) => {
        const spendA = Number(a.stats?.spend || 0);
        const spendB = Number(b.stats?.spend || 0);
        return spendB - spendA;
    });

    return (
        <div className="space-y-6">
            <h2 className="text-h6 font-bold text-t-primary leading-none px-5 py-2">Chi tiết tài khoản</h2>

            <MetricGrid className="grid-cols-1 md:grid-cols-2 gap-4">
                <MetricItem
                    title="Tài khoản quảng cáo"
                    value={adAccounts.length}
                    icon="wallet"
                    iconColor="var(--primary-01)"
                    subtitle="Đã kết nối"
                />
                <MetricItem
                    title="Tổng số Campaigns"
                    value={campaigns.length}
                    icon="send"
                    iconColor="var(--primary-02)"
                    subtitle="Trong chu kỳ này"
                />
            </MetricGrid>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Recent Campaigns List */}
                <div className="lg:col-span-1 h-full">
                    {sortedCampaigns.length > 0 ? (
                        <PerformanceList title="Chiến dịch gần đây" className="h-full">
                            {sortedCampaigns.slice(0, 5).map((campaign, idx) => {
                                const stats = campaign.stats || {};
                                const spend = Number(stats.spend || 0);
                                const results = Number(stats.results || 0);
                                const impressions = Number(stats.impressions || 0);
                                const clicks = Number(stats.clicks || 0);
                                const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

                                // Simple performance heuristic
                                let status = 'average';
                                if (ctr > 2.0) status = 'good';
                                else if (ctr < 0.8 && impressions > 1000) status = 'bad';

                                return (
                                    <PerformanceItem
                                        key={campaign.id}
                                        rank={idx + 1}
                                        title={campaign.name}
                                        subtitle={campaign.objective}
                                        value={formatCurrency(spend)}
                                        status={status}
                                        secondaryStats={[
                                            { label: 'Kết quả', value: results.toLocaleString() },
                                            { label: 'CTR', value: `${ctr.toFixed(2)}%` }
                                        ]}
                                    />
                                );
                            })}
                        </PerformanceList>
                    ) : (
                        <div className="card h-full flex flex-col items-center justify-center p-8 text-center bg-b-depth2/10">
                            <div className="size-16 rounded-full bg-b-depth2/50 flex items-center justify-center mb-4">
                                <Icon name="chart-mixed" className="size-8 fill-t-tertiary" />
                            </div>
                            <h4 className="text-body-1 font-bold text-t-secondary">Chưa có dữ liệu</h4>
                            <p className="text-body-2 text-t-tertiary mt-2">Dữ liệu chiến dịch sẽ xuất hiện tại đây</p>
                        </div>
                    )}
                </div>

                {/* AI Optimization Insight Card */}
                <CampaignOptimizationSection />
            </div>
        </div>
    );
}
