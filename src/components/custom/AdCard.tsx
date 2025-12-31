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
    // Optional creative data
    thumbnailUrl?: string | null;
  };
  statusVariant: "default" | "secondary" | "destructive" | "outline";
  onSyncInsights: () => void;
  isSyncing: boolean;
  className?: string;
}

export function AdCard({
  ad,
  statusVariant,
  onSyncInsights,
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
        className
      )}
    >
      {/* Thumbnail / Preview */}
      <div className="relative aspect-video bg-muted/30 rounded-t-lg overflow-hidden">
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
        <div>
          <h3 className="font-medium text-foreground line-clamp-2 leading-tight">
            {ad.name || 'Untitled Ad'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {ad.id}
          </p>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Synced: {new Date(ad.syncedAt).toLocaleDateString('vi-VN')}</span>
        </div>

        {/* Action */}
        <Button
          size="sm"
          variant="outline"
          onClick={onSyncInsights}
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
