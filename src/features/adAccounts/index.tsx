export { useAdAccounts } from '@/hooks/useAdAccounts';
export { BranchFilter } from './components/BranchFilter';
import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAdAccounts } from '@/hooks/useAdAccounts';
import { adAccountsApi, campaignsApi, adsApi, insightsApi, branchesApi } from '@/api';
import { PLATFORM_ACCOUNT_STATUS_MAP, AD_ACCOUNT_STATUS_OPTIONS } from '@/types/adAccounts.types';
import { usePlatform } from '@/contexts';
import { useBranches } from '@/hooks/useBranches';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, RefreshCw, CreditCard, Image, Key, Link as LinkIcon } from 'lucide-react';
import { PageHeader } from '@/components/custom/PageHeader';
import { FilterBar } from '@/components/custom/FilterBar';
import { FloatingCard, FloatingCardHeader, FloatingCardTitle, FloatingCardContent } from '@/components/custom/FloatingCard';
import { LoadingPage } from '@/components/custom/LoadingState';
import { EmptyState } from '@/components/custom/EmptyState';
import { PlatformIcon } from '@/components/custom/PlatformIcon';
import { useQuery } from '@tanstack/react-query';
import { pagesApi } from '@/api/pages.api';
import type { FBPage } from '@/api/pages.api';

import { getVietnamDateString } from '@/lib/utils';

// Platform filter moved to global PlatformContext (header tabs)

export function AdAccountsPage() {
  const queryClient = useQueryClient();
  const [syncingAccount, setSyncingAccount] = useState<string | null>(null);
  const [syncingCreatives, setSyncingCreatives] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const { activePlatform } = usePlatform();
  const [branchFilter, setBranchFilter] = useState<'all' | number>('all');
  const [assigningBranchFor, setAssigningBranchFor] = useState<string | null>(null);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [creatingBranch, setCreatingBranch] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const [editingBranchName, setEditingBranchName] = useState('');
  const [editingBranchCode, setEditingBranchCode] = useState('');
  const [newBranchKeywords, setNewBranchKeywords] = useState('');
  const [editingBranchKeywords, setEditingBranchKeywords] = useState('');
  const [savingBranch, setSavingBranch] = useState(false);
  const [deletingBranchId, setDeletingBranchId] = useState<number | null>(null);
  const [syncingPages, setSyncingPages] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [newPageToken, setNewPageToken] = useState('');
  const [updatingPageToken, setUpdatingPageToken] = useState(false);


  const { data: branches } = useBranches();

  const { data, isLoading } = useAdAccounts({
    accountStatus: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
    branchId: branchFilter === 'all' ? undefined : branchFilter,
  });

  const filteredData = useMemo(() => {
    let result = data || [];
    if (activePlatform !== 'all') {
      result = result.filter(acc => (acc as any).platform?.code === activePlatform || (activePlatform === 'facebook' && !(acc as any).platform));
    }
    return result;
  }, [data, activePlatform]);

  const activeAccounts = useMemo(() => {
    return data?.filter(acc => acc.accountStatus === 'ACTIVE') || [];
  }, [data]);

  const handleSyncAll = async (accountId: number) => {
    setSyncingAccount(String(accountId));
    try {
      await campaignsApi.syncAccount(accountId);
      await adsApi.syncAccount(accountId);
      const today = getVietnamDateString();
      await insightsApi.syncAccount(accountId, today, today, 'BOTH');

      // Auto-rebuild branch stats after insights sync
      try { await branchesApi.rebuildStats(); } catch { /* ignore */ }

      toast.success('Đã hoàn thành sync dữ liệu tài khoản');
      queryClient.invalidateQueries({ queryKey: ['ad-accounts'] });
    } catch {
      toast.error('Lỗi sync');
    } finally {
      setSyncingAccount(null);
    }
  };

  const handleSyncCreatives = async (accountId: number) => {
    setSyncingCreatives(String(accountId));
    try {
      await adsApi.syncAccount(accountId);
      toast.success('Đã cập nhật dữ liệu quảng cáo');
      queryClient.invalidateQueries({ queryKey: ['ad-accounts'] });
    } catch {
      toast.error('Lỗi sync quảng cáo');
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
      await Promise.all(activeAccounts.map(account => handleSyncAll(account.id)));
      // Rebuild branch stats once after all accounts synced
      try { await branchesApi.rebuildStats(); } catch { /* ignore */ }
      toast.success(`Đã hoàn thành sync ${activeAccounts.length} tài khoản Active`);
    } catch {
      toast.error('Lỗi sync hàng loạt');
    } finally {
      setSyncingAll(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ACTIVE');
    setBranchFilter('all');
  };

  const hasActiveFilters = Boolean(searchQuery || statusFilter !== 'ACTIVE' || branchFilter !== 'all');

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleAssignBranch = async (accountId: number, branchId: number | 'none') => {
    setAssigningBranchFor(String(accountId));
    try {
      await adAccountsApi.assignBranch(String(accountId), branchId === 'none' ? null : branchId);
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
        autoMatchKeywords: newBranchKeywords.split(',').map(k => k.trim()).filter(Boolean),
      } as any);
      toast.success('Đã tạo cơ sở mới');
      setNewBranchName('');
      setNewBranchCode('');
      setNewBranchKeywords('');
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    } catch {
      toast.error('Lỗi tạo cơ sở');
    } finally {
      setCreatingBranch(false);
    }
  };

  const startEditBranch = (id: number, name: string, code: string | null | undefined, keywords: string[] | null | undefined) => {
    setEditingBranchId(id);
    setEditingBranchName(name);
    setEditingBranchCode(code || '');
    setEditingBranchKeywords(keywords?.join(', ') || '');
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
        autoMatchKeywords: editingBranchKeywords.split(',').map(k => k.trim()).filter(Boolean),
      } as any);
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

  const { data: pages, isLoading: isLoadingPages } = useQuery({
    queryKey: ['fb-pages'],
    queryFn: () => pagesApi.getPages(),
    enabled: activePlatform === 'facebook' || activePlatform === 'all',
  });

  const handleSyncPages = async () => {
    setSyncingPages(true);
    try {
      await pagesApi.syncPages();
      toast.success('Đã đồng bộ danh sách Facebook Pages');
      queryClient.invalidateQueries({ queryKey: ['fb-pages'] });
    } catch {
      toast.error('Lỗi đồng bộ pages');
    } finally {
      setSyncingPages(false);
    }
  };

  const handleUpdatePageToken = async (pageId: string) => {
    if (!newPageToken.trim()) return;
    setUpdatingPageToken(true);
    try {
      await pagesApi.updatePageToken(pageId, newPageToken.trim());
      toast.success('Đã cập nhật token cho page');
      setEditingPageId(null);
      setNewPageToken('');
      queryClient.invalidateQueries({ queryKey: ['fb-pages'] });
    } catch (e: any) {
      toast.error(e.message || 'Lỗi cập nhật token');
    } finally {
      setUpdatingPageToken(false);
    }
  };



  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6 animate-float-up p-6">
      <PageHeader
        title="Ad Accounts"
        description="Quản lý tài khoản quảng cáo và cơ sở"
      >
        <div className="flex items-center gap-2">
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
          <TabsTrigger value="pages">Facebook Pages</TabsTrigger>
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
              searchQuery || statusFilter !== 'ACTIVE' || branchFilter !== 'all',
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
                        <TableHead className="w-[50px]"></TableHead>
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
                          <TableCell>
                            <PlatformIcon platformCode={(account as any).platform?.code || 'facebook'} />
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{account.externalId}</TableCell>
                          <TableCell className="font-medium">{account.name || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={PLATFORM_ACCOUNT_STATUS_MAP[account.accountStatus]?.variant || 'secondary'}>
                              {PLATFORM_ACCOUNT_STATUS_MAP[account.accountStatus]?.label || account.accountStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {account.branch?.name || 'Chưa gán'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{account.currency}</TableCell>
                          <TableCell className="text-muted-foreground">{account.amountSpent || '0'}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {account.syncedAt ? new Date(account.syncedAt).toLocaleString('vi-VN') : 'Chưa đồng bộ'}
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
                                disabled={assigningBranchFor === String(account.id)}
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
                                disabled={syncingCreatives === String(account.id)}
                                className="bg-muted/30 border-border/50 hover:bg-muted/50"
                                title="Sync Creatives để lấy thumbnail"
                              >
                                {syncingCreatives === String(account.id) ? (
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
                                disabled={syncingAccount === String(account.id)}
                                className="bg-muted/30 border-border/50 hover:bg-muted/50"
                              >
                                {syncingAccount === String(account.id) ? (
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
                  <div className="space-y-2">
                    <Label htmlFor="branch-keywords">Từ khoá tự động (ngăn cách bởi dấu phẩy)</Label>
                    <Input
                      id="branch-keywords"
                      placeholder="Ví dụ: HCM, CN1, Sài Gòn"
                      value={newBranchKeywords}
                      onChange={(e) => setNewBranchKeywords(e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">Tài khoản mới sync sẽ tự gán vào cơ sở này nếu tên chứa từ khoá.</p>
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
                          <TableHead className="text-xs font-medium text-muted-foreground uppercase">Từ khoá Sync</TableHead>
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
                              <TableCell className="text-muted-foreground text-sm">
                                {isEditing ? (
                                  <Input
                                    value={editingBranchKeywords}
                                    onChange={(e) => setEditingBranchKeywords(e.target.value)}
                                    className="h-8"
                                    placeholder="Keywords..."
                                  />
                                ) : (
                                  branch.autoMatchKeywords?.join(', ') || '-'
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
                                      onClick={() => startEditBranch(branch.id, branch.name, branch.code, branch.autoMatchKeywords)}
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

        <TabsContent value="pages" className="space-y-4">
          <FloatingCard>
            <FloatingCardHeader className="flex flex-row items-center justify-between">
              <FloatingCardTitle> Facebook Pages ({pages?.length || 0})</FloatingCardTitle>
              <Button size="sm" onClick={handleSyncPages} disabled={syncingPages}>
                {syncingPages ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Sync Pages from Auth
              </Button>
            </FloatingCardHeader>
            <FloatingCardContent>
              {isLoadingPages ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !pages || pages.length === 0 ? (
                <EmptyState
                  icon={<LinkIcon className="h-8 w-8" />}
                  title="Chưa có page nào"
                  description="Nhấn nút 'Sync Pages' để lấy danh sách pages từ tài khoản Facebook của bạn."
                  className="py-12"
                />
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30 hover:bg-transparent">
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Page ID</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Tên Page</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Token Webhook</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Sync lần cuối</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pages.map((page: FBPage) => {
                        const isEditing = editingPageId === page.id;
                        return (
                          <TableRow key={page.id} className="border-border/30 hover:bg-muted/30 transition-colors">
                            <TableCell className="font-mono text-xs text-muted-foreground">{page.id}</TableCell>
                            <TableCell className="font-medium">{page.name}</TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Input
                                  value={newPageToken}
                                  onChange={(e) => setNewPageToken(e.target.value)}
                                  placeholder="Nhập Page Access Token..."
                                  className="h-8 text-xs"
                                />
                              ) : page.access_token ? (
                                <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/5">
                                  <Key className="h-3 w-3 mr-1" />
                                  Đã cấu hình
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 bg-yellow-400/5">
                                  Chưa cấu hình
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {page.last_synced_at ? new Date(page.last_synced_at).toLocaleString('vi-VN') : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {isEditing ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdatePageToken(page.id)}
                                    disabled={updatingPageToken}
                                  >
                                    {updatingPageToken ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                                    Lưu
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingPageId(null)}>
                                    Hủy
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingPageId(page.id);
                                    setNewPageToken(page.access_token || '');
                                  }}
                                  className="bg-muted/30 border-border/50 hover:bg-muted/50"
                                >
                                  Cấu hình Token
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </FloatingCardContent>
          </FloatingCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
