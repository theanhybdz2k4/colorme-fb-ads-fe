import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adAccountsApi, syncApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Search, X } from 'lucide-react';

interface AdAccount {
  id: string;
  name: string | null;
  accountStatus: number;
  currency: string;
  amountSpent: string | null;
  syncedAt: string;
}

const statusMap: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  1: { label: 'Active', variant: 'default' },
  2: { label: 'Disabled', variant: 'destructive' },
  3: { label: 'Unsettled', variant: 'secondary' },
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: '1', label: 'Active' },
  { value: '3', label: 'Unsettled' },
];

export function AdAccountsPage() {
  const queryClient = useQueryClient();
  const [syncingAccount, setSyncingAccount] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('1'); // Default to Active

  const { data, isLoading } = useQuery({
    queryKey: ['ad-accounts'],
    queryFn: async () => {
      const { data } = await adAccountsApi.list();
      return (data.result || data.data || data || []) as AdAccount[];
    },
  });

  // Client-side filtering (backend doesn't support filter for ad accounts)
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

  // Get all active accounts for bulk sync
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
    } catch (error) {
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
    } catch (error) {
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

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ad Accounts</h1>
          <p className="text-muted-foreground">Danh sách tài khoản quảng cáo đã sync</p>
        </div>
        <Button onClick={handleSyncAllActive} disabled={syncingAll || activeAccounts.length === 0}>
          {syncingAll ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Sync All Active ({activeAccounts.length})
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc ID..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ad Accounts ({filteredData.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {hasActiveFilters 
                ? 'Không tìm thấy ad account phù hợp với bộ lọc.'
                : 'Chưa có ad account nào. Hãy sync từ tài khoản Facebook.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tiền tệ</TableHead>
                  <TableHead>Đã chi</TableHead>
                  <TableHead>Sync lần cuối</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono text-xs">{account.id}</TableCell>
                    <TableCell>{account.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={statusMap[account.accountStatus]?.variant || 'secondary'}>
                        {statusMap[account.accountStatus]?.label || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>{account.currency}</TableCell>
                    <TableCell>{account.amountSpent || '0'}</TableCell>
                    <TableCell>{new Date(account.syncedAt).toLocaleString('vi-VN')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSyncAll(account.id)}
                        disabled={syncingAccount === account.id}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
