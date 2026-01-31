
import { useDashboard } from '../context/DashboardContext';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

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

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Bảng xếp hạng</h2>

            {/* Top Performers */}
            <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-emerald-700">🚀 Chạy ngon</h3>
                </div>

                <div className="space-y-3">
                    {goodCampaigns.length > 0 ? goodCampaigns.map(campaign => (
                        <div key={campaign.id} className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-100/50">
                            <p className="text-sm font-medium line-clamp-1">{campaign.name}</p>
                            <div className="flex gap-3 mt-1.5 text-[10px] font-bold text-emerald-600 uppercase">
                                <span>CTR: {campaign.ctr.toFixed(2)}%</span>
                                <span>CVR: {campaign.cvr.toFixed(1)}%</span>
                            </div>
                        </div>
                    )) : (
                        <p className="text-xs text-muted-foreground italic p-2 text-center">Chưa có campaign đạt đỉnh</p>
                    )}
                </div>
            </div>

            {/* Need Optimization */}
            <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <TrendingDown className="w-4 h-4 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-amber-700">⚠️ Cần tối ưu</h3>
                </div>

                <div className="space-y-3">
                    {badCampaigns.length > 0 ? badCampaigns.map(campaign => (
                        <div key={campaign.id} className="p-3 bg-amber-500/5 rounded-xl border border-amber-100/50">
                            <p className="text-sm font-medium line-clamp-1">{campaign.name}</p>
                            <div className="flex gap-3 mt-1.5 text-[10px] font-bold text-amber-600 uppercase">
                                <span>CTR: {campaign.ctr.toFixed(2)}%</span>
                                <span>CVR: {campaign.cvr.toFixed(1)}%</span>
                            </div>
                        </div>
                    )) : (
                        <p className="text-xs text-muted-foreground italic p-2 text-center">Tất cả đều ổn định</p>
                    )}
                </div>
            </div>

            {/* Benchmark Info */}
            <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <Info className="w-4 h-4 text-slate-400 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-tight">
                    * Đánh giá dựa trên trung bình ngành giáo dục: CTR {'>'} 2.3% và CVR {'>'} 10%.
                </p>
            </div>
        </div>
    );
}
