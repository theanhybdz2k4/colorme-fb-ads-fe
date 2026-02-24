
import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Loader2, BrainCircuit, CheckCircle2, AlertCircle, TrendingUp, Zap, Target, MousePointer2, Search, ChevronDown } from 'lucide-react';
import { analyticsApi } from '@/api';
import { useDashboard } from '../context/DashboardContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

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
                // Priority: Warning (🔴) > Stable (🟡) > Good (🟢)
                const priority: Record<string, number> = { warning: 0, stable: 1, good: 2 };
                if (priority[a.statusClass] !== priority[b.statusClass]) {
                    return priority[a.statusClass] - priority[b.statusClass];
                }
                return a.ctr - b.ctr; // Then sort by lowest CTR within same group
            });
    }, [campaigns]);

    const filteredCampaigns = processedCampaigns.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get the "worst" performing active campaign as default
    useEffect(() => {
        if (processedCampaigns.length > 0 && !selectedCampaignId) {
            setSelectedCampaignId(processedCampaigns[0].id);
        }
    }, [processedCampaigns, selectedCampaignId]);

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

    const campaign = campaigns.find(c => c.id === selectedCampaignId);
    const stats = campaign?.stats || {};
    const ctrValue = stats.impressions ? (Number(stats.clicks) / Number(stats.impressions) * 100).toFixed(2) : '0';

    return (
        <div className="relative group overflow-hidden rounded-3xl border border-border/50 bg-card shadow-float-lg transition-all duration-500 hover:shadow-primary/5">
            {/* Animated Background Decor */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

            <div className="p-8 relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-xl animate-pulse" />
                            <div className="p-3 bg-linear-to-br from-primary to-primary/80 rounded-xl relative shadow-lg shadow-primary/20">
                                <BrainCircuit className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                                Phân tích Nội dung AI
                                <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full uppercase font-black">Pro</span>
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Sức mạnh Gemini 2.0 Flash Phân tích Nội dung & Gợi ý</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 flex-1">
                    {/* Campaign Selector with Stats Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Chiến dịch</label>
                            <Popover open={isOpen} onOpenChange={setIsOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        className="w-full flex items-center justify-between bg-secondary/50 border border-border/50 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-left"
                                    >
                                        <span className="truncate mr-2 text-foreground">
                                            {campaign ? campaign.name : 'Chọn chiến dịch...'}
                                        </span>
                                        <ChevronDown className={`h-4 w-4 shrink-0 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-card border-border/50 rounded-2xl shadow-2xl overflow-hidden" align="start">
                                    <div className="p-3 border-b border-border/30 bg-muted/20">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Tìm tên chiến dịch..."
                                                className="pl-9 h-9 bg-background/50 border-border/30 focus-visible:ring-primary/20"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <ScrollArea className="h-[300px]">
                                        <div className="p-2 space-y-1">
                                            {filteredCampaigns.map((c) => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => {
                                                        setSelectedCampaignId(c.id);
                                                        setIsOpen(false);
                                                        setSearchTerm('');
                                                    }}
                                                    className={`w-full text-left p-3 rounded-xl transition-all hover:bg-primary/5 flex flex-col gap-1 group/item ${selectedCampaignId === c.id ? 'bg-primary/10 border border-primary/20' : 'border border-transparent'}`}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-sm font-bold text-foreground truncate flex-1 group-hover/item:text-primary transition-colors">
                                                            {c.name}
                                                        </span>
                                                        <div className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background/50 border border-border/30">
                                                            <span className={`w-2 h-2 rounded-full ${c.statusClass === 'good' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                                c.statusClass === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                                                    'bg-slate-400'
                                                                }`} />
                                                            <span className="text-[9px] font-black uppercase text-muted-foreground">
                                                                {c.statusClass === 'good' ? 'Chạy ngon' :
                                                                    c.statusClass === 'warning' ? 'Cần tối ưu' : 'Ổn định'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold">
                                                        <span className={`flex items-center gap-1 ${c.statusClass === 'warning' ? 'text-amber-600' : 'text-muted-foreground/70'}`}>
                                                            CTR: {c.ctr.toFixed(2)}%
                                                            {c.statusClass === 'warning' && <AlertCircle className="w-3 h-3" />}
                                                        </span>
                                                        <span className="text-muted-foreground/70">•</span>
                                                        <span className="text-muted-foreground/70 flex items-center gap-1">
                                                            KẾT QUẢ: {c.results}
                                                            <Target className="w-3 h-3 text-primary/50" />
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                            {filteredCampaigns.length === 0 && (
                                                <div className="py-8 text-center text-muted-foreground">
                                                    <p className="text-sm font-medium">Không tìm thấy chiến dịch nào</p>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex gap-4 items-end">
                            <div className="flex-1 bg-secondary/30 rounded-2xl p-3 border border-border/30">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">CTR Hiện tại</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    <span className="text-lg font-black text-foreground">{ctrValue}%</span>
                                </div>
                            </div>
                            <div className="flex-1 bg-secondary/30 rounded-2xl p-3 border border-border/30">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Kết quả</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Target className="w-4 h-4 text-primary" />
                                    <span className="text-lg font-black text-foreground">{stats.results || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Analysis Content Area */}
                    <div className="min-h-[300px] flex flex-col">
                        {isAnalyzing ? (
                            <div className="flex-1 flex flex-col items-center justify-center bg-secondary/20 backdrop-blur-sm rounded-3xl border border-dashed border-primary/30 p-10 mt-2 animate-pulse">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                                    <Loader2 className="w-12 h-12 text-primary animate-spin relative" />
                                </div>
                                <p className="text-lg font-bold text-foreground mb-2">Đang suy luận...</p>
                                <p className="text-sm text-muted-foreground text-center max-w-[280px]">AI đang phân tích các chỉ số và hành vi người dùng để tìm cơ hội tối ưu.</p>
                            </div>
                        ) : error ? (
                            <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-3xl flex gap-4 mt-2">
                                <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-destructive">Lỗi phân tích</p>
                                    <p className="text-sm text-destructive/80 leading-relaxed mt-1">{error}</p>
                                </div>
                            </div>
                        ) : analysis ? (
                            <div className="flex-1 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>THÔNG TIN CHIẾN LƯỢC ĐÃ SẴN SÀNG</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-medium">
                                        Vừa cập nhật: {new Date(analysis.updated_at).toLocaleTimeString('vi-VN')}
                                    </span>
                                </div>
                                <div className="bg-secondary/40 backdrop-blur-xs p-6 rounded-3xl border border-border/50 shadow-inner group-hover:border-primary/20 transition-colors">
                                    <div
                                        className="prose prose-sm prose-invert max-w-none 
                                            prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-4
                                            prose-strong:text-primary prose-strong:font-black
                                            prose-ul:list-none prose-ul:pl-0
                                            prose-li:relative prose-li:pl-8 prose-li:mb-3 prose-li:before:content-[''] 
                                            prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-[12px] 
                                            prose-li:before:w-5 prose-li:before:h-[1px] prose-li:before:bg-primary/50
                                            text-sm scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent max-h-[400px] overflow-y-auto pr-2"
                                        dangerouslySetInnerHTML={{ __html: formatMarkdown(analysis.analysis_text) }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center bg-secondary/10 rounded-3xl border border-dashed border-border/50 mt-2">
                                <div className="p-5 bg-card border border-border/50 rounded-2xl shadow-float mb-6 transform group-hover:scale-110 transition-transform duration-500">
                                    <Zap className="w-10 h-10 text-primary animate-pulse" />
                                </div>
                                <h4 className="text-lg font-bold text-foreground">Khai phá nội dung quảng cáo</h4>
                                <p className="text-sm text-muted-foreground max-w-[260px] mx-auto mt-2 leading-relaxed">
                                    Phân tích copy, tiêu đề của các mẫu quảng cáo và nhận đề xuất cải thiện để tăng CTR, giảm giá lead.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cyberpunk Action Button */}
                <div className="mt-8 pt-6 border-t border-border/30">
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !selectedCampaignId}
                        className="group/btn relative w-full h-14 overflow-hidden rounded-2xl bg-slate-900 border border-border/30 hover:border-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        <div className="relative flex items-center justify-center gap-3 font-black text-sm text-white tracking-widest uppercase">
                            {isAnalyzing ? (
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary group-hover/btn:rotate-12 transition-transform" />
                                    <span>{analysis ? 'Làm mới phân tích' : 'Phân tích nội dung và hiệu suất'}</span>
                                    <MousePointer2 className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 -translate-x-2 group-hover/btn:translate-x-0 transition-all" />
                                </div>
                            )}
                        </div>
                    </button>
                    <p className="text-[9px] text-center text-muted-foreground mt-3 font-bold uppercase tracking-tighter opacity-40">Powered by Google Gemini Language Models</p>
                </div>
            </div>
        </div>
    );
}

// Advanced markdown formatter helper for premium UI
function formatMarkdown(text: string) {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\d\.(.*$)/gim, '<div class="flex items-start gap-3 mt-6 mb-2"><span class="flex-none w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black border border-primary/20">$0.</span><span class="font-black text-base text-foreground">$1</span></div>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/^(?!<li>)(?!<div)(.*$)/gim, '<p>$1</p>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
}
