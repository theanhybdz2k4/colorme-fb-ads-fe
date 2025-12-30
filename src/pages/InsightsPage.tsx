import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { insightsApi, syncApi, adsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, RefreshCw } from 'lucide-react';

interface Insight {
  date: string;
  adId: string;
  impressions: string | null;
  clicks: string | null;
  spend: string | null;
  reach: string | null;
}

interface Ad {
  id: string;
  name: string | null;
  accountId: string;
}

export function InsightsPage() {
  const queryClient = useQueryClient();
  const [selectedAd, setSelectedAd] = useState<string>('all');
  const [syncing, setSyncing] = useState(false);
  // Default to today only
  const today = new Date().toISOString().split('T')[0];
  const [dateStart, setDateStart] = useState(today);
  const [dateEnd, setDateEnd] = useState(today);

  // Fetch active ads for dropdown
  const { data: ads } = useQuery({
    queryKey: ['activeAds'],
    queryFn: async () => {
      const { data } = await adsApi.list(undefined, undefined, 'ACTIVE');
      return (data.result || data.data || data || []) as Ad[];
    },
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['insights', dateStart, dateEnd],
    queryFn: async () => {
      const { data } = await insightsApi.list(undefined, dateStart, dateEnd);
      return (data.result || data.data || data || []) as Insight[];
    },
    enabled: !!dateStart && !!dateEnd,
  });

  const handleSync = async () => {
    setSyncing(true);
    try {
      let adIdsToSync: string[] = [];

      if (selectedAd !== 'all') {
        // Sync insights for the selected ad
        adIdsToSync = [selectedAd];
      } else {
        // Sync insights for all active ads
        if (!ads || ads.length === 0) {
          toast.error('Không có ads nào đang active');
          return;
        }
        adIdsToSync = ads.map(a => a.id);
      }

      // Sync insights by ad ID
      for (const adId of adIdsToSync) {
        await syncApi.insightsByAd(adId, dateStart, dateEnd, 'all');
      }

      toast.success(`Đã bắt đầu sync Insights cho ${adIdsToSync.length} ads`, {
        description: `Từ ${dateStart} đến ${dateEnd}`,
      });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['insights'] });
      }, 5000);
    } catch (error) {
      toast.error('Lỗi sync Insights');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="text-muted-foreground">Dữ liệu hiệu suất quảng cáo theo ngày</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedAd} onValueChange={setSelectedAd}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Chọn Ad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả Ads</SelectItem>
              {ads?.map((ad) => (
                <SelectItem key={ad.id} value={ad.id} title={ad.name || ad.id}>
                  <span className="block max-w-[180px] truncate">{ad.name || ad.id}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Insights
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="dateStart">Từ ngày</Label>
              <Input
                id="dateStart"
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateEnd">Đến ngày</Label>
              <Input
                id="dateEnd"
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
            </div>
            <Button onClick={() => refetch()}>Tìm kiếm</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kết quả ({data?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : data?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Không có dữ liệu</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Ad ID</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Reach</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((insight, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{new Date(insight.date).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="font-mono text-xs">{insight.adId}</TableCell>
                    <TableCell className="text-right">{insight.impressions || '0'}</TableCell>
                    <TableCell className="text-right">{insight.reach || '0'}</TableCell>
                    <TableCell className="text-right">{insight.clicks || '0'}</TableCell>
                    <TableCell className="text-right">{insight.spend || '0'}</TableCell>
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
