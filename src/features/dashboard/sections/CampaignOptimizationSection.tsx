import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Loader2, BrainCircuit, CheckCircle2, AlertCircle, Zap, Search, ChevronDown } from 'lucide-react';
import { marked } from 'marked';
import { cn } from '@/lib/utils';
import { analyticsApi } from '@/api';
import { useDashboard } from '../context/DashboardContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatCurrency } from '@/lib/format';
import Icon from '@/components/shared/common/Icon';

export function CampaignOptimizationSection() {
    const { campaigns } = useDashboard();
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
    const [analysis, setAnalysis] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Process and classification logic
    const processedCampaigns = useMemo(() => {
        return campaigns
            .filter(c => c.effectiveStatus === 'ACTIVE' || c.status === 'ACTIVE')
            .map(c => {
                const s = c.stats || {};
                const clicks = Number(s.clicks || 0);
                const impressions = Number(s.impressions || 0);
                const results = Number(s.results || 0);
                const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
                const cvr = clicks > 0 ? (results / clicks) * 100 : 0;

                let statusClass: 'good' | 'warning' | 'stable' = 'stable';
                if (ctr > 2.3 || (results > 0 && cvr > 10)) {
                    statusClass = 'good';
                } else if (ctr < 1.2 && ctr > 0) {
                    statusClass = 'warning';
                }

                return { ...c, ctr, results, statusClass };
            })
            .sort((a, b) => {
                const priority: Record<string, number> = { warning: 0, stable: 1, good: 2 };
                if (priority[a.statusClass] !== priority[b.statusClass]) {
                    return priority[a.statusClass] - priority[b.statusClass];
                }
                return a.ctr - b.ctr;
            });
    }, [campaigns]);

    const filteredCampaigns = processedCampaigns.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (processedCampaigns.length > 0 && !selectedCampaignId) {
            setSelectedCampaignId(processedCampaigns[0].id);
        }
    }, [processedCampaigns, selectedCampaignId]);

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

    const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
    const selectedStats = selectedCampaign?.stats || {};
    const ctrValue = selectedStats.impressions ? (Number(selectedStats.clicks) / Number(selectedStats.impressions) * 100).toFixed(2) : '0';

    return (
        <div className="card p-0 overflow-hidden relative group transition-all duration-500 hover:shadow-depth border border-s-subtle/30">
            {/* Animated Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-01/5 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-01/5 rounded-full blur-3xl -ml-24 -mb-24" />

            <div className="p-8 relative z-1 flex flex-col h-full min-h-[600px]">
                <div className="flex items-center justify-between mb-8 group/header">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary-01/20 blur-xl rounded-2xl animate-pulse" />
                            <div className="p-4 bg-linear-to-br from-primary-01 to-primary-02 rounded-2xl relative shadow-glow-primary border border-white/20">
                                <BrainCircuit className="w-7 h-7 text-white animate-bounce-slow" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-h5 font-black text-t-primary tracking-tighter">AI CAMPAIGN ADVISOR</h3>
                                <span className="text-[10px] px-2 py-0.5 bg-primary-01/10 text-primary-01 border border-primary-01/20 rounded-full uppercase font-black tracking-widest">Flash 2.0</span>
                            </div>
                            <p className="text-body-2 text-t-tertiary mt-1 font-bold">Phân tích nội dung & Gợi ý tối ưu tự động</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                    {/* Left: Campaign Selection & Mini Stats */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-t-tertiary uppercase tracking-widest ml-1 opacity-50">Lựa chọn chiến dịch</label>
                            <Popover open={isOpen} onOpenChange={setIsOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        className="w-full h-14 flex items-center justify-between bg-b-surface1/60 border border-s-subtle/50 rounded-2xl px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-01/20 focus:border-primary-01/50 transition-all text-left group/trigger"
                                    >
                                        <span className="truncate mr-2 text-t-primary group-hover/trigger:text-primary-01 transition-colors">
                                            {selectedCampaign ? selectedCampaign.name : 'Chọn chiến dịch...'}
                                        </span>
                                        <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-50 transition-transform duration-300", isOpen && "rotate-180")} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-(--radix-popover-trigger-width) p-2 bg-b-surface2 border-s-subtle rounded-3xl shadow-depth-menu overflow-hidden z-50">
                                    <div className="p-2 border-b border-s-subtle/20 mb-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-t-tertiary" />
                                            <input
                                                placeholder="Tìm tên chiến dịch..."
                                                className="w-full pl-9 pr-4 py-2 bg-b-surface1/50 border border-s-subtle/30 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-01/20 outline-none"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1 space-y-1">
                                        {filteredCampaigns.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => {
                                                    setSelectedCampaignId(c.id);
                                                    setIsOpen(false);
                                                    setSearchTerm('');
                                                }}
                                                className={cn(
                                                    "w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 group/item relative overflow-hidden",
                                                    selectedCampaignId === c.id
                                                        ? "bg-primary-01/10 border border-primary-01/20"
                                                        : "hover:bg-b-surface1 border border-transparent"
                                                )}
                                            >
                                                <div className="flex items-center justify-between gap-2 relative z-1">
                                                    <span className={cn(
                                                        "text-[13px] font-black truncate flex-1 transition-colors",
                                                        selectedCampaignId === c.id ? "text-primary-01" : "text-t-primary"
                                                    )}>
                                                        {c.name}
                                                    </span>
                                                    <div className={cn(
                                                        "size-2 rounded-full",
                                                        c.statusClass === 'good' ? 'bg-accent-green shadow-glow-green' :
                                                            c.statusClass === 'warning' ? 'bg-accent-red animate-pulse' : 'bg-accent-orange'
                                                    )} />
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-tighter text-t-tertiary/70 relative z-1">
                                                    <span>CTR: {c.ctr.toFixed(2)}%</span>
                                                    <span>•</span>
                                                    <span>Spend: {formatCurrency(Number(c.stats?.spend || 0))}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {selectedCampaign && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-b-surface1/40 p-4 rounded-3xl border border-s-subtle/30 shadow-inner group/stat">
                                    <p className="text-[10px] font-black text-t-tertiary uppercase tracking-widest opacity-50 mb-1 group-hover/stat:text-primary-01 transition-colors">CTR</p>
                                    <p className="text-h6 font-black text-t-primary tracking-tight">{ctrValue}%</p>
                                </div>
                                <div className="bg-b-surface1/40 p-4 rounded-3xl border border-s-subtle/30 shadow-inner group/stat">
                                    <p className="text-[10px] font-black text-t-tertiary uppercase tracking-widest opacity-50 mb-1 group-hover/stat:text-secondary-01 transition-colors">Results</p>
                                    <p className="text-h6 font-black text-t-primary tracking-tight">{Number(selectedStats.results || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 mt-auto">
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !selectedCampaignId}
                                className={cn(
                                    "w-full h-16 rounded-3xl relative overflow-hidden transition-all duration-500 active:scale-95 group/btn shadow-depth",
                                    isAnalyzing || !selectedCampaignId ? "opacity-50 grayscale cursor-not-allowed" : "shadow-glow-primary"
                                )}
                            >
                                <div className="absolute inset-0 bg-linear-to-r from-primary-01 via-primary-02 to-primary-01 bg-size-[200%_100%] animate-shimmer" />
                                <div className="relative z-1 flex items-center justify-center gap-3 text-white font-black text-sm tracking-[0.2em]">
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>ANALYZING...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 group-hover/btn:rotate-12 transition-transform duration-500" />
                                            <span>RUN AI ANALYSIS</span>
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Right: AI Output Area */}
                    <div className="lg:col-span-8 flex flex-col">
                        <div className="flex-1 bg-b-surface1/60 rounded-[32px] border border-s-subtle/50 shadow-inner relative overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between px-8 h-14 border-b border-s-subtle/20 bg-white/5 backdrop-blur-md shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-accent-green animate-pulse" />
                                    <span className="text-[11px] font-black text-t-secondary uppercase tracking-widest">AI Deduction Layer</span>
                                </div>
                                {analysis && (
                                    <span className="text-[10px] font-bold text-t-tertiary opacity-50">
                                        Last scan: {new Date(analysis.updated_at).toLocaleTimeString('vi-VN')}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {isAnalyzing ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-6">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary-01/10 blur-3xl animate-pulse" />
                                            <div className="size-20 rounded-full border-4 border-t-primary-01 border-r-transparent border-l-transparent border-b-transparent animate-spin flex items-center justify-center">
                                                <Icon name="ai" className="size-8 fill-primary-01 animate-glow" />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <h4 className="text-h6 font-black text-t-primary tracking-tight">AI đang xử lý dữ liệu...</h4>
                                            <p className="text-body-2 text-t-tertiary mt-2 font-bold uppercase tracking-widest opacity-60">Triệt xuất Insight từ Gemini 2.0</p>
                                        </div>
                                    </div>
                                ) : error ? (
                                    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-accent-red/5 rounded-3xl m-4 border border-accent-red/20 shadow-inner">
                                        <AlertCircle className="size-12 text-accent-red mb-4 animate-bounce" />
                                        <h4 className="text-body-1 font-black text-accent-red uppercase">System Alert</h4>
                                        <p className="text-body-2 text-t-tertiary mt-2 max-w-sm font-bold uppercase tracking-tight">{error}</p>
                                    </div>
                                ) : analysis ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <div className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-float">
                                            <div
                                                className="rich-text"
                                                dangerouslySetInnerHTML={{ __html: marked.parse(analysis.analysis_text) }}
                                            />
                                            <div className="flex items-center gap-2 mt-8 py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                                <CheckCircle2 className="size-4 text-emerald-500" />
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">KẾT QUẢ ĐÃ ĐƯỢC XÁC THỰC BỞI GEMINI AGENT</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                        <div className="size-24 rounded-4xl bg-b-depth2/20 border border-s-subtle flex items-center justify-center mb-8 transform hover:scale-110 transition-transform duration-700 shadow-depth">
                                            <Zap className="size-10 fill-t-tertiary text-t-tertiary" />
                                        </div>
                                        <h4 className="text-h6 font-black text-t-primary tracking-tight">KÍCH HOẠT HỆ THỐNG AI</h4>
                                        <p className="text-body-1 text-t-tertiary mt-3 max-w-[280px] font-bold uppercase tracking-tighter leading-relaxed">
                                            Phân tích nội dung quảng cáo và hành vi người dùng bằng thuật toán Gemini thế hệ mới.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black text-t-tertiary/20 tracking-[0.3em] uppercase transition-opacity group-hover:opacity-10 pointer-events-none">
                Google DeepMind Gemini 2.0 Engine
            </p>
        </div>
    );
}
