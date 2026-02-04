export { useAdsets } from '@/hooks/useAdSets';
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAdsets } from '@/hooks/useAdSets';
import { adsApi, campaignsApi } from '@/api';
import { ADSET_STATUS_OPTIONS, getAdsetStatusVariant, type Adset } from '@/types/adSets.types';
import { usePlatform } from '@/contexts';
import { useCampaigns } from '@/hooks/useCampaigns';
import { BranchFilter } from '@/features/adAccounts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, RefreshCw, FolderOpen } from 'lucide-react';
import { PageHeader } from '@/components/custom/PageHeader';
import { FilterBar } from '@/components/custom/FilterBar';
import { FloatingCard, FloatingCardHeader, FloatingCardTitle, FloatingCardContent } from '@/components/custom/FloatingCard';
import { LoadingPage } from '@/components/custom/LoadingState';
import { EmptyState } from '@/components/custom/EmptyState';
import { PlatformIcon } from '@/components/custom/PlatformIcon';

// Platform filter moved to global PlatformContext (header tabs)

export function AdSetsPage() {
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingAdset, setSyncingAdset] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const { activePlatform } = usePlatform();

  const { data: campaigns } = useCampaigns({
    effectiveStatus: 'ACTIVE',
    branchId: selectedBranch === 'all' ? undefined : selectedBranch,
  });

  const { data, isLoading } = useAdsets({
    campaignId: selectedCampaign === 'all' ? undefined : selectedCampaign,
    effectiveStatus: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
    branchId: selectedBranch === 'all' ? undefined : selectedBranch,
  });

  const filteredData = data?.filter(adset => {
    if (activePlatform === 'all') return true;
    return (adset as any).account?.platform?.code === activePlatform || (activePlatform === 'facebook' && !(adset as any).account?.platform);
  });

  const handleSyncAllActive = async () => {
    setSyncingAll(true);
    try {
      let accountIdsToSync: number[] = [];

      if (selectedCampaign !== 'all') {
        const campaign = campaigns?.find(c => c.id === selectedCampaign);
        if (campaign) {
          accountIdsToSync = [campaign.accountId];
        }
      } else {
        if (!campaigns || campaigns.length === 0) {
          toast.error('Không có campaign nào đang active');
          return;
        }
        accountIdsToSync = Array.from(new Set(campaigns.map(c => c.accountId)));
      }

      await Promise.all(accountIdsToSync.map(accountId => campaignsApi.syncAccount(accountId)));

      toast.success(`Đã hoàn thành sync Ad Sets cho các tài khoản liên quan`);
      queryClient.invalidateQueries({ queryKey: ['adsets'] });
    } catch {
      toast.error('Lỗi sync');
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncAds = async (adset: Adset) => {
    setSyncingAdset(adset.id);
    try {
      const response = await adsApi.syncAccount(adset.accountId);
      const result = response.data;
      
      if (result?.ads) {
        const { added, updated } = result.ads;
        const cleanedUp = result.creatives?.cleanedUp || 0;
        
        let msg = `Đã sync: ${added} mới, ${updated} cập nhật`;
        if (cleanedUp > 0) msg += `, đã xóa ${cleanedUp} creative cũ`;
        
        if (added === 0 && updated === 0) {
          toast.info(cleanedUp > 0 ? `Dữ liệu mới nhất. Đã dọn dẹp ${cleanedUp} creative.` : 'Dữ liệu quảng cáo đã là mới nhất');
        } else {
          toast.success(msg);
        }
      } else {
        toast.success('Đã hoàn thành sync Quảng cáo');
      }

      queryClient.invalidateQueries({ queryKey: ['ads'] });
    } catch {
      toast.error('Lỗi sync Ads');
    } finally {
      setSyncingAdset(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedCampaign('all');
    setSelectedBranch('all');
  };

  const hasActiveFilters = Boolean(
    searchQuery || statusFilter !== 'all' || selectedCampaign !== 'all' || selectedBranch !== 'all',
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6 animate-float-up p-6">
      {/* Header */}
      <PageHeader
        title="Ad Sets"
        description="Danh sách nhóm quảng cáo"
      >
        <BranchFilter value={selectedBranch} onChange={setSelectedBranch} />
        <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
          <SelectTrigger className="w-52 bg-muted/30 border-border/50">
            <SelectValue placeholder="Chọn Campaign" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả Campaigns</SelectItem>
            {campaigns?.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id} title={campaign.name || campaign.id}>
                <span className="block max-w-[180px] truncate">{campaign.name || campaign.id}</span>
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
          Sync Ad Sets
        </Button>
      </PageHeader>

      {/* Filters */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Tìm kiếm theo tên hoặc ID..."
        filters={[
          {
            key: 'status',
            label: 'Trạng thái',
            options: ADSET_STATUS_OPTIONS,
            value: statusFilter,
            onChange: setStatusFilter,
            width: 'w-40',
          },
        ]}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
      />

      {/* Table */}
      <FloatingCard padding="none">
        <FloatingCardHeader className="p-4">
          <FloatingCardTitle>Ad Sets ({data?.length || 0})</FloatingCardTitle>
        </FloatingCardHeader>
        <FloatingCardContent className="p-0">
          {filteredData?.length === 0 ? (
            <EmptyState
              icon={<FolderOpen className="h-8 w-8" />}
              title={hasActiveFilters ? 'Không tìm thấy adset' : 'Chưa có adset'}
              description={hasActiveFilters ? 'Thử thay đổi bộ lọc' : 'Hãy chạy sync'}
              className="py-12"
            />
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Tên</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Trạng thái</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Mục tiêu tối ưu</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Ngân sách/ngày</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Sync lần cuối</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData?.map((adset) => (
                    <TableRow key={adset.id} className="border-border/30 hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <PlatformIcon platformCode={(adset as any).account?.platform?.code || 'facebook'} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {(adset.name || adset.id).length > 30
                          ? (adset.name || adset.id).slice(0, 30) + "..."
                          : (adset.name || adset.id)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getAdsetStatusVariant(adset.status)}>
                          {adset.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{adset.optimizationGoal || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{adset.dailyBudget || '-'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(adset.syncedAt).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSyncAds(adset)}
                          disabled={syncingAdset === adset.id}
                          className="bg-muted/30 border-border/50 hover:bg-muted/50"
                        >
                          {syncingAdset === adset.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-1" />
                          )}
                          Sync Ads
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </FloatingCardContent>
      </FloatingCard>
    </div>
  );
}
