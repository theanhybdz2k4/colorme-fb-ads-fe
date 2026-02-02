
import { useState, useEffect } from 'react';
import { Sparkles, Loader2, BrainCircuit, CheckCircle2, AlertCircle } from 'lucide-react';
import { analyticsApi } from '@/api';
import { useDashboard } from '../context/DashboardContext';

export function CampaignOptimizationSection() {
    const { campaigns } = useDashboard();
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
    const [analysis, setAnalysis] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get the "worst" performing active campaign as default
    useEffect(() => {
        if (campaigns.length > 0 && !selectedCampaignId) {
            const activeCampaigns = campaigns.filter(c => c.effectiveStatus === 'ACTIVE' || c.status === 'ACTIVE');
            const target = activeCampaigns.length > 0 ? activeCampaigns : campaigns;

            // Sort by lowest CTR
            const sorted = [...target].sort((a, b) => {
                const ctrA = (Number(a.stats?.clicks || 0) / Number(a.stats?.impressions || 1)) * 100;
                const ctrB = (Number(b.stats?.clicks || 0) / Number(b.stats?.impressions || 1)) * 100;
                return ctrA - ctrB;
            });

            if (sorted[0]) {
                setSelectedCampaignId(sorted[0].id);
            }
        }
    }, [campaigns]);

    // Load existing analysis when selected campaign changes
    useEffect(() => {
        if (selectedCampaignId) {
            loadAnalysis(selectedCampaignId);
        }
    }, [selectedCampaignId]);

    const loadAnalysis = async (id: string) => {
        try {
            setError(null);
            const data = await analyticsApi.getAnalysis(id);
            setAnalysis(data);
        } catch (err) {
            console.error('Failed to load analysis:', err);
        }
    };

    const handleAnalyze = async () => {
        const campaign = campaigns.find(c => c.id === selectedCampaignId);
        if (!campaign) return;

        setIsAnalyzing(true);
        setError(null);

        const stats = campaign.stats || {};
        const impressions = Number(stats.impressions || 0);
        const clicks = Number(stats.clicks || 0);
        const results = Number(stats.results || 0);
        const spend = Number(stats.spend || 0);

        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cvr = clicks > 0 ? (results / clicks) * 100 : 0;

        try {
            const result = await analyticsApi.optimize({
                campaignId: campaign.id,
                name: campaign.name,
                ctr,
                cvr,
                spend,
                results
            });
            setAnalysis(result.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Không thể phân tích chiến dịch này. Vui lòng kiểm tra lại cấu hình Gemini API.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="bg-card rounded-2xl border border-emerald-100 shadow-sm overflow-hidden bg-linear-to-br from-white to-emerald-50/20">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <BrainCircuit className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Tối ưu hóa bằng AI</h3>
                            <p className="text-xs text-muted-foreground">Phân tích chuyên sâu dựa trên dữ liệu thực tế</p>
                        </div>
                    </div>
                    <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>

                <div className="space-y-4">
                    {/* Campaign Selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chọn chiến dịch để phân tích</label>
                        <select
                            value={selectedCampaignId}
                            onChange={(e) => setSelectedCampaignId(e.target.value)}
                            className="w-full bg-white border border-border/50 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        >
                            {campaigns.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Analysis Content */}
                    <div className="min-h-[200px] relative">
                        {isAnalyzing ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl space-y-3 z-10">
                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                <p className="text-sm font-medium text-emerald-600">Gemini đang phân tích dữ liệu...</p>
                            </div>
                        ) : null}

                        {error ? (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                <p className="text-sm text-amber-700">{error}</p>
                            </div>
                        ) : analysis ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>ĐÃ CÓ KẾT QUẢ PHÂN TÍCH</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">
                                        Cập nhật: {new Date(analysis.updated_at).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                <div className="prose prose-sm prose-emerald max-w-none prose-p:leading-relaxed prose-li:my-1 text-slate-600 bg-white/50 p-4 rounded-xl border border-emerald-100/30">
                                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(analysis.analysis_text) }} />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                                <div className="p-4 bg-slate-50 rounded-full">
                                    <BrainCircuit className="w-8 h-8 text-slate-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Chưa có phân tích cho chiến dịch này</p>
                                    <p className="text-xs text-slate-400 max-w-[200px] mx-auto">Nhấn nút bên dưới để bắt đầu phân tích bằng AI</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !selectedCampaignId}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                    >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {analysis ? 'Cập nhật phân tích mới' : 'Phân tích ngay bằng AI'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Simple markdown formatter helper (supports bullets and bold)
function formatMarkdown(text: string) {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/^(?!<li>)(.*$)/gim, '<p>$1</p>')
        .replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc pl-5 my-2">$1</ul>');
}
