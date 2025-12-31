import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Image as ImageIcon } from "lucide-react";

interface AdCompactRowProps {
    ad: {
        id: string;
        name?: string | null;
        status?: string | null;
        effectiveStatus?: string | null;
        syncedAt: string;
        accountId: string;
        thumbnailUrl?: string | null;
    };
    statusVariant: "default" | "secondary" | "destructive" | "outline";
    onSyncInsights: () => void;
    isSyncing: boolean;
    className?: string;
}

export function AdCompactRow({
    ad,
    statusVariant,
    onSyncInsights,
    isSyncing,
    className,
}: AdCompactRowProps) {
    const status = ad.effectiveStatus || ad.status || 'UNKNOWN';

    return (
        <div
            className={cn(
                "flex items-center gap-4 p-3 rounded-lg",
                "bg-card border border-border/30",
                "transition-all duration-200",
                "hover:bg-muted/30 hover:border-border/50",
                className
            )}
        >
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-md bg-muted/30 overflow-hidden shrink-0">
                {ad.thumbnailUrl ? (
                    <img
                        src={ad.thumbnailUrl}
                        alt={ad.name || 'Ad preview'}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-6 w-6 opacity-30" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-foreground truncate">
                        {ad.name || 'Untitled Ad'}
                    </h3>
                    <Badge variant={statusVariant} className="text-xs shrink-0">
                        {status}
                    </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-mono">{ad.id}</span>
                    <span>•</span>
                    <span>Synced: {new Date(ad.syncedAt).toLocaleDateString('vi-VN')}</span>
                </div>
            </div>

            {/* Action */}
            <Button
                size="sm"
                variant="outline"
                onClick={onSyncInsights}
                disabled={isSyncing}
                className="shrink-0 bg-muted/30 border-border/50 hover:bg-muted/50"
            >
                {isSyncing ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Sync
            </Button>
        </div>
    );
}

// List container for compact rows
interface AdCompactListProps {
    children: React.ReactNode;
    className?: string;
}

export function AdCompactList({ children, className }: AdCompactListProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {children}
        </div>
    );
}
