import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCampaigns } from '@/hooks/useCampaigns';
export { useCampaigns } from '@/hooks/useCampaigns';
import { campaignsApi, adsApi } from '@/api';
import { CAMPAIGN_STATUS_OPTIONS, getCampaignStatusVariant, type Campaign } from '@/types/campaigns.types';
import { usePlatform } from '@/contexts';
import { useAdAccounts, BranchFilter } from '@/features/adAccounts';
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
import { Loader2, RefreshCw, Megaphone } from 'lucide-react';
import { PageHeader } from '@/components/custom/PageHeader';
import { FilterBar } from '@/components/custom/FilterBar';
import { FloatingCard, FloatingCardHeader, FloatingCardTitle, FloatingCardContent } from '@/components/custom/FloatingCard';
import { LoadingPage } from '@/components/custom/LoadingState';
import { EmptyState } from '@/components/custom/EmptyState';
import { PlatformIcon } from '@/components/custom/PlatformIcon';

// Platform filter moved to global PlatformContext (header tabs)

export function CampaignsPage() {
  const queryClient = useQueryClient();
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingCampaign, setSyncingCampaign] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const { activePlatform } = usePlatform();

  const { data: accounts } = useAdAccounts();

  const { data, isLoading } = useCampaigns({
    accountId: selectedAccount === 'all' ? undefined : selectedAccount,
    effectiveStatus: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
    branchId: selectedBranch === 'all' ? undefined : selectedBranch,
  });

  const filteredData = data?.filter(campaign => {
    if (activePlatform === 'all') return true;
    // Filter by platform from global context
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

  const handleSyncCampaign = async (campaign: Campaign) => {
    setSyncingCampaign(campaign.id);
    try {
      // For a specific campaign, we might not have a direct "sync campaign by id" in the backend yet
      // but we can sync the whole account's ads/ad groups
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

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedAccount('all');
    setSelectedBranch('all');
  };

  const hasActiveFilters = Boolean(
    searchQuery || statusFilter !== 'all' || selectedAccount !== 'all' || selectedBranch !== 'all',
  );

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
        title="Campaigns"
        description="Danh sách chiến dịch quảng cáo"
      >
        <BranchFilter value={selectedBranch} onChange={setSelectedBranch} />
        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
          <SelectTrigger className="w-48 bg-muted/30 border-border/50">
            <SelectValue placeholder="Chọn Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả Accounts</SelectItem>
            {accounts?.map((acc) => (
              <SelectItem key={acc.id} value={String(acc.id)}>
                {acc.name || acc.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSyncAllActive} disabled={syncingAll || !accounts?.length}>
          {syncingAll ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Sync All Accounts
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
            options: CAMPAIGN_STATUS_OPTIONS,
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
          <FloatingCardTitle>Campaigns ({data?.length || 0})</FloatingCardTitle>
        </FloatingCardHeader>
        <FloatingCardContent className="p-0">
          {filteredData?.length === 0 ? (
            <EmptyState
              icon={<Megaphone className="h-8 w-8" />}
              title={hasActiveFilters ? 'Không tìm thấy campaign' : 'Chưa có campaign'}
              description={hasActiveFilters ? 'Thử thay đổi bộ lọc' : 'Hãy chạy sync campaigns'}
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
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Mục tiêu</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Ngân sách/ngày</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Sync lần cuối</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData?.map((campaign) => (
                    <TableRow key={campaign.id} className="border-border/30 hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <PlatformIcon platformCode={(campaign as any).account?.platform?.code || 'facebook'} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {(campaign.name || campaign.id).length > 30
                          ? (campaign.name || campaign.id).slice(0, 30) + "..."
                          : (campaign.name || campaign.id)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCampaignStatusVariant(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{campaign.objective || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{campaign.dailyBudget || '-'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(campaign.syncedAt).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSyncCampaign(campaign)}
                          disabled={syncingCampaign === campaign.id}
                          className="bg-muted/30 border-border/50 hover:bg-muted/50"
                        >
                          {syncingCampaign === campaign.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-1" />
                          )}
                          Sync Adsets
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
