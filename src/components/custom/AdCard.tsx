import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Image as ImageIcon } from "lucide-react";

interface AdCardProps {
  ad: {
    id: string;
    name?: string | null;
    status?: string | null;
    effectiveStatus?: string | null;
    syncedAt: string;
    accountId: string;
    thumbnailUrl?: string | null;
    metrics?: {
      results: number;
      costPerResult: number;
      messagingStarted: number;
      costPerMessaging: number;
    };
  };
  statusVariant: "default" | "secondary" | "destructive" | "outline";
  onSyncInsights: () => void;
  onClick?: () => void;
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
  return new Intl.NumberFormat('vi-VN').format(value);
};

export function AdCard({
  ad,
  statusVariant,
  onSyncInsights,
  onClick,
  isSyncing,
  className,
}: AdCardProps) {
  const status = ad.effectiveStatus || ad.status || 'UNKNOWN';

  return (
    <div
      className={cn(
        "group rounded-lg bg-card border border-border/50",
        "shadow-lg transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl hover:border-border/80",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Thumbnail / Preview - Clickable */}
      <div 
        className="relative aspect-video bg-muted/30 rounded-t-lg overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        {ad.thumbnailUrl ? (
          <img
            src={ad.thumbnailUrl}
            alt={ad.name || 'Ad preview'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 opacity-30" />
          </div>
        )}
        
        {/* Status Badge - Overlay */}
        <div className="absolute top-2 left-2">
          <Badge variant={statusVariant} className="text-xs">
            {status}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="min-h-[3rem]">
          <h3 className="font-medium text-foreground line-clamp-2 leading-tight" title={ad.name || ''}>
            {ad.name || 'Untitled Ad'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {ad.id}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-border/30">
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Result</p>
            <p className="text-sm font-semibold">{formatNumber(ad.metrics?.results || 0)}</p>
            <p className="text-[10px] text-muted-foreground">{formatCurrency(ad.metrics?.costPerResult || 0)}/res</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Msg</p>
            <p className="text-sm font-semibold">{formatNumber(ad.metrics?.messagingStarted || 0)}</p>
            <p className="text-[10px] text-muted-foreground">{formatCurrency(ad.metrics?.costPerMessaging || 0)}/msg</p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Synced: {new Date(ad.syncedAt).toLocaleDateString('vi-VN')}</span>
        </div>

        {/* Action */}
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onSyncInsights();
          }}
          disabled={isSyncing}
          className="w-full bg-muted/30 border-border/50 hover:bg-muted/50"
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Sync Insights
        </Button>
      </div>
    </div>
  );
}

// Grid container for cards
interface AdCardGridProps {
  children: React.ReactNode;
  className?: string;
}

export function AdCardGrid({ children, className }: AdCardGridProps) {
  return (
    <div className={cn(
      "grid gap-4",
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      className
    )}>
      {children}
    </div>
  );
}
