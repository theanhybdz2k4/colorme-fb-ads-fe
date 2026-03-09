
import { EmptyState, MetricItem, StatusBadge, MetricGrid } from '@/components/shared/common';
import { useDashboard } from '../context/DashboardContext';
import { CampaignOptimizationSection } from './CampaignOptimizationSection';
import { formatPercent } from '@/lib/format';
import Icon from '@/components/shared/common/Icon';

export function AccountDetailsSection() {
    const { adAccounts, campaigns } = useDashboard();

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
                <div className="card p-0 overflow-hidden">
                    <div className="flex items-center justify-between px-5 h-12">
                        <div className="flex items-center gap-3">
                            <Icon name="chart" className="size-5 fill-primary-01" />
                            <span className="text-sub-title-1 font-bold text-t-primary">Chiến dịch gần đây</span>
                        </div>
                    </div>

                    <div className="p-6 pt-2">
                        {!campaigns.length ? (
                            <EmptyState
                                title="Chưa có dữ liệu chiến dịch"
                                description="Các chiến dịch sẽ xuất hiện ở đây sau khi bạn kết nối tài khoản Facebook."
                                className="py-12"
                            />
                        ) : (
                            <div className="divide-y divide-s-subtle/20">
                                {campaigns.slice(0, 5).map((campaign: any) => {
                                    const stats = campaign.stats || {};
                                    const impressions = Number(stats.impressions || 0);
                                    const clicks = Number(stats.clicks || 0);
                                    const results = Number(stats.results || 0);

                                    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
                                    const cvr = clicks > 0 ? (results / clicks) * 100 : 0;

                                    let perfStatus: 'good' | 'average' | 'bad' = 'average';
                                    if (ctr > 2.3 || cvr > 10) perfStatus = 'good';
                                    else if (ctr < 1.2 && cvr < 5) perfStatus = 'bad';

                                    const statusMap = {
                                        good: 'success' as const,
                                        average: 'pending' as const,
                                        bad: 'warning' as const,
                                    };
                                    const labelMap = {
                                        good: 'Tốt',
                                        average: 'Ổn',
                                        bad: 'Kém',
                                    };

                                    const isActive = campaign.effectiveStatus === 'ACTIVE' || campaign.status === 'ACTIVE';

                                    return (
                                        <div key={campaign.id} className="py-4 flex items-center justify-between group">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className={cn(
                                                    "size-2 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.1)]",
                                                    isActive ? 'bg-primary-02 animate-pulse' : 'bg-t-tertiary/30'
                                                )} />
                                                <div className="min-w-0">
                                                    <p className="font-bold text-body-2 text-t-primary truncate group-hover:text-primary-01 transition-colors leading-tight">{campaign.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-t-tertiary uppercase tracking-widest font-bold">{campaign.platform?.name || 'FB'}</span>
                                                        <span className="text-[10px] text-t-tertiary/30">•</span>
                                                        <span className="text-[10px] font-bold text-t-secondary uppercase">CTR {formatPercent(ctr)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <StatusBadge status={statusMap[perfStatus]} label={labelMap[perfStatus]} dot={false} className="h-6" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Optimization Insight Card */}
                <CampaignOptimizationSection />
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
