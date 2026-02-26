import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Plus, Search, X } from 'lucide-react';
import { useChatbot } from '../context/ChatbotContext';
import { FlowCard } from '../components/FlowCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function FlowsTab() {
    const {
        flows,
        flowsLoading,
        openEdit,
        ads,
    } = useChatbot();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAdId, setSelectedAdId] = useState<string>('all');

    const normalizeString = (str?: string) => {
        if (!str) return '';
        return String(str)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/đ/g, 'd');
    };

    const [adSearchQuery, setAdSearchQuery] = useState('');

    const filteredFlows = useMemo(() => {
        if (!flows) return [];

        let result = flows;

        // Filter by Ad
        if (selectedAdId !== 'all') {
            if (selectedAdId === 'none') {
                result = result.filter((f: any) => !f.linked_ad_ids || f.linked_ad_ids.length === 0);
            } else {
                result = result.filter((f: any) => f.linked_ad_ids?.includes(selectedAdId));
            }
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = normalizeString(searchQuery.trim());
            result = result.filter((flow: any) =>
                normalizeString(flow.display_name).includes(query) ||
                normalizeString(flow.flow_key).includes(query) ||
                normalizeString(flow.content?.text).includes(query)
            );
        }

        return result;
    }, [flows, searchQuery, selectedAdId]);

    const filteredAds = useMemo(() => {
        if (!ads) return [];
        if (!adSearchQuery.trim()) return ads;

        const query = normalizeString(adSearchQuery.trim());
        return ads.filter(ad => {
            const title = normalizeString(ad.name);
            const campaign = normalizeString(ad.campaign_name || '');
            return title.includes(query) || campaign.includes(query);
        });
    }, [ads, adSearchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold tracking-tight">Flow Builder</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <span className="w-1 h-1 rounded-full bg-primary/50" />
                        {flows?.length || 0} kịch bản đang hoạt động
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm kịch bản..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-9 h-11 rounded-xl bg-muted/50 border-border focus:bg-background transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-md transition-colors"
                            >
                                <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                        )}
                    </div>

                    <Select value={selectedAdId} onValueChange={setSelectedAdId}>
                        <SelectTrigger className="w-full md:w-72 h-12 rounded-xl bg-muted/50 border-border font-bold text-[13px] shadow-sm hover:bg-muted transition-all">
                            <div className="flex items-center gap-2.5 truncate">
                                <Bot className="h-4 w-4 text-primary/60" />
                                <SelectValue placeholder="Lọc theo Ads" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border shadow-2xl max-h-[450px] w-[320px] p-1.5 flex flex-col" position="popper" sideOffset={8}>
                            <div className="px-2 py-2 sticky top-0 bg-popover/95 backdrop-blur z-10 mb-1 rounded-t-xl">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="Tìm kiếm Ads..."
                                        value={adSearchQuery}
                                        onChange={(e) => setAdSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        className="h-8 pl-8 pr-8 text-xs bg-muted/30 focus-visible:bg-background rounded-lg border-border/50"
                                    />
                                    {adSearchQuery && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAdSearchQuery('');
                                            }}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded-sm transition-colors"
                                        >
                                            <X className="h-3 w-3 text-muted-foreground" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-y-auto flex-1">
                                <SelectItem value="all" className="rounded-lg focus:bg-primary/10 py-3 font-semibold text-xs cursor-pointer">
                                    🌟 Tất cả Ads
                                </SelectItem>
                                <SelectItem value="none" className="rounded-lg focus:bg-primary/10 py-3 font-semibold text-xs cursor-pointer">
                                    🔗 Chưa kết nối Ads
                                </SelectItem>
                                <div className="h-px bg-border/50 my-1.5 mx-1" />
                                {filteredAds.length > 0 ? (
                                    <>
                                        <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Danh sách Ads đang chạy</div>
                                        <div className="space-y-0.5">
                                            {filteredAds.map(ad => (
                                                <SelectItem key={ad.external_id} value={ad.external_id} className="rounded-xl focus:bg-primary/10 py-2.5 px-3 group cursor-pointer transition-all">
                                                    <div className="flex items-center gap-3.5">
                                                        {ad.creative_thumbnail ? (
                                                            <div className="relative shrink-0 w-12 h-12 bg-muted rounded-xl overflow-hidden border border-border/40 shadow-md">
                                                                <img
                                                                    src={ad.creative_thumbnail}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                    alt=""
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.classList.add('hidden');
                                                                        const next = target.nextElementSibling;
                                                                        if (next) next.classList.remove('hidden');
                                                                    }}
                                                                />
                                                                <div className="hidden absolute inset-0 flex items-center justify-center bg-muted">
                                                                    <Bot className="w-5 h-5 text-muted-foreground/30" />
                                                                </div>
                                                                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center border border-border/40 shadow-inner">
                                                                <Bot className="w-5 h-5 text-muted-foreground/30" />
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[12px] font-bold truncate max-w-[200px] leading-tight group-hover:text-primary transition-colors mb-0.5">{ad.name}</span>
                                                            <span className="text-[9px] text-muted-foreground/70 truncate uppercase font-medium tracking-tight flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                                                                {ad.campaign_name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-6 text-center text-xs text-muted-foreground font-medium">
                                        Không tìm thấy Ads phù hợp
                                    </div>
                                )}
                            </div>
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={() => openEdit()}
                        className="gap-2 rounded-xl px-5 font-bold h-11 shadow-sm"
                    >
                        <Plus className="h-4 w-4" /> Thêm bước mới
                    </Button>
                </div>
            </div>

            {flowsLoading && (
                <div className="flex flex-col items-center justify-center h-64 gap-3 bg-muted rounded-2xl border border-dashed border-border">
                    <div className="animate-spin w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">Đang khởi tạo các kịch bản...</p>
                </div>
            )}

            {/* Flow cards */}
            {!flowsLoading && filteredFlows.length > 0 && (
                <div className="grid gap-4">
                    {filteredFlows.map(flow => (
                        <FlowCard
                            key={flow.id}
                            flow={flow}
                        />
                    ))}
                </div>
            )}

            {!flowsLoading && searchQuery && filteredFlows.length === 0 && (
                <div className="text-center py-20 bg-muted/50 rounded-2xl border border-dashed border-border">
                    <p className="text-sm font-medium text-muted-foreground">Không tìm thấy kịch bản nào phù hợp với "{searchQuery}"</p>
                    <Button
                        variant="ghost"
                        onClick={() => setSearchQuery('')}
                        className="mt-2 text-primary hover:text-primary/80"
                    >
                        Xóa tìm kiếm
                    </Button>
                </div>
            )}

            {flows?.length === 0 && !flowsLoading && !searchQuery && (
                <div className="text-center py-20 bg-muted rounded-2xl border-2 border-dashed border-border space-y-4">
                    <div className="inline-flex p-5 rounded-2xl bg-card border border-border mt-2">
                        <Bot className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-lg font-bold text-foreground">Chưa có logic nào được thiết lập</p>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            Nhấn vào button "Thêm bước mới" bên trên để bắt đầu xây dựng kịch bản cho Chatbot của bạn.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => openEdit()}
                        className="mt-2 rounded-xl border-dashed hover:border-solid hover:bg-background transition-all"
                    >
                        Bắt đầu ngay
                    </Button>
                </div>
            )}
        </div>
    );
}
