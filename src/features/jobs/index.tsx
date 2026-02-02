import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '@/api/jobs.api';
import { RefreshCcw, Send } from 'lucide-react';
import {
  PageHeader,
  FloatingCard,
  FloatingCardHeader,
  FloatingCardTitle,
  FloatingCardContent,
} from '@/components/custom';
import { Button } from '@/components/ui/button';
import { JobTable } from './components/JobTable';
import { toast } from 'sonner';

export function JobsPage() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['sync-jobs'],
    queryFn: () => jobsApi.list({ limit: 50 }).then((res) => res.data),
    refetchInterval: 10000, // Auto refresh every 10s
  });

  const dispatchMutation = useMutation({
    mutationFn: (data: { cronType?: string }) => jobsApi.dispatch(data),
    onSuccess: () => {
      toast.success('Đã gửi yêu cầu đồng bộ');
      queryClient.invalidateQueries({ queryKey: ['sync-jobs'] });
    },
    onError: (error: any) => {
      toast.error('Lỗi khi gửi yêu cầu: ' + (error.response?.data?.error || error.message));
    },
  });

  const handleManualSync = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.info('Đã cập nhật danh sách công việc');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTriggerSync = () => {
    dispatchMutation.mutate({ cronType: 'full' });
  };

  return (
    <div className="space-y-6 animate-float-up p-6">
      {/* Header */}
      <PageHeader
        title="Jobs"
        description="Lịch sử công việc crawl dữ liệu"
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSync}
            disabled={isRefreshing || isLoading}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button
            size="sm"
            onClick={handleTriggerSync}
            disabled={dispatchMutation.isPending}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Đồng bộ ngay
          </Button>
        </div>
      </PageHeader>

      {/* Content */}
      <FloatingCard padding="none">
        <FloatingCardHeader className="p-4 border-b">
          <FloatingCardTitle>Jobs gần đây</FloatingCardTitle>
        </FloatingCardHeader>
        <FloatingCardContent className="p-0">
          <JobTable jobs={data?.data || []} isLoading={isLoading} />
        </FloatingCardContent>
      </FloatingCard>
    </div>
  );
}

