import { useState, useCallback } from 'react';
import { useAdsets } from '@/hooks/useAdSets';
import { ADSET_STATUS_OPTIONS, getAdsetStatusVariant } from '@/types/adSets.types';
import { usePlatform } from '@/contexts';
import { useCampaigns } from '@/hooks/useCampaigns';
import { BranchFilter } from '@/features/adAccounts';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FolderOpen } from 'lucide-react';
import { PageHeader } from '@/components/shared/common/PageHeader';
import { FilterBar } from '@/components/shared/common/FilterBar';
import { FloatingCard, FloatingCardHeader, FloatingCardTitle, FloatingCardContent } from '@/components/shared/common/FloatingCard';
import { LoadingPage } from '@/components/shared/common/LoadingState';
import { EmptyState } from '@/components/shared/common/EmptyState';
import { PlatformIcon } from '@/components/shared/common/PlatformIcon';

// Platform filter moved to global PlatformContext (header tabs)

export function AdSetsPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
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
                        -
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
