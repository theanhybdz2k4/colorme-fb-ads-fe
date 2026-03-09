
import { useDashboard } from '../context/DashboardContext';
import { PerformanceList, PerformanceItem, StatusBadge } from '@/components/shared/common';
import Icon from '@/components/shared/common/Icon';
import { formatPercent } from '@/lib/format';

export function QuickInsightsSection() {
    const { campaigns, metrics, ageGenderBreakdown } = useDashboard();

    // Find campaign with highest CTR using nested stats from API
    const campaignWithStats = campaigns.map(c => {
        const stats = c.stats || {};
        const impressions = Number(stats.impressions || 0);
        const clicks = Number(stats.clicks || 0);
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        return { ...c, ctr };
    });

    const bestCTRCampaign = [...campaignWithStats]
        .filter(c => c.ctr > 0)
        .sort((a, b) => b.ctr - a.ctr)[0];

    const bestResultsCampaign = [...campaigns]
        .map(c => ({ ...c, results: Number(c.stats?.results || 0) }))
        .sort((a, b) => b.results - a.results)[0];

    const avgCTR = metrics.overallCTR;
    const ctrStatus = bestCTRCampaign && avgCTR > 0
        ? ((bestCTRCampaign.ctr - avgCTR) / avgCTR) * 100
        : 0;

    // Best Audience
    const bestAudience = ageGenderBreakdown?.[0];
    let audienceLabel = bestAudience
        ? `Độ tuổi ${bestAudience.age} (${bestAudience.gender === 'female' ? 'Nữ' : 'Nam'})`
        : null;

    if (!audienceLabel && bestResultsCampaign && bestResultsCampaign.results > 0) {
        audienceLabel = "Nhóm đối tượng tiềm năng nhất";
    }

    return (
        <div className="space-y-6">
            <div className="card p-0 overflow-hidden">
                <div className="flex items-center justify-between px-6 h-12 bg-b-depth2/10">
                    <span className="text-h6 font-bold text-t-primary leading-none">Hệ thống Sync</span>
                    <StatusBadge status="active" label="Live" />
                </div>

                <div className="p-5 space-y-4">
                    {/* Optimization Tip */}
                    <div className="p-5 bg-b-depth2/50 rounded-2xl shadow-depth-toggle">
                        <div className="flex items-center gap-2 mb-2.5">
                            <Icon name="chart" className="size-4 fill-primary-01" />
                            <span className="text-[10px] font-bold text-primary-01 uppercase tracking-widest">Optimization Tip</span>
                        </div>
                        <p className="text-body-2 leading-relaxed text-t-secondary transition-colors">
                            {bestCTRCampaign ? (
                                <>
                                    Campaign <strong className="text-t-primary">"{bestCTRCampaign.name}"</strong> đang có CTR ({formatPercent(bestCTRCampaign.ctr)})
                                    {ctrStatus > 0 ? ` cao hơn ${formatPercent(ctrStatus)} so với trung bình.` : ' ổn định.'} Hãy cân nhắc tăng ngân sách.
                                </>
                            ) : bestResultsCampaign && bestResultsCampaign.results > 0 ? (
                                <>
                                    Campaign <strong className="text-t-primary">"{bestResultsCampaign.name}"</strong> đang mang lại nhiều kết quả nhất ({bestResultsCampaign.results} leads). Bạn nên tối ưu thêm nội dung để tăng CTR.
                                </>
                            ) : (
                                'Đang tổng hợp dữ liệu chiến dịch... Hãy quay lại sau ít phút để nhận gợi ý tối ưu.'
                            )}
                        </p>
                    </div>

                    {/* Audience Insight */}
                    <div className="p-5 bg-b-depth2/50 rounded-2xl shadow-depth-toggle">
                        <div className="flex items-center gap-2 mb-2.5">
                            <Icon name="profile" className="size-4 fill-primary-02" />
                            <span className="text-[10px] font-bold text-primary-02 uppercase tracking-widest">Audience Insight</span>
                        </div>
                        <p className="text-body-2 leading-relaxed text-t-secondary transition-colors">
                            {audienceLabel
                                ? `${audienceLabel} đang mang lại lượng Leads cao nhất với chi phí tối ưu dựa trên dữ liệu 30 ngày qua.`
                                : "Đang phân tích thông tin đối tượng... Gợi ý sẽ xuất hiện sau khi đồng bộ dữ liệu hoàn tất."
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Top & Bottom Campaigns - now using PerformanceList */}
            <PerformanceList title="Campaign Chạy ngon" icon="arrow-up-right">
                {campaignWithStats
                    .filter(c => c.ctr > 2.3 || (Number(c.stats?.results || 0) > 0 && (Number(c.stats?.results || 0) / Number(c.stats?.clicks || 1)) * 100 > 10))
                    .sort((a, b) => b.ctr - a.ctr)
                    .slice(0, 3)
                    .map((c, i) => (
                        <PerformanceItem
                            key={c.id}
                            rank={i + 1}
                            title={c.name}
                            value={formatPercent(c.ctr)}
                            secondaryStats={[
                                { label: 'Results', value: String(c.stats?.results || 0) },
                            ]}
                            icon="send"
                        />
                    ))
                }
                {campaignWithStats.filter(c => c.ctr > 2.3 || (Number(c.stats?.results || 0) > 0 && (Number(c.stats?.results || 0) / Number(c.stats?.clicks || 1)) * 100 > 10)).length === 0 && (
                    <p className="text-caption text-t-tertiary italic text-center py-6">Chưa có campaign vượt benchmark</p>
                )}
            </PerformanceList>

            <PerformanceList title="Cần tối ưu thêm" icon="info">
                {campaignWithStats
                    .filter(c => c.ctr < 1.2 && c.ctr > 0)
                    .sort((a, b) => a.ctr - b.ctr)
                    .slice(0, 3)
                    .map((c, i) => (
                        <PerformanceItem
                            key={c.id}
                            rank={i + 1}
                            title={c.name}
                            value={formatPercent(c.ctr)}
                            secondaryStats={[
                                { label: 'CTR', value: formatPercent(c.ctr) },
                            ]}
                            icon="cube"
                        />
                    ))
                }
                {campaignWithStats.filter(c => c.ctr < 1.2 && c.ctr > 0).length === 0 && (
                    <p className="text-caption text-t-tertiary italic text-center py-6">Tất cả đều đạt mức ổn định</p>
                )}
            </PerformanceList>
        </div>
    );
}
