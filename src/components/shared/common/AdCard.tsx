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
    accountId: string | number;
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
        "card p-0 overflow-hidden flex flex-col group hover:scale-[1.02] active:scale-[0.98]",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Thumbnail / Preview */}
      <div className="relative aspect-video bg-b-surface1 overflow-hidden">
        {ad.thumbnailUrl ? (
          <img
            src={ad.thumbnailUrl}
            alt={ad.name || 'Ad preview'}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-t-tertiary gap-2">
            <ImageIcon className="size-10 opacity-20" />
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">No Preview</span>
          </div>
        )}

        {/* Status Badge - Overlay */}
        <div className="absolute top-4 left-4">
          <Badge
            variant={statusVariant}
            className={cn(
              "h-6 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-lg border-white/10",
              status === 'ACTIVE' ? "bg-primary-02/90 text-white" : "bg-shade-05/80 text-white"
            )}
          >
            {status}
          </Badge>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-shade-01/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <Button variant="secondary" size="sm" className="rounded-full shadow-xl">
            Xem chi tiết
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col space-y-4">
        {/* Title */}
        <div className="min-h-10">
          <h3 className="text-sub-title-2 text-t-primary line-clamp-2 leading-tight group-hover:text-primary-01 transition-colors" title={ad.name || ''}>
            {ad.name || 'Untitled Ad'}
          </h3>
          <p className="text-[10px] text-t-tertiary mt-1 font-mono tracking-tighter opacity-70">
            ID: {ad.id}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 py-3 border-y border-s-subtle/30">
          <div className="space-y-1">
            <p className="text-overline text-t-tertiary uppercase tracking-widest leading-none font-bold">Results</p>
            <p className="text-body-1 font-bold text-t-primary">{formatNumber(ad.metrics?.results || 0)}</p>
            <p className="text-[10px] font-medium text-t-tertiary bg-b-surface1 px-1.5 py-0.5 rounded-lg w-fit">
              {formatCurrency(ad.metrics?.costPerResult || 0)}/res
            </p>
          </div>
          <div className="space-y-1 border-l border-s-subtle/30 pl-4">
            <p className="text-overline text-t-tertiary uppercase tracking-widest leading-none font-bold">Leads</p>
            <p className="text-body-1 font-bold text-t-primary">{formatNumber(ad.metrics?.messagingStarted || 0)}</p>
            <p className="text-[10px] font-medium text-t-tertiary bg-b-surface1 px-1.5 py-0.5 rounded-lg w-fit">
              {formatCurrency(ad.metrics?.costPerMessaging || 0)}/msg
            </p>
          </div>
        </div>

        {/* Action & Meta */}
        <div className="mt-auto space-y-3 pt-1">
          <div className="flex items-center justify-between text-[10px] text-t-tertiary font-medium">
            <span className="flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", status === 'ACTIVE' ? "bg-primary-02" : "bg-shade-05")} />
              {ad.syncedAt ? new Date(ad.syncedAt).toLocaleDateString('vi-VN') : 'Never'}
            </span>
            <span className="opacity-60">{ad.accountId}</span>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onSyncInsights();
            }}
            disabled={isSyncing}
            className="w-full h-9 bg-b-surface1 border border-s-subtle hover:bg-b-surface2 hover:border-s-stroke2 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all"
          >
            {isSyncing ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5 mr-2" />
            )}
            {isSyncing ? 'Syncing...' : 'Sync Insights'}
          </Button>
        </div>
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
