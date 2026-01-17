export { BranchFilter } from './components/BranchFilter';
export { syncApi, adAccountsApi, branchesApi } from '@/api/adAccounts.api';
export { useAdAccounts } from '@/hooks/useAdAccounts';
import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAdAccounts } from '@/hooks/useAdAccounts';
import { syncApi, adAccountsApi, branchesApi } from '@/api/adAccounts.api';
import { AD_ACCOUNT_STATUS_MAP, AD_ACCOUNT_STATUS_OPTIONS } from '@/types/adAccounts.types';
import { useBranches } from '@/hooks/useBranches';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, RefreshCw, CreditCard, Image, Trash2 } from 'lucide-react';
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
  const [syncingCreatives, setSyncingCreatives] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('1');
  const [branchFilter, setBranchFilter] = useState<'all' | number>('all');
  const [assigningBranchFor, setAssigningBranchFor] = useState<string | null>(null);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [creatingBranch, setCreatingBranch] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const [editingBranchName, setEditingBranchName] = useState('');
  const [editingBranchCode, setEditingBranchCode] = useState('');
  const [savingBranch, setSavingBranch] = useState(false);
  const [deletingBranchId, setDeletingBranchId] = useState<number | null>(null);
  const [rebuildingBranchStats, setRebuildingBranchStats] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);

  const { data: branches } = useBranches();

  const { data, isLoading } = useAdAccounts({
    accountStatus: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
    branchId: branchFilter === 'all' ? undefined : branchFilter,
  });

  const filteredData = useMemo(() => data || [], [data]);

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

  const handleSyncCreatives = async (accountId: string) => {
    setSyncingCreatives(accountId);
    try {
      await syncApi.entities(accountId, 'creatives');
      toast.success('Đã bắt đầu sync Creatives', {
        description: `Account: ${accountId}`,
      });
    } catch {
      toast.error('Lỗi sync creatives');
    } finally {
      setSyncingCreatives(null);
    }
  };

  const handleSyncAllActive = async () => {
    if (activeAccounts.length === 0) {
      toast.error('Không có tài khoản Active nào');
      return;
    }
    setSyncingAll(true);
    try {
      await Promise.all(activeAccounts.map(account => syncApi.entities(account.id, 'all')));
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
    setBranchFilter('all');
  };

  const hasActiveFilters = Boolean(searchQuery || statusFilter !== '1');

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleAssignBranch = async (accountId: string, branchId: number | 'none') => {
    setAssigningBranchFor(accountId);
    try {
      await adAccountsApi.assignBranch(accountId, branchId === 'none' ? null : branchId);
      toast.success('Đã cập nhật cơ sở cho ad account');
      queryClient.invalidateQueries({ queryKey: ['ad-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    } catch {
      toast.error('Lỗi cập nhật cơ sở');
    } finally {
      setAssigningBranchFor(null);
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) {
      toast.error('Tên cơ sở không được để trống');
      return;
    }

    setCreatingBranch(true);
    try {
      await branchesApi.create({
        name: newBranchName.trim(),
        code: newBranchCode.trim() || undefined,
      });
      toast.success('Đã tạo cơ sở mới');
      setNewBranchName('');
      setNewBranchCode('');
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    } catch {
      toast.error('Lỗi tạo cơ sở');
    } finally {
      setCreatingBranch(false);
    }
  };

  const startEditBranch = (id: number, name: string, code: string | null | undefined) => {
    setEditingBranchId(id);
    setEditingBranchName(name);
    setEditingBranchCode(code || '');
  };

  const cancelEditBranch = () => {
    setEditingBranchId(null);
    setEditingBranchName('');
    setEditingBranchCode('');
  };

  const handleSaveBranch = async () => {
    if (editingBranchId == null) return;
    if (!editingBranchName.trim()) {
      toast.error('Tên cơ sở không được để trống');
      return;
    }

    setSavingBranch(true);
    try {
      await branchesApi.update(editingBranchId, {
        name: editingBranchName.trim(),
        code: editingBranchCode.trim() || null,
      });
      toast.success('Đã cập nhật cơ sở');
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      cancelEditBranch();
    } catch {
      toast.error('Lỗi cập nhật cơ sở');
    } finally {
      setSavingBranch(false);
    }
  };

  const handleDeleteBranch = async (id: number, name: string) => {
    const confirmed = window.confirm(`Xóa cơ sở "${name}"? Tất cả ad account đang gán sẽ bị bỏ gán.`);
    if (!confirmed) return;

    setDeletingBranchId(id);
    try {
      await branchesApi.delete(id);
      toast.success('Đã xóa cơ sở');
      // Cập nhật cache ngay để UI phản ánh tức thì
      queryClient.setQueryData(['branches'], (old: any) =>
        Array.isArray(old) ? old.filter((b) => b.id !== id) : old,
      );
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['ad-accounts'] });
    } catch {
      toast.error('Lỗi xóa cơ sở');
    } finally {
      setDeletingBranchId(null);
    }
  };

  const handleRebuildBranchStats = async () => {
    const confirmed = window.confirm(
      'Cập nhật lại dữ liệu thống kê cho tất cả cơ sở từ toàn bộ lịch sử insights?\n\nThao tác này có thể mất vài phút nếu dữ liệu nhiều.',
    );
    if (!confirmed) return;

    setRebuildingBranchStats(true);
    try {
      const { data } = await branchesApi.rebuildStats();
      const result = data.result || data;
      toast.success('Đã bắt đầu cập nhật dữ liệu cơ sở', {
        description: result?.dates
          ? `Đã xử lý ${result.dates} ngày cho ${result.branches} cơ sở.`
          : undefined,
      });
    } catch {
      toast.error('Lỗi cập nhật dữ liệu cơ sở');
    } finally {
      setRebuildingBranchStats(false);
    }
  };

  const handleCleanupHourlyInsights = async () => {
    const confirmed = window.confirm(
      'Xóa tất cả hourly insights cũ hơn ngày hôm qua?\nDữ liệu này không cần thiết và chiếm dung lượng database.',
    );
    if (!confirmed) return;

    setCleaningUp(true);
    try {
      const { data } = await syncApi.cleanupHourlyInsights();
      toast.success(`Đã xóa ${data.deletedCount || 0} bản ghi cũ`, {
        description: 'Hourly insights cleanup thành công',
      });
    } catch {
      toast.error('Lỗi cleanup hourly insights');
    } finally {
      setCleaningUp(false);
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6 animate-float-up">
      <PageHeader
        title="Ad Accounts"
        description="Quản lý tài khoản quảng cáo và cơ sở"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleCleanupHourlyInsights}
            disabled={cleaningUp}
            className="text-orange-400 hover:text-orange-300 border-orange-500/50 hover:border-orange-500"
          >
            {cleaningUp ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Dọn Hourly Insights
          </Button>
          <Button
            variant="outline"
            onClick={handleRebuildBranchStats}
            disabled={rebuildingBranchStats}
          >
            {rebuildingBranchStats ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Cập nhật dữ liệu cơ sở
          </Button>
          <Button onClick={handleSyncAllActive} disabled={syncingAll || activeAccounts.length === 0}>
            {syncingAll ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync All Active ({activeAccounts.length})
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="ad-accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ad-accounts">Ad Accounts</TabsTrigger>
          <TabsTrigger value="branches">Cơ sở</TabsTrigger>
        </TabsList>

        <TabsContent value="ad-accounts" className="space-y-4">
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
              {
                key: 'branch',
                label: 'Cơ sở',
                options: [
                  { value: 'all', label: 'Tất cả cơ sở' },
                  ...(branches || []).map((b) => ({
                    value: String(b.id),
                    label: b.name,
                  })),
                ],
                value: String(branchFilter),
                onChange: (value: string) => {
                  if (value === 'all') {
                    setBranchFilter('all');
                  } else {
                    const id = Number(value);
                    setBranchFilter(Number.isNaN(id) ? 'all' : id);
                  }
                },
                width: 'w-48',
              },
            ]}
            hasActiveFilters={Boolean(
              searchQuery || statusFilter !== '1' || branchFilter !== 'all',
            )}
            onClear={clearFilters}
          />

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
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Cơ sở</TableHead>
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
                          <TableCell className="text-muted-foreground text-sm">
                            {account.branch?.name || 'Chưa gán'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{account.currency}</TableCell>
                          <TableCell className="text-muted-foreground">{account.amountSpent || '0'}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(account.syncedAt).toLocaleString('vi-VN')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <select
                                className="h-8 rounded-md border border-border/60 bg-background px-2 text-xs text-muted-foreground"
                                value={account.branch?.id ?? 'none'}
                                onChange={(e) =>
                                  handleAssignBranch(
                                    account.id,
                                    e.target.value === 'none' ? 'none' : Number(e.target.value),
                                  )
                                }
                                disabled={assigningBranchFor === account.id}
                              >
                                <option value="none">Chưa gán cơ sở</option>
                                {(branches || []).map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name}
                                  </option>
                                ))}
                              </select>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSyncCreatives(account.id)}
                                disabled={syncingCreatives === account.id}
                                className="bg-muted/30 border-border/50 hover:bg-muted/50"
                                title="Sync Creatives để lấy thumbnail"
                              >
                                {syncingCreatives === account.id ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Image className="h-4 w-4 mr-1" />
                                )}
                                Creatives
                              </Button>
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </FloatingCardContent>
          </FloatingCard>
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
          <FloatingCard>
            <FloatingCardHeader>
              <FloatingCardTitle>Cơ sở ({branches?.length || 0})</FloatingCardTitle>
            </FloatingCardHeader>
            <FloatingCardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch-name">Tên cơ sở</Label>
                    <Input
                      id="branch-name"
                      placeholder="Ví dụ: colorME 01"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-code">Mã cơ sở (tuỳ chọn)</Label>
                    <Input
                      id="branch-code"
                      placeholder="Ví dụ: CM01"
                      value={newBranchCode}
                      onChange={(e) => setNewBranchCode(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateBranch} disabled={creatingBranch}>
                    {creatingBranch ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Tạo cơ sở
                  </Button>
                </div>

                <div className="border-l border-border/40 pl-4 space-y-2 text-sm text-muted-foreground hidden md:block">
                  <p>
                    Cơ sở dùng để nhóm các tài khoản quảng cáo theo chi nhánh/cửa hàng. Bạn có thể:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Tạo mới cơ sở bên phải.</li>
                    <li>Quay lại tab Ad Accounts để gán cơ sở cho từng tài khoản.</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-border/40 pt-4">
                {(!branches || branches.length === 0) ? (
                  <EmptyState
                    icon={<CreditCard className="h-8 w-8" />}
                    title="Chưa có cơ sở nào"
                    description="Tạo cơ sở mới bằng form phía trên, sau đó quay lại tab Ad Accounts để gán."
                    className="py-8"
                  />
                ) : (
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/30 hover:bg-transparent">
                          <TableHead className="text-xs font-medium text-muted-foreground uppercase">ID</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground uppercase">Tên cơ sở</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground uppercase">Mã</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {branches?.map((branch) => {
                          const isEditing = editingBranchId === branch.id;
                          return (
                            <TableRow key={branch.id} className="border-border/30 hover:bg-muted/30 transition-colors">
                              <TableCell className="font-mono text-xs text-muted-foreground">{branch.id}</TableCell>
                              <TableCell className="font-medium">
                                {isEditing ? (
                                  <Input
                                    value={editingBranchName}
                                    onChange={(e) => setEditingBranchName(e.target.value)}
                                    className="h-8"
                                  />
                                ) : (
                                  branch.name
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {isEditing ? (
                                  <Input
                                    value={editingBranchCode}
                                    onChange={(e) => setEditingBranchCode(e.target.value)}
                                    className="h-8"
                                  />
                                ) : (
                                  branch.code || '-'
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleSaveBranch}
                                      disabled={savingBranch}
                                    >
                                      {savingBranch ? (
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                      ) : null}
                                      Lưu
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={cancelEditBranch}
                                      disabled={savingBranch}
                                    >
                                      Hủy
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => startEditBranch(branch.id, branch.name, branch.code)}
                                    >
                                      Sửa
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                      onClick={() => handleDeleteBranch(branch.id, branch.name)}
                                      disabled={deletingBranchId === branch.id}
                                    >
                                      {deletingBranchId === branch.id ? (
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                      ) : null}
                                      Xóa
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </FloatingCardContent>
          </FloatingCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
