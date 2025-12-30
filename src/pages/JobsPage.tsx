import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Job {
  id: number;
  jobType: string;
  status: string;
  accountId: string;
  totalRecords: number | null;
  processedRecords: number | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'COMPLETED': return 'default';
    case 'RUNNING': return 'secondary';
    case 'FAILED': return 'destructive';
    default: return 'outline';
  }
};

export function JobsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        const { data } = await jobsApi.list(50);
        return (data.result || data.data || data || []) as Job[];
      } catch {
        return [] as Job[];
      }
    },
    refetchInterval: 5000, // Auto refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Jobs</h1>
        <p className="text-muted-foreground">Lịch sử công việc crawl dữ liệu</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jobs gần đây ({data?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Chưa có job nào</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tiến độ</TableHead>
                  <TableHead>Tạo lúc</TableHead>
                  <TableHead>Hoàn thành</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>#{job.id}</TableCell>
                    <TableCell className="font-mono text-xs">{job.jobType}</TableCell>
                    <TableCell className="font-mono text-xs">{job.accountId}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {job.processedRecords ?? '-'} / {job.totalRecords ?? '-'}
                    </TableCell>
                    <TableCell>{new Date(job.createdAt).toLocaleString('vi-VN')}</TableCell>
                    <TableCell>
                      {job.completedAt ? new Date(job.completedAt).toLocaleString('vi-VN') : '-'}
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
