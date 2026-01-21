import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAdsets } from '@/hooks/useAdSets';
import { useAds } from '@/hooks/useAds';
import { campaignsApi, adsApi } from '@/api';
import { usePlatform } from '@/contexts';
import { useAdAccounts, BranchFilter } from '@/features/adAccounts';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Megaphone, ChevronDown, ChevronRight, SlidersHorizontal, LineChart } from 'lucide-react';
import { HourlyInsightsDialog } from './HourlyInsightsDialog';
import { LoadingPage, EmptyState, PlatformIcon } from '@/components/custom';

export function CampaignsPage() {
  const queryClient = useQueryClient();
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingCampaign, setSyncingCampaign] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [expandedAdSet, setExpandedAdSet] = useState<string | null>(null);
  const [selectedAdForHourly, setSelectedAdForHourly] = useState<{ id: string, name: string } | null>(null);
  const { activePlatform } = usePlatform();

  const { data: accounts } = useAdAccounts();

  const { data: campaigns, isLoading } = useCampaigns({
    accountId: selectedAccount === 'all' ? undefined : selectedAccount,
    effectiveStatus: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
    branchId: selectedBranch === 'all' ? undefined : selectedBranch,
  });

  const filteredData = campaigns?.filter(campaign => {
    if (activePlatform === 'all') return true;
    return (campaign as any).account?.platform?.code === activePlatform || (activePlatform === 'facebook' && !(campaign as any).account?.platform);
  });

  const handleSyncAllActive = async () => {
    if (!accounts || accounts.length === 0) {
      toast.error('Không có tài khoản nào');
      return;
    }
    setSyncingAll(true);
    try {
      await Promise.all(accounts.map(account => campaignsApi.syncAccount(account.id)));
      toast.success(`Đã hoàn thành sync Campaigns cho ${accounts.length} tài khoản`);
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    } catch {
      toast.error('Lỗi sync');
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncCampaign = async (campaign: any) => {
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
  };

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'ACTIVE') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (s === 'PAUSED') return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
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
          <h1 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            Campaign Manager
          </h1>
          <p className="text-slate-600">Quản lý và tối ưu campaigns với drill-down analysis</p>
        </div>
        <div className="flex gap-3">
          <BranchFilter value={selectedBranch} onChange={setSelectedBranch} />
          <Button variant="outline" onClick={handleSyncAllActive} disabled={syncingAll || !accounts?.length}>
            {syncingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Sync All
          </Button>
        </div>
      </div>

      {/* Custom Filters section could be simplified here for brevity or kept as is */}

      <div className="space-y-4">
        {filteredData?.length === 0 ? (
          <EmptyState
            icon={<Megaphone className="h-8 w-8" />}
            title="Không tìm thấy campaign"
            description="Hãy chạy sync hoặc thay đổi bộ lọc"
            className="py-12"
          />
        ) : (
          filteredData?.map((campaign: any) => (
            <CampaignRow
              key={campaign.id}
              campaign={campaign}
              isExpanded={expandedCampaign === campaign.id}
              onToggle={() => setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)}
              getStatusColor={getStatusColor}
              handleSync={handleSyncCampaign}
              isSyncing={syncingCampaign === campaign.id}
              expandedAdSet={expandedAdSet}
              setExpandedAdSet={setExpandedAdSet}
              onViewHourly={setSelectedAdForHourly}
            />
          ))
        )}
      </div>

      <HourlyInsightsDialog
        open={!!selectedAdForHourly}
        onOpenChange={(open) => !open && setSelectedAdForHourly(null)}
        adId={selectedAdForHourly?.id || ''}
        adName={selectedAdForHourly?.name || ''}
      />
    </div>
  );
}

function CampaignRow({ campaign, isExpanded, onToggle, getStatusColor, handleSync, isSyncing, expandedAdSet, setExpandedAdSet, onViewHourly }: any) {
  const { data: adSets, isLoading: loadingAdSets } = useAdsets({ campaignId: campaign.id });

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
                    Synced: {new Date(campaign.syncedAt).toLocaleString()}
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
                <p className="font-bold">{campaign.dailyBudget ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(campaign.dailyBudget)) : 'N/A'}</p>
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
            Ad Sets {loadingAdSets ? <Loader2 className="w-3 h-3 animate-spin" /> : `(${adSets?.length || 0})`}
          </h4>
          <div className="space-y-3">
            {adSets?.map((adSet: any) => (
              <AdSetRow
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

function AdSetRow({ adSet, isExpanded, onToggle, getStatusColor, onViewHourly }: any) {
  const { data: ads, isLoading: loadingAds } = useAds({ adsetId: adSet.id });

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      <div className="p-4">
        {/* ... existing header ... */}
      </div>

      {isExpanded && (
        <div className="border-t border-border/50 bg-muted/10 p-4">
          <h6 className="font-medium mb-3 text-xs text-muted-foreground flex items-center gap-2">
            Ads {loadingAds ? <Loader2 className="w-3 h-3 animate-spin" /> : `(${ads?.length || 0})`}
          </h6>
          <div className="space-y-2">
            {ads?.map((ad: any) => (
              <div key={ad.id} className="bg-muted/30 rounded-lg border border-border/30 p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      {ad.thumbnailUrl && (
                        <img src={ad.thumbnailUrl} alt="" className="w-8 h-8 rounded object-cover" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h6 className="font-medium text-xs">{ad.name}</h6>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 ml-1"
                            title="View Hourly Insights"
                            onClick={() => onViewHourly({ id: ad.id, name: ad.name })}
                          >
                            <LineChart className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 uppercase font-bold tracking-wider">{ad.status}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(ad.status)}`}>
                    {ad.status}
                  </span>
                </div>
                <MetricsDisplay stats={ad.stats} compact />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricsDisplay({ stats, compact }: { stats: any, compact?: boolean }) {
  if (!stats) return null;

  // Ensure numbers
  const spend = Number(stats.spend || 0);
  const impressions = Number(stats.impressions || 0);
  const clicks = Number(stats.clicks || 0);
  const results = Number(stats.results || 0);

  const cpm = impressions ? (spend / impressions) * 1000 : 0;
  const cpc = clicks ? spend / clicks : 0;
  const ctr = impressions ? (clicks / impressions) * 100 : 0;
  const cpr = results ? spend / results : 0;

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);
  const formatNumber = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  if (compact) {
    return (
      <div className="grid grid-cols-5 gap-2 text-[10px] bg-background/50 p-2 rounded border border-border/20">
        <div>
          <span className="text-muted-foreground block">Spend</span>
          <span className="font-bold">{formatCurrency(spend)}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Results</span>
          <span className="font-bold">{formatNumber(results)}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Cost/Res</span>
          <span className="font-bold">{formatCurrency(cpr)}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">CTR</span>
          <span className="font-bold">{ctr.toFixed(2)}%</span>
        </div>
        <div>
          <span className="text-muted-foreground block">CPM</span>
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
