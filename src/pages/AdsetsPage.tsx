import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adsetsApi, syncApi, campaignsApi } from '@/lib/api';
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

interface Adset {
  id: string;
  name: string | null;
  status: string;
  effectiveStatus: string | null;
  dailyBudget: string | null;
  optimizationGoal: string | null;
  accountId: string;
  campaignId: string;
  syncedAt: string;
}

interface Campaign {
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

export function AdsetsPage() {
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingAdset, setSyncingAdset] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  // Fetch active campaigns for dropdown
  const { data: campaigns } = useQuery({
    queryKey: ['activeCampaigns'],
    queryFn: async () => {
      const { data } = await campaignsApi.list(undefined, 'ACTIVE');
      return (data.result || data.data || data || []) as Campaign[];
    },
  });

  // Server-side filtering by campaign
  const { data, isLoading } = useQuery({
    queryKey: ['adsets', selectedCampaign, statusFilter, searchQuery],
    queryFn: async () => {
      const campaignId = selectedCampaign === 'all' ? undefined : selectedCampaign;
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const search = searchQuery || undefined;
      const { data } = await adsetsApi.list(undefined, campaignId, status, search);
      return (data.result || data.data || data || []) as Adset[];
    },
  });

  const handleSyncAllActive = async () => {
    setSyncingAll(true);
    try {
      let campaignIdsToSync: string[] = [];

      if (selectedCampaign !== 'all') {
        // Sync adsets for the selected campaign
        campaignIdsToSync = [selectedCampaign];
      } else {
        // Sync adsets for all active campaigns
        if (!campaigns || campaigns.length === 0) {
          toast.error('Không có campaign nào đang active');
          return;
        }
        campaignIdsToSync = campaigns.map(c => c.id);
      }

      // Sync adsets by campaign ID
      for (const campaignId of campaignIdsToSync) {
        await syncApi.entitiesByCampaign(campaignId);
      }
      
      toast.success(`Đã bắt đầu sync Adsets cho ${campaignIdsToSync.length} campaigns`, {
        description: 'Kiểm tra Jobs để xem tiến trình',
      });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['adsets'] });
      }, 5000);
    } catch (error) {
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
    } catch (error) {
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

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || selectedCampaign !== 'all';

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
          <h1 className="text-2xl font-bold">Ad Sets</h1>
          <p className="text-muted-foreground">Danh sách nhóm quảng cáo</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-56">
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
          <CardTitle>Ad Sets ({data?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {hasActiveFilters
                ? 'Không tìm thấy adset phù hợp với bộ lọc.'
                : 'Chưa có adset nào. Hãy chạy sync.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Mục tiêu tối ưu</TableHead>
                  <TableHead>Ngân sách/ngày</TableHead>
                  <TableHead>Sync lần cuối</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((adset) => (
                  <TableRow key={adset.id}>
                    <TableCell className="font-medium">{adset.name || adset.id}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(adset.effectiveStatus || adset.status)}>
                        {adset.effectiveStatus || adset.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{adset.optimizationGoal || '-'}</TableCell>
                    <TableCell>{adset.dailyBudget || '-'}</TableCell>
                    <TableCell>{new Date(adset.syncedAt).toLocaleString('vi-VN')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSyncAds(adset)}
                        disabled={syncingAdset === adset.id}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
