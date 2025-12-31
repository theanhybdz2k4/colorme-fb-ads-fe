import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCampaigns } from './useCampaigns';
import { CAMPAIGN_STATUS_OPTIONS, getCampaignStatusVariant, type Campaign } from './campaigns.types';
import { useAdAccounts, syncApi } from '@/features/adAccounts';
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

export function CampaignsPage() {
  const queryClient = useQueryClient();
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingCampaign, setSyncingCampaign] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  const { data: accounts } = useAdAccounts();

  const { data, isLoading } = useCampaigns({
    accountId: selectedAccount === 'all' ? undefined : selectedAccount,
    effectiveStatus: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const handleSyncAllActive = async () => {
    if (!accounts || accounts.length === 0) {
      toast.error('Không có tài khoản nào');
      return;
    }
    setSyncingAll(true);
    try {
      for (const account of accounts) {
        await syncApi.entities(account.id, 'campaigns');
      }
      toast.success(`Đã bắt đầu sync Campaigns cho ${accounts.length} tài khoản`, {
        description: 'Kiểm tra Jobs để xem tiến trình',
      });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      }, 5000);
    } catch {
      toast.error('Lỗi sync');
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncCampaign = async (campaign: Campaign) => {
    setSyncingCampaign(campaign.id);
    try {
      await syncApi.entities(campaign.accountId, 'adsets');
      await syncApi.entities(campaign.accountId, 'ads');
      toast.success('Đã bắt đầu sync Adsets & Ads', {
        description: `Account: ${campaign.accountId}`,
      });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['adsets'] });
        queryClient.invalidateQueries({ queryKey: ['ads'] });
      }, 3000);
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
  };

  const hasActiveFilters = Boolean(searchQuery || statusFilter !== 'all' || selectedAccount !== 'all');

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
        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
          <SelectTrigger className="w-48 bg-muted/30 border-border/50">
            <SelectValue placeholder="Chọn Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả Accounts</SelectItem>
            {accounts?.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
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
          {data?.length === 0 ? (
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
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Tên</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Trạng thái</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Mục tiêu</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Ngân sách/ngày</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Sync lần cuối</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.map((campaign) => (
                    <TableRow key={campaign.id} className="border-border/30 hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{campaign.name || campaign.id}</TableCell>
                      <TableCell>
                        <Badge variant={getCampaignStatusVariant(campaign.effectiveStatus || campaign.status)}>
                          {campaign.effectiveStatus || campaign.status}
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
