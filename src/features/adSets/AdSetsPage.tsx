import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAdsets } from './useAdSets';
import { ADSET_STATUS_OPTIONS, getAdsetStatusVariant, type Adset } from './adSets.types';
import { useCampaigns } from '@/features/campaigns';
import { syncApi } from '@/features/adAccounts';
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
import {
  PageHeader,
  FilterBar,
  FloatingCard,
  FloatingCardHeader,
  FloatingCardTitle,
  FloatingCardContent,
  LoadingPage,
  EmptyState,
} from '@/components/custom';

export function AdSetsPage() {
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingAdset, setSyncingAdset] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  const { data: campaigns } = useCampaigns({ effectiveStatus: 'ACTIVE' });

  const { data, isLoading } = useAdsets({
    campaignId: selectedCampaign === 'all' ? undefined : selectedCampaign,
    effectiveStatus: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const handleSyncAllActive = async () => {
    setSyncingAll(true);
    try {
      let campaignIdsToSync: string[] = [];

      if (selectedCampaign !== 'all') {
        campaignIdsToSync = [selectedCampaign];
      } else {
        if (!campaigns || campaigns.length === 0) {
          toast.error('Không có campaign nào đang active');
          return;
        }
        campaignIdsToSync = campaigns.map(c => c.id);
      }

      for (const campaignId of campaignIdsToSync) {
        await syncApi.entitiesByCampaign(campaignId);
      }
      
      toast.success(`Đã bắt đầu sync Adsets cho ${campaignIdsToSync.length} campaigns`, {
        description: 'Kiểm tra Jobs để xem tiến trình',
      });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['adsets'] });
      }, 5000);
    } catch {
      toast.error('Lỗi sync');
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncAds = async (adset: Adset) => {
    setSyncingAdset(adset.id);
    try {
      await syncApi.entities(adset.accountId, 'ads');
      toast.success('Đã bắt đầu sync Ads', {
        description: `Account: ${adset.accountId}`,
      });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['ads'] });
      }, 3000);
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
  };

  const hasActiveFilters = Boolean(searchQuery || statusFilter !== 'all' || selectedCampaign !== 'all');

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
        title="Ad Sets"
        description="Danh sách nhóm quảng cáo"
      >
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
          {data?.length === 0 ? (
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
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Tên</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Trạng thái</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Mục tiêu tối ưu</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Ngân sách/ngày</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Sync lần cuối</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.map((adset) => (
                    <TableRow key={adset.id} className="border-border/30 hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{adset.name || adset.id}</TableCell>
                      <TableCell>
                        <Badge variant={getAdsetStatusVariant(adset.effectiveStatus || adset.status)}>
                          {adset.effectiveStatus || adset.status}
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
