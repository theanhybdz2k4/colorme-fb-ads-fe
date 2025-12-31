import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAds } from './useAds';
import { AD_STATUS_OPTIONS, getAdStatusVariant, type Ad } from './ads.types';
import { useAdsets } from '@/features/adSets';
import { syncApi } from '@/features/adAccounts';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, RefreshCw, FileText } from 'lucide-react';
import {
  PageHeader,
  FilterBar,
  FloatingCard,
  FloatingCardHeader,
  FloatingCardTitle,
  FloatingCardContent,
  LoadingPage,
  EmptyState,
  ViewToggle,
  useViewPreference,
  AdCard,
  AdCardGrid,
  AdCompactRow,
  AdCompactList,
} from '@/components/custom';

export function AdsPage() {
  const queryClient = useQueryClient();
  const [selectedAdset, setSelectedAdset] = useState<string>('all');
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingAd, setSyncingAd] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  // View toggle with localStorage persistence
  const [viewMode, setViewMode] = useViewPreference('ads-page', 'grid');

  const { data: adsets } = useAdsets({ effectiveStatus: 'ACTIVE' });

  const { data, isLoading } = useAds({
    adsetId: selectedAdset === 'all' ? undefined : selectedAdset,
    effectiveStatus: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const handleSyncAllActive = async () => {
    setSyncingAll(true);
    try {
      let adsetIdsToSync: string[] = [];

      if (selectedAdset !== 'all') {
        adsetIdsToSync = [selectedAdset];
      } else {
        if (!adsets || adsets.length === 0) {
          toast.error('Không có adset nào đang active');
          return;
        }
        adsetIdsToSync = adsets.map(a => a.id);
      }

      for (const adsetId of adsetIdsToSync) {
        await syncApi.entitiesByAdset(adsetId);
      }
      
      toast.success(`Đã bắt đầu sync Ads cho ${adsetIdsToSync.length} adsets`, {
        description: 'Kiểm tra Jobs để xem tiến trình',
      });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['ads'] });
      }, 5000);
    } catch {
      toast.error('Lỗi sync');
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncInsights = async (ad: Ad) => {
    setSyncingAd(ad.id);
    const today = new Date().toISOString().split('T')[0];
    try {
      await syncApi.insights(ad.accountId, today, today, 'all');
      toast.success('Đã bắt đầu sync Insights', {
        description: `Account: ${ad.accountId}`,
      });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['insights'] });
      }, 3000);
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
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || selectedAdset !== 'all';

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6 animate-float-up">
      {/* Header */}
      <PageHeader
        title="Ads"
        description="Danh sách quảng cáo"
      >
        <Select value={selectedAdset} onValueChange={setSelectedAdset}>
          <SelectTrigger className="w-52 bg-muted/30 border-border/50">
            <SelectValue placeholder="Chọn Adset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả Adsets</SelectItem>
            {adsets?.map((adset) => (
              <SelectItem key={adset.id} value={adset.id} title={adset.name || adset.id}>
                <span className="block max-w-[180px] truncate">{adset.name || adset.id}</span>
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

      {/* Filters + View Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <FilterBar
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
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
          {data?.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title={hasActiveFilters ? 'Không tìm thấy ads' : 'Chưa có ads'}
              description={hasActiveFilters ? 'Thử thay đổi bộ lọc' : 'Hãy chạy sync để lấy dữ liệu'}
            />
          ) : viewMode === 'grid' ? (
            // Grid View
            <AdCardGrid>
              {data?.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  statusVariant={getAdStatusVariant(ad.effectiveStatus || ad.status)}
                  onSyncInsights={() => handleSyncInsights(ad)}
                  isSyncing={syncingAd === ad.id}
                />
              ))}
            </AdCardGrid>
          ) : (
            // List View
            <AdCompactList>
              {data?.map((ad) => (
                <AdCompactRow
                  key={ad.id}
                  ad={ad}
                  statusVariant={getAdStatusVariant(ad.effectiveStatus || ad.status)}
                  onSyncInsights={() => handleSyncInsights(ad)}
                  isSyncing={syncingAd === ad.id}
                />
              ))}
            </AdCompactList>
          )}
        </FloatingCardContent>
      </FloatingCard>
    </div>
  );
}
