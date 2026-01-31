
import { EmptyState } from '@/components/custom';
import { CreditCard, Megaphone } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export function AccountDetailsSection() {
    const { adAccounts, campaigns } = useDashboard();

    return (
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Chi tiết tài khoản</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card rounded-2xl border border-border/50 p-6 flex items-center gap-4 shadow-sm backdrop-blur-sm">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <CreditCard className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Tài khoản quảng cáo</p>
                        <p className="text-2xl font-bold">{adAccounts.length}</p>
                    </div>
                </div>
                <div className="bg-card rounded-2xl border border-border/50 p-6 flex items-center gap-4 shadow-sm backdrop-blur-sm">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                        <Megaphone className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Tổng số Campaigns</p>
                        <p className="text-2xl font-bold">{campaigns.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-sm">
                {!campaigns.length ? (
                    <EmptyState
                        title="Chưa có dữ liệu chiến dịch"
                        description="Các chiến dịch sẽ xuất hiện ở đây sau khi bạn kết nối tài khoản Facebook."
                    />
                ) : (
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">Chiến dịch hoạt động gần đây</h3>
                        <div className="divide-y divide-border/50">
                                {campaigns.slice(0, 8).map((campaign: any) => {
                                    const stats = campaign.stats || {};
                                    const impressions = Number(stats.impressions || 0);
                                    const clicks = Number(stats.clicks || 0);
                                    const results = Number(stats.results || 0);
                                    
                                    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
                                    const cvr = clicks > 0 ? (results / clicks) * 100 : 0;

                                    // Performance Logic based on 2024-2025 Education (Courses) Benchmarks
                                    // Ngon: CTR > 2.3% OR CVR > 10%
                                    // Ổn định: CTR 1.2-2.3% OR CVR 6-10%
                                    // Cần tối ưu: CTR < 1.2% OR CVR < 5%
                                    let perfStatus: 'good' | 'average' | 'bad' = 'average';
                                    if (ctr > 2.3 || cvr > 10) perfStatus = 'good';
                                    else if (ctr < 1.2 && cvr < 5) perfStatus = 'bad';

                                    const perfConfig = {
                                        good: { label: 'Chạy ngon', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
                                        average: { label: 'Ổn định', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
                                        bad: { label: 'Cần tối ưu', color: 'bg-amber-500/10 text-amber-600 border-amber-200' }
                                    }[perfStatus];

                                    return (
                                        <div key={campaign.id} className="py-4 flex items-center justify-between group hover:bg-slate-50/50 transition-colors rounded-lg px-2 -mx-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${(campaign.effectiveStatus === 'ACTIVE' || campaign.status === 'ACTIVE') ? 'bg-green-500' : 'bg-slate-300'
                                                    }`} />
                                                <div>
                                                    <p className="font-medium text-sm line-clamp-1 max-w-[200px] md:max-w-md">{campaign.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{campaign.platform?.name || 'Facebook'}</span>
                                                        <span className="text-[10px] text-slate-400">•</span>
                                                        <span className="text-[10px] font-medium text-slate-500">CTR {ctr.toFixed(2)}%</span>
                                                        <span className="text-[10px] text-slate-400">•</span>
                                                        <span className="text-[10px] font-medium text-slate-500">CVR {cvr.toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${perfConfig.color}`}>
                                                    {perfConfig.label}
                                                </div>
                                                <div className={`hidden md:block px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase ${
                                                    (campaign.effectiveStatus === 'ACTIVE' || campaign.status === 'ACTIVE')
                                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' 
                                                        : 'text-slate-400 border-slate-100'
                                                }`}>
                                                    {campaign.effectiveStatus || campaign.status}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
