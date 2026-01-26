import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAds, useDebounce } from '@/hooks';
import { adsApi, adDetailApi } from '@/api';
import { AD_STATUS_OPTIONS, getAdStatusVariant, type Ad } from '@/types/ads.types';
import { usePlatform } from '@/contexts';
import { useAdsets } from '@/hooks/useAdSets';
import { BranchFilter } from '@/features/adAccounts';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { DateRangeFilter } from '@/components/custom/DateRangeFilter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, RefreshCw, FileText } from 'lucide-react';
import { PageHeader } from '@/components/custom/PageHeader';
import { FilterBar } from '@/components/custom/FilterBar';
import { FloatingCard, FloatingCardHeader, FloatingCardTitle, FloatingCardContent } from '@/components/custom/FloatingCard';
import { LoadingPage } from '@/components/custom/LoadingState';
import { EmptyState } from '@/components/custom/EmptyState';
import { ViewToggle } from '@/components/custom/ViewToggle';
import { useViewPreference } from '@/hooks/useViewPreference';
import { AdCard, AdCardGrid } from '@/components/custom/AdCard';
import { AdTable, AdTableRow } from '@/components/custom/AdTableRow';
import { PlatformIcon } from '@/components/custom/PlatformIcon';
import { getVietnamDateString } from '@/lib/utils';

// Platform filter moved to global PlatformContext (header tabs)

export { AdDetailPage } from './sections/AdDetailPage';

export function AdsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAdset, setSelectedAdset] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingAd, setSyncingAd] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [activePreset, setActivePreset] = useState<string | null>('today');
  const { activePlatform } = usePlatform();
  
  const debouncedSearch = useDebounce(searchQuery, 600);

  // View toggle with localStorage persistence
  const [viewMode, setViewMode] = useViewPreference('ads-page', 'grid');

  const { data: adsets } = useAdsets({
    effectiveStatus: 'ACTIVE',
    branchId: selectedBranch === 'all' ? undefined : selectedBranch,
  });

  const { data, isLoading, isFetching } = useAds({
    adsetId: selectedAdset === 'all' ? undefined : selectedAdset,
    effectiveStatus: statusFilter === 'all' ? undefined : statusFilter,
    search: debouncedSearch || undefined,
    branchId: selectedBranch === 'all' ? undefined : selectedBranch,
    dateStart: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    dateEnd: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  });

  const filteredData = data?.filter(ad => {
    if (activePlatform === 'all') return true;
    return (ad as any).account?.platform?.code === activePlatform || (activePlatform === 'facebook' && !(ad as any).account?.platform);
  });

  const handleSyncAllActive = async () => {
    setSyncingAll(true);
    try {
      if (!adsets || adsets.length === 0) {
        toast.error('Không có adsets nào để sync');
        return;
      }

      const accountIds = Array.from(new Set(adsets.map(a => a.accountId)));
      await Promise.all(accountIds.map(accountId => adsApi.syncAccount(accountId)));

      toast.success(`Đã hoàn thành sync Ads cho ${accountIds.length} tài khoản`);
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    } catch {
      toast.error('Lỗi sync');
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncInsights = async (ad: Ad) => {
    setSyncingAd(ad.id);
    const today = getVietnamDateString();
    try {
      // Use targeted ad sync instead of account sync
      await adDetailApi.syncInsights(ad.id, today, today, 'all');
      toast.success('Đã cập nhật insights cho Ad');
      queryClient.invalidateQueries({ queryKey: ['ad-analytics', ad.id] });
    } catch {
      toast.error('Lỗi sync Insights');
    } finally {
      setSyncingAd(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedAdset('all');
    setSelectedBranch('all');
    setDateRange({ from: new Date(), to: new Date() });
    setActivePreset('today');
  };

  const hasActiveFilters = Boolean(
    searchQuery || statusFilter !== 'all' || selectedAdset !== 'all' || selectedBranch !== 'all' || activePreset !== 'today',
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  if (isLoading && !data) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6 animate-float-up">
      {/* Header */}
      <PageHeader
        title="Ads"
        description="Danh sách quảng cáo"
      >
        <BranchFilter value={selectedBranch} onChange={setSelectedBranch} />
        <Select value={selectedAdset} onValueChange={setSelectedAdset}>
          <SelectTrigger className="w-52 bg-muted/30 border-border/50">
            <SelectValue placeholder="Chọn Adset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả Adsets</SelectItem>
            {adsets?.map((adset) => (
              <SelectItem key={adset.id} value={adset.id} title={adset.name || adset.id}>
                <span className="block max-w-45 truncate">{adset.name || adset.id}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSyncAllActive} disabled={syncingAll}>
          {syncingAll ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Sync Ads
        </Button>
      </PageHeader>
      
      <FloatingCard>
        <DateRangeFilter 
          dateRange={dateRange} 
          setDateRange={setDateRange} 
          activePreset={activePreset} 
          onPresetChange={setActivePreset}
        />
      </FloatingCard>

      {/* Filters + View Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <FilterBar
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            isLoading={isFetching}
            searchPlaceholder="Tìm kiếm theo tên hoặc ID..."
            filters={[
              {
                key: 'status',
                label: 'Trạng thái',
                options: AD_STATUS_OPTIONS,
                value: statusFilter,
                onChange: setStatusFilter,
                width: 'w-40',
              },
            ]}
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        </div>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Content */}
      <FloatingCard padding="none">
        <FloatingCardHeader className="p-4 flex items-center justify-between">
          <FloatingCardTitle>Ads ({data?.length || 0})</FloatingCardTitle>
        </FloatingCardHeader>
        <FloatingCardContent className="p-4">
          {filteredData?.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title={hasActiveFilters ? 'Không tìm thấy ads' : 'Chưa có ads'}
              description={hasActiveFilters ? 'Thử thay đổi bộ lọc' : 'Hãy chạy sync để lấy dữ liệu'}
            />
          ) : viewMode === 'grid' ? (
            // Grid View
            <AdCardGrid>
              {filteredData?.map((ad) => (
                <div key={ad.id} className="relative">
                  <div className="absolute top-2 left-2 z-10">
                    <PlatformIcon platformCode={(ad as any).account?.platform?.code || 'facebook'} />
                  </div>
                  <AdCard
                    ad={ad}
                    statusVariant={getAdStatusVariant(ad.status)}
                    onSyncInsights={() => handleSyncInsights(ad)}
                    onClick={() => navigate(`/ads/${ad.id}`)}
                    isSyncing={syncingAd === ad.id}
                  />
                </div>
              ))}
            </AdCardGrid>
          ) : (
            // List View (Table)
            <AdTable>
              {filteredData?.map((ad) => (
                <AdTableRow
                  key={ad.id}
                  ad={ad}
                  statusVariant={getAdStatusVariant(ad.status)}
                  onSyncInsights={() => handleSyncInsights(ad)}
                  isSyncing={syncingAd === ad.id}
                />
              ))}
            </AdTable>
          )}
        </FloatingCardContent>
      </FloatingCard>
    </div>
  );
}
