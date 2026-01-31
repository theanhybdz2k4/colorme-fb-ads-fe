import { useState, useMemo, memo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAdsets } from '@/hooks/useAdSets';
import { useAds } from '@/hooks/useAds';
import { useInsights } from '@/hooks/useInsights';
import { campaignsApi, adsApi } from '@/api';
import { usePlatform } from '@/contexts';
import { useAdAccounts, BranchFilter } from '@/features/adAccounts';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Megaphone, ChevronDown, ChevronRight, SlidersHorizontal, LineChart, Calendar } from 'lucide-react';
import { HourlyInsightsDialog } from './HourlyInsightsDialog';
import { LoadingPage, EmptyState, PlatformIcon } from '@/components/custom';

export function CampaignsPage() {
  const queryClient = useQueryClient();
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingCampaign, setSyncingCampaign] = useState<string | null>(null);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [expandedAdSet, setExpandedAdSet] = useState<string | null>(null);
  const [selectedAdForHourly, setSelectedAdForHourly] = useState<{ id: string, name: string, date?: Date } | null>(null);
  const { activePlatform } = usePlatform();

  const { data: accounts } = useAdAccounts();

  // Calculate 7 days ago
  const dateStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }, []);

  const dateEnd = useMemo(() => new Date().toISOString().split('T')[0], []);

  const { data: campaigns, isLoading } = useCampaigns({
    accountId: undefined,
    effectiveStatus: 'ACTIVE',
    branchId: selectedBranch === 'all' ? undefined : selectedBranch,
    dateStart,
    dateEnd,
  });

  const { data: adSets, isLoading: isLoadingAdSets } = useAdsets({
    campaignId: expandedCampaign || undefined
  });

  // Filter and Sort Data
  const filteredAndSortedData = useMemo(() => {
    if (!campaigns) return [];

    // 1. Filter by Platform
    let filtered = campaigns.filter(campaign => {
      if (activePlatform === 'all') return true;
      return (campaign as any).account?.platform?.code === activePlatform || (activePlatform === 'facebook' && !(campaign as any).account?.platform);
    });

    // 2. Sort: Active & Has Data first, then Active & No Data
    // "Has Data" usually means spend > 0 or impressions > 0 in the requested period.
    // Since backend now returns stats for the requested period (7 days), we can use that directly.

    return filtered.sort((a: any, b: any) => {
      const aHasData = (a.stats?.spend > 0 || a.stats?.impressions > 0);
      const bHasData = (b.stats?.spend > 0 || b.stats?.impressions > 0);

      if (aHasData && !bHasData) return -1; // a comes first
      if (!aHasData && bHasData) return 1;  // b comes first

      // If both have data or both dont, maybe sort by spend desc?
      if (aHasData && bHasData) {
        return (b.stats?.spend || 0) - (a.stats?.spend || 0);
      }

      return 0; // maintain original order (usually by createdAt desc)
    });

  }, [campaigns, activePlatform]);

  const handleSyncAllActive = useCallback(async () => {
    if (!accounts || accounts.length === 0) {
      toast.error('Không có tài khoản nào');
      return;
    }
    setSyncingAll(true);
    try {
      await Promise.all(accounts.map(account => campaignsApi.syncAccount(account.id)));
      toast.success(`Đã hoàn thành sync Campaigns cho các tài khoản`);
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    } catch {
      toast.error('Lỗi sync');
    } finally {
      setSyncingAll(false);
    }
  }, [accounts, queryClient]);

  const handleSyncCampaign = useCallback(async (campaign: any) => {
    setSyncingCampaign(campaign.id);
    try {
      await Promise.all([
        campaignsApi.syncAccount(campaign.accountId),
        adsApi.syncAccount(campaign.accountId)
      ]);
      toast.success('Đã hoàn thành sync dữ liệu chiến dịch');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['adsets'] });
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    } catch {
      toast.error('Lỗi sync');
    } finally {
      setSyncingCampaign(null);
    }
  }, [queryClient]);

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'ACTIVE') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (s === 'PAUSED') return 'bg-muted text-muted-foreground border-border/20';
    if (s === 'ARCHIVED') return 'bg-red-500/10 text-red-500 border-red-500/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r bg-clip-text mb-2">
            Campaign Manager
          </h1>
          <p className="text-muted-foreground">Quản lý và tối ưu campaigns với drill-down analysis</p>
        </div>
        <div className="flex gap-3">
          <BranchFilter value={selectedBranch} onChange={setSelectedBranch} />
          <Button variant="outline" onClick={handleSyncAllActive} disabled={syncingAll || !accounts?.length}>
            {syncingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Sync All
          </Button>
        </div>
      </div>

      {/* Active Count & Date Range Info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg border border-muted">
        <span className="font-semibold text-foreground">{filteredAndSortedData.length}</span> Active Campaigns
        <span className="mx-2">•</span>
        <Calendar className="w-4 h-4" />
        <span>Stats: Last 7 Days</span>
      </div>

      <div className="space-y-4">
        {filteredAndSortedData?.length === 0 ? (
          <EmptyState
            icon={<Megaphone className="h-8 w-8" />}
            title="Không tìm thấy campaign"
            description="Hãy chạy sync hoặc thay đổi bộ lọc"
            className="py-12"
          />
        ) : (
          filteredAndSortedData?.map((campaign: any) => (
            <CampaignRow
              key={campaign.id}
              campaign={campaign}
              isExpanded={expandedCampaign === campaign.id}
              onToggle={() => setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)}
              getStatusColor={getStatusColor}
              handleSync={handleSyncCampaign}
              isSyncing={syncingCampaign === campaign.id}
              adSets={expandedCampaign === campaign.id ? adSets : undefined}
              isLoadingAdSets={isLoadingAdSets}
              expandedAdSet={expandedAdSet}
              setExpandedAdSet={setExpandedAdSet}
              onViewHourly={(ad: any) => setSelectedAdForHourly(ad)}
            />
          ))
        )}
      </div>

      {selectedAdForHourly && (
        <HourlyInsightsDialog
          open={!!selectedAdForHourly}
          onOpenChange={(open) => !open && setSelectedAdForHourly(null)}
          adId={selectedAdForHourly.id}
          adName={selectedAdForHourly.name}
          initialDate={selectedAdForHourly.date}
        />
      )}
    </div>
  );
}

function CampaignRow({
  campaign,
  isExpanded,
  onToggle,
  getStatusColor,
  handleSync,
  isSyncing,
  adSets,
  isLoadingAdSets,
  expandedAdSet,
  setExpandedAdSet,
  onViewHourly
}: any) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-lg transition-all">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <button onClick={onToggle} className="p-2 hover:bg-muted/50 rounded-lg transition-colors shrink-0">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>

          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shadow-sm shrink-0">
            <PlatformIcon platformCode={campaign.account?.platform?.code || 'facebook'} size={24} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg mb-1">{campaign.name}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-muted/50 text-muted-foreground uppercase">
                    {campaign.objective}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Synced: {new Date(campaign.account?.syncedAt || campaign.syncedAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => handleSync(campaign)} disabled={isSyncing}>
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-2">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Budget</p>
                <p className="font-bold">{campaign.dailyBudget ? formatCurrency(campaign.dailyBudget) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Status</p>
                <p className="font-bold">{campaign.effectiveStatus || campaign.status}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Account</p>
                <p className="font-medium text-xs truncate">{campaign.account?.name || campaign.accountId}</p>
              </div>
            </div>

            <MetricsDisplay stats={campaign.stats} />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border/50 bg-muted/20 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2 text-sm text-foreground/80">
            <SlidersHorizontal className="w-4 h-4" />
            Ad Sets {isLoadingAdSets ? <Loader2 className="w-3 h-3 animate-spin" /> : `(${adSets?.length || 0})`}
          </h4>
          <div className="space-y-3">
            {adSets?.map((adSet: any) => (
              <MemoizedAdSetRow
                key={adSet.id}
                adSet={adSet}
                isExpanded={expandedAdSet === adSet.id}
                onToggle={() => setExpandedAdSet(expandedAdSet === adSet.id ? null : adSet.id)}
                getStatusColor={getStatusColor}
                onViewHourly={onViewHourly}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const AdSetRow = memo(function AdSetRowComponent({ adSet, isExpanded, onToggle, getStatusColor, onViewHourly }: any) {
  const { data: ads, isLoading: loadingAds } = useAds({
    adsetId: isExpanded ? adSet.id : undefined
  });

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
      <div className="p-4 flex items-center gap-3">
        <button onClick={onToggle} className="p-1.5 hover:bg-muted/50 rounded-lg transition-colors shrink-0">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">{adSet.name}</h4>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(adSet.status)}`}>
                {adSet.status}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Synced: {new Date(adSet.campaign?.account?.syncedAt || adSet.syncedAt).toLocaleString()}
              </span>
            </div>
          </div>
          <MetricsDisplay stats={adSet.stats} compact />
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border/50 bg-muted/10 p-4">
          <h6 className="font-medium mb-3 text-xs text-muted-foreground flex items-center gap-2">
            Ads {loadingAds ? <Loader2 className="w-3 h-3 animate-spin" /> : `(${ads?.length || 0})`}
          </h6>
          <div className="space-y-3">
            {ads?.map((ad: any) => (
              <MemoizedAdRow
                key={ad.id}
                ad={ad}
                getStatusColor={getStatusColor}
                onViewHourly={onViewHourly}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const MemoizedAdSetRow = memo(AdSetRow);

const AdRow = memo(function AdRowComponent({ ad, getStatusColor, onViewHourly }: any) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch insights only when expanded
  const adInsights = useInsights({
    accountId: ad.accountId?.toString(),
    dateStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 7 days
    dateEnd: new Date().toISOString().split('T')[0],
    enabled: isExpanded
  });

  const adDailyData = useMemo(() => {
    if (!adInsights.data || !isExpanded) return [];
    return (adInsights.data as any[]).filter(i => (i.adId || i.unified_ad_id) === ad.id);
  }, [adInsights.data, ad.id, isExpanded]);

  return (
    <div className="bg-muted/30 rounded-lg border border-border/30 overflow-hidden">
      <div className="p-3 flex items-start gap-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-muted/50 rounded transition-colors mt-1"
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {ad.thumbnailUrl && (
                <img src={ad.thumbnailUrl} alt="" className="w-10 h-10 rounded object-cover shadow-sm border border-border/50" />
              )}
              <div>
                <h6 className="font-medium text-xs truncate max-w-[200px]">{ad.name}</h6>
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{ad.status}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(ad.status)}`}>
                {ad.status}
              </span>
              <span className="text-[9px] text-muted-foreground">
                {new Date(ad.account?.syncedAt || ad.syncedAt).toLocaleString()}
              </span>
            </div>
          </div>
          <MetricsDisplay stats={ad.stats} compact />
        </div>
      </div>

      {isExpanded && (
        <div className="bg-background/40 border-t border-border/20 p-3 animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Chỉ số theo ngày (7 ngày qua)
            </span>
            {adInsights.isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </div>

          <div className="space-y-1.5">
            {adDailyData.length > 0 && (
              <div className="grid grid-cols-6 gap-2 text-[9px] font-bold text-muted-foreground/70 px-2 pb-1 border-b border-border/10 mb-1 uppercase tracking-wider">
                <div>Ngày</div>
                <div>Chi phí</div>
                <div>Kết quả</div>
                <div>Giá/KQ</div>
                <div>CTR</div>
                <div className="text-right">Thao tác</div>
              </div>
            )}
            {adDailyData.length === 0 && !adInsights.isLoading ? (
              <p className="text-[10px] text-muted-foreground italic text-center py-2">Chưa có dữ liệu chi tiết cho 7 ngày qua</p>
            ) : (
              adDailyData.map((day: any) => (
                <div key={day.id} className="grid grid-cols-6 gap-2 text-[10px] items-center p-2 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border/30">
                  <div className="font-medium text-foreground">
                    {new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                  </div>
                  <div className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(day.spend)}</div>
                  <div className="font-bold">{day.results} mess</div>
                  <div>{formatCurrency(day.results ? day.spend / day.results : 0)}/cp</div>
                  <div>{((day.clicks / (day.impressions || 1)) * 100).toFixed(2)}%</div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[9px] hover:bg-blue-500/10 hover:text-blue-600 font-bold gap-1"
                      onClick={() => onViewHourly({ id: ad.id, name: ad.name, date: new Date(day.date) })}
                    >
                      <LineChart className="w-3 h-3" />
                      Phân tích giờ
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});

const MemoizedAdRow = memo(AdRow);

function MetricsDisplay({ stats, compact }: { stats: any, compact?: boolean }) {
  if (!stats) return null;

  const spend = Number(stats.spend || 0);
  const impressions = Number(stats.impressions || 0);
  const clicks = Number(stats.clicks || 0);
  const results = Number(stats.results || 0);

  const cpm = impressions ? (spend / impressions) * 1000 : 0;
  const cpc = clicks ? spend / clicks : 0;
  const ctr = impressions ? (clicks / impressions) * 100 : 0;
  const cpr = results ? spend / results : 0;

  if (compact) {
    return (
      <div className="grid grid-cols-5 gap-2 text-[10px] bg-background/50 p-2 rounded border border-border/20">
        <div>
          <span className="text-muted-foreground block text-[8px] uppercase font-bold">Spend</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(spend)}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[8px] uppercase font-bold">Results</span>
          <span className="font-bold">{formatNumber(results)}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[8px] uppercase font-bold">Cost/Res</span>
          <span className="font-bold italic">{formatCurrency(cpr)}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[8px] uppercase font-bold">CTR</span>
          <span className="font-bold">{ctr.toFixed(2)}%</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[8px] uppercase font-bold">CPM</span>
          <span className="font-bold">{formatCurrency(cpm)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4 bg-muted/30 p-4 rounded-xl border border-border/40">
      <div>
        <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Spend</p>
        <p className="font-bold text-sm text-blue-600 dark:text-blue-400">{formatCurrency(spend)}</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Results (Mess)</p>
        <p className="font-bold text-sm">{formatNumber(results)}</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Cost / Result</p>
        <p className="font-bold text-sm">{formatCurrency(cpr)}</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">CTR</p>
        <p className="font-bold text-sm">{ctr.toFixed(2)}%</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">CPC</p>
        <p className="font-bold text-sm">{formatCurrency(cpc)}</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">CPM</p>
        <p className="font-bold text-sm">{formatCurrency(cpm)}</p>
      </div>
    </div>
  );
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);
}

function formatNumber(val: number) {
  return new Intl.NumberFormat('vi-VN').format(val);
}
