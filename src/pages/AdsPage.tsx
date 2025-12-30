import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adsApi, syncApi, adsetsApi } from '@/lib/api';
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

interface Ad {
  id: string;
  name: string | null;
  status: string;
  effectiveStatus: string | null;
  accountId: string;
  adsetId: string;
  syncedAt: string;
}

interface Adset {
  id: string;
  name: string | null;
  accountId: string;
}

const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'ACTIVE': return 'default';
    case 'PAUSED': return 'secondary';
    case 'DELETED': return 'destructive';
    default: return 'outline';
  }
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
];

export function AdsPage() {
  const queryClient = useQueryClient();
  const [selectedAdset, setSelectedAdset] = useState<string>('all');
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingAd, setSyncingAd] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  // Fetch active adsets for dropdown
  const { data: adsets } = useQuery({
    queryKey: ['activeAdsets'],
    queryFn: async () => {
      const { data } = await adsetsApi.list(undefined, undefined, 'ACTIVE');
      return (data.result || data.data || data || []) as Adset[];
    },
  });

  // Server-side filtering by adset
  const { data, isLoading } = useQuery({
    queryKey: ['ads', selectedAdset, statusFilter, searchQuery],
    queryFn: async () => {
      const adsetId = selectedAdset === 'all' ? undefined : selectedAdset;
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const search = searchQuery || undefined;
      const { data } = await adsApi.list(undefined, adsetId, status, search);
      return (data.result || data.data || data || []) as Ad[];
    },
  });

  const handleSyncAllActive = async () => {
    setSyncingAll(true);
    try {
      let adsetIdsToSync: string[] = [];

      if (selectedAdset !== 'all') {
        // Sync ads for the selected adset
        adsetIdsToSync = [selectedAdset];
      } else {
        // Sync ads for all active adsets
        if (!adsets || adsets.length === 0) {
          toast.error('Không có adset nào đang active');
          return;
        }
        adsetIdsToSync = adsets.map(a => a.id);
      }

      // Sync ads by adset ID
      for (const adsetId of adsetIdsToSync) {
        await syncApi.entitiesByAdset(adsetId);
      }
      
      toast.success(`Đã bắt đầu sync Ads cho ${adsetIdsToSync.length} adsets`, {
        description: 'Kiểm tra Jobs để xem tiến trình',
      });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['ads'] });
      }, 5000);
    } catch (error) {
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
    } catch (error) {
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
          <h1 className="text-2xl font-bold">Ads</h1>
          <p className="text-muted-foreground">Danh sách quảng cáo</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedAdset} onValueChange={setSelectedAdset}>
            <SelectTrigger className="w-56">
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
        </div>
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
          <CardTitle>Ads ({data?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {hasActiveFilters
                ? 'Không tìm thấy ads phù hợp với bộ lọc.'
                : 'Chưa có ads nào. Hãy chạy sync.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Sync lần cuối</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell className="font-mono text-xs">{ad.id}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate" title={ad.name || '-'}>
                      {ad.name || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(ad.effectiveStatus || ad.status)}>
                        {ad.effectiveStatus || ad.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(ad.syncedAt).toLocaleString('vi-VN')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSyncInsights(ad)}
                        disabled={syncingAd === ad.id}
                      >
                        {syncingAd === ad.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-1" />
                        )}
                        Sync Insights
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
