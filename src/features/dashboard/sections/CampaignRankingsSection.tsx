
import { useDashboard } from '../context/DashboardContext';
import { PerformanceList, PerformanceItem } from '@/components/shared/common';
import { formatPercent } from '@/lib/format';
import Icon from '@/components/shared/common/Icon';

export function CampaignRankingsSection() {
    const { campaigns } = useDashboard();

    const campaignPerformance = campaigns.map(c => {
        const stats = c.stats || {};
        const impressions = Number(stats.impressions || 0);
        const clicks = Number(stats.clicks || 0);
        const results = Number(stats.results || 0);

        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cvr = clicks > 0 ? (results / clicks) * 100 : 0;

        // Performance Logic based on 2024-2025 Education Benchmarks
        let status: 'good' | 'average' | 'bad' = 'average';
        if (ctr > 2.3 || cvr > 10) status = 'good';
        else if (ctr < 1.2 && cvr < 5) status = 'bad';

        return { ...c, ctr, cvr, status };
    });

    const goodCampaigns = campaignPerformance.filter(c => c.status === 'good').slice(0, 5);
    const badCampaigns = campaignPerformance.filter(c => c.status === 'bad').slice(0, 5);
    const maxCtr = Math.max(...campaignPerformance.map(c => c.ctr), 1);

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-t-primary uppercase tracking-widest">Bảng xếp hạng</h2>

            {/* Top Performers */}
            <PerformanceList
                title="Chạy ngon"
                icon="arrow-up-right"
            >
                {goodCampaigns.length > 0 ? goodCampaigns.map((campaign, index) => (
                    <PerformanceItem
                        key={campaign.id}
                        rank={index + 1}
                        title={campaign.name}
                        value={formatPercent(campaign.ctr)}
                        progress={(campaign.ctr / maxCtr) * 100}
                        secondaryStats={[
                            { label: 'CTR', value: formatPercent(campaign.ctr) },
                            { label: 'CVR', value: formatPercent(campaign.cvr) },
                        ]}
                    />
                )) : (
                    <p className="text-caption text-t-tertiary italic p-6 text-center">Chưa có campaign đạt đỉnh</p>
                )}
            </PerformanceList>

            {/* Need Optimization */}
            <PerformanceList
                title="Cần tối ưu"
                icon="info"
            >
                {badCampaigns.length > 0 ? badCampaigns.map((campaign, index) => (
                    <PerformanceItem
                        key={campaign.id}
                        rank={index + 1}
                        title={campaign.name}
                        value={formatPercent(campaign.ctr)}
                        progress={(campaign.ctr / maxCtr) * 100}
                        secondaryStats={[
                            { label: 'CTR', value: formatPercent(campaign.ctr) },
                            { label: 'CVR', value: formatPercent(campaign.cvr) },
                        ]}
                    />
                )) : (
                    <p className="text-caption text-t-tertiary italic p-6 text-center">Tất cả đều ổn định</p>
                )}
            </PerformanceList>

            {/* Benchmark Info */}
            <div className="flex items-start gap-3 p-4 card">
                <Icon name="info" className="size-4 fill-t-tertiary mt-0.5 shrink-0" />
                <p className="text-caption text-t-tertiary leading-relaxed">
                    * Đánh giá dựa trên trung bình ngành giáo dục: CTR {'>'} 2.3% và CVR {'>'} 10%.
                </p>
            </div>
        </div>
    );
}
