
import { FloatingCard, FloatingCardContent, FloatingCardHeader, FloatingCardTitle } from '@/components/custom/FloatingCard';
import { MapPin } from 'lucide-react';


interface RegionStats {
    region: string;
    country: string;
    spend: number;
    impressions: number;
    clicks: number;
    results: number;
}

interface Props {
    data: RegionStats[];
    loading?: boolean;
}

export function RegionBreakdownList({ data, loading }: Props) {
    if (loading) {
        return (
            <FloatingCard className="animate-pulse">
                <div className="h-64 bg-muted/50 rounded-lg" />
            </FloatingCard>
        );
    }

    // Sort by spend descending
    const sortedData = [...data].sort((a, b) => b.spend - a.spend);
    const maxSpend = sortedData.length > 0 ? sortedData[0].spend : 1;

    const formatMoney = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

    return (
        <FloatingCard padding="none">
            <FloatingCardHeader className="p-4 border-b border-border/30">
                <FloatingCardTitle className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    Top Khu vực / Vùng (Theo chi phí)
                </FloatingCardTitle>
            </FloatingCardHeader>
            <FloatingCardContent className="p-0 h-[350px]">
                {sortedData.length > 0 ? (
                    <div className="h-[300px] overflow-y-auto pr-4">
                        <div className="flex flex-col">
                            {sortedData.map((item, index) => {
                                const percent = (item.spend / maxSpend) * 100;
                                return (
                                    <div key={index} className="flex items-center p-3 border-b border-border/10 hover:bg-muted/30 transition-colors text-sm relative group overflow-hidden">
                                        {/* Background bar */}
                                        <div
                                            className="absolute left-0 top-0 bottom-0 bg-emerald-500/5 transition-all duration-500"
                                            style={{ width: `${percent}%` }}
                                        />

                                        <div className="w-8 font-mono text-muted-foreground/70 text-xs z-10">{index + 1}</div>
                                        <div className="flex-1 z-10">
                                            <div className="font-medium text-foreground">{item.region || 'Unknown'}</div>
                                            <div className="text-xs text-muted-foreground">{item.country}</div>
                                        </div>
                                        <div className="text-right z-10 space-y-0.5">
                                            <div className="font-bold text-emerald-400 font-mono">{formatMoney(item.spend)}</div>
                                            <div className="text-xs text-muted-foreground flex gap-2 justify-end">
                                                <span>{(item.results ?? 0).toLocaleString()} results</span>
                                                <span className="text-muted-foreground/50">|</span>
                                                <span>{(item.impressions ?? 0).toLocaleString()} imp</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        Chưa có dữ liệu phân tích
                    </div>
                )}
            </FloatingCardContent>
        </FloatingCard>
    );
}
