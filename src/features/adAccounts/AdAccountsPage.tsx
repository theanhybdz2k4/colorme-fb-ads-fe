import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAdAccounts } from './useAdAccounts';
import { syncApi } from './adAccounts.api';
import { AD_ACCOUNT_STATUS_MAP, AD_ACCOUNT_STATUS_OPTIONS } from './adAccounts.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, RefreshCw, CreditCard } from 'lucide-react';
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

export function AdAccountsPage() {
  const queryClient = useQueryClient();
  const [syncingAccount, setSyncingAccount] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('1');

  const { data, isLoading } = useAdAccounts();

  const filteredData = useMemo(() => {
    if (!data) return [];
    
    return data.filter((account) => {
      const matchesSearch = !searchQuery || 
        account.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        account.accountStatus === parseInt(statusFilter);
      
      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  const activeAccounts = useMemo(() => {
    return data?.filter(acc => acc.accountStatus === 1) || [];
  }, [data]);

  const handleSyncAll = async (accountId: string) => {
    setSyncingAccount(accountId);
    try {
      await syncApi.entities(accountId, 'all');
      toast.success('Đã bắt đầu sync tất cả entities', {
        description: `Account: ${accountId}`,
      });
    } catch {
      toast.error('Lỗi sync');
    } finally {
      setSyncingAccount(null);
    }
  };

  const handleSyncAllActive = async () => {
    if (activeAccounts.length === 0) {
      toast.error('Không có tài khoản Active nào');
      return;
    }
    setSyncingAll(true);
    try {
      for (const account of activeAccounts) {
        await syncApi.entities(account.id, 'all');
      }
      toast.success(`Đã bắt đầu sync ${activeAccounts.length} tài khoản Active`, {
        description: 'Kiểm tra Jobs để xem tiến trình',
      });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['ad-accounts'] });
      }, 5000);
    } catch {
      toast.error('Lỗi sync');
    } finally {
      setSyncingAll(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('1');
  };

  const hasActiveFilters = searchQuery || statusFilter !== '1';

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
        title="Ad Accounts"
        description="Danh sách tài khoản quảng cáo đã sync"
      >
        <Button onClick={handleSyncAllActive} disabled={syncingAll || activeAccounts.length === 0}>
          {syncingAll ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Sync All Active ({activeAccounts.length})
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
            options: AD_ACCOUNT_STATUS_OPTIONS,
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
          <FloatingCardTitle>Ad Accounts ({filteredData.length})</FloatingCardTitle>
        </FloatingCardHeader>
        <FloatingCardContent className="p-0">
          {filteredData.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="h-8 w-8" />}
              title={hasActiveFilters ? 'Không tìm thấy ad account' : 'Chưa có ad account'}
              description={hasActiveFilters ? 'Thử thay đổi bộ lọc' : 'Sync từ tài khoản Facebook để lấy dữ liệu'}
              className="py-12"
            />
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">ID</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Tên</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Trạng thái</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Tiền tệ</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Đã chi</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Sync lần cuối</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((account) => (
                    <TableRow key={account.id} className="border-border/30 hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground">{account.id}</TableCell>
                      <TableCell className="font-medium">{account.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={AD_ACCOUNT_STATUS_MAP[account.accountStatus]?.variant || 'secondary'}>
                          {AD_ACCOUNT_STATUS_MAP[account.accountStatus]?.label || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{account.currency}</TableCell>
                      <TableCell className="text-muted-foreground">{account.amountSpent || '0'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(account.syncedAt).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSyncAll(account.id)}
                          disabled={syncingAccount === account.id}
                          className="bg-muted/30 border-border/50 hover:bg-muted/50"
                        >
                          {syncingAccount === account.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-1" />
                          )}
                          Sync All
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
