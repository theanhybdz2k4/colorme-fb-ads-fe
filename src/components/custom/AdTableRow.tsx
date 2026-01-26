import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Image as ImageIcon, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdTableRowProps {
    ad: {
        id: string;
        name?: string | null;
        status?: string | null;
        effectiveStatus?: string | null;
        syncedAt: string;
        accountId: string | number;
        thumbnailUrl?: string | null;
        metrics?: {
            spend: number;
            impressions: number;
            clicks: number;
            results: number;
        };
    };
    statusVariant: "default" | "secondary" | "destructive" | "outline";
    onSyncInsights: () => void;
    isSyncing: boolean;
    className?: string;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value);
};

const formatNumber = (value: number) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return new Intl.NumberFormat('vi-VN').format(value);
};

export function AdTableRow({
    ad,
    statusVariant,
    onSyncInsights,
    isSyncing,
    className,
}: AdTableRowProps) {
    const navigate = useNavigate();
    const status = ad.effectiveStatus || ad.status || 'UNKNOWN';

    return (
        <tr
            className={cn(
                "border-b border-border/30 transition-colors",
                "hover:bg-muted/20 cursor-pointer",
                className
            )}
            onClick={() => navigate(`/ads/${ad.id}`)}
        >
            {/* Thumbnail + Name */}
            <td className="py-2 px-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-muted/30 overflow-hidden shrink-0">
                        {ad.thumbnailUrl ? (
                            <img
                                src={ad.thumbnailUrl}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 opacity-30" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium text-sm truncate max-w-[280px]" title={ad.name || ''}>
                            {ad.name || 'Untitled'}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                            {ad.id.substring(0, 8)}...
                        </p>
                    </div>
                </div>
            </td>

            {/* Status */}
            <td className="py-2 px-3">
                <Badge variant={statusVariant} className="text-xs">
                    {status}
                </Badge>
            </td>

            {/* Spend */}
            <td className="py-2 px-3 text-right">
                <span className="text-sm font-medium">{formatCurrency(ad.metrics?.spend || 0)}</span>
            </td>

            {/* Impressions */}
            <td className="py-2 px-3 text-right">
                <span className="text-sm text-muted-foreground">{formatNumber(ad.metrics?.impressions || 0)}</span>
            </td>

            {/* Clicks */}
            <td className="py-2 px-3 text-right">
                <span className="text-sm text-muted-foreground">{formatNumber(ad.metrics?.clicks || 0)}</span>
            </td>

            {/* Results */}
            <td className="py-2 px-3 text-right">
                <span className="text-sm font-semibold text-primary">{formatNumber(ad.metrics?.results || 0)}</span>
            </td>

            {/* CTR */}
            <td className="py-2 px-3 text-right">
                <span className="text-sm text-muted-foreground">
                    {ad.metrics?.impressions ? ((ad.metrics.clicks / ad.metrics.impressions) * 100).toFixed(2) : '0.00'}%
                </span>
            </td>

            {/* Actions */}
            <td className="py-2 px-3">
                <div className="flex items-center gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSyncInsights();
                        }}
                        disabled={isSyncing}
                        className="h-7 w-7"
                    >
                        {isSyncing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <RefreshCw className="h-3.5 w-3.5" />
                        )}
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/ads/${ad.id}`);
                        }}
                        className="h-7 w-7"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}

// Table container
interface AdTableProps {
    children: React.ReactNode;
    className?: string;
}

export function AdTable({ children, className }: AdTableProps) {
    return (
        <div className={cn("overflow-x-auto", className)}>
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">
                        <th className="py-3 px-3 text-left font-medium">Quảng cáo</th>
                        <th className="py-3 px-3 text-left font-medium">Trạng thái</th>
                        <th className="py-3 px-3 text-right font-medium">Chi tiêu</th>
                        <th className="py-3 px-3 text-right font-medium">Impressions</th>
                        <th className="py-3 px-3 text-right font-medium">Clicks</th>
                        <th className="py-3 px-3 text-right font-medium">Results</th>
                        <th className="py-3 px-3 text-right font-medium">CTR</th>
                        <th className="py-3 px-3 text-center font-medium w-20"></th>
                    </tr>
                </thead>
                <tbody>
                    {children}
                </tbody>
            </table>
        </div>
    );
}
