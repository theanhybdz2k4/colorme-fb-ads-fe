import { useJobs } from './useJobs';
import { getJobStatusVariant } from './jobs.types';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings } from 'lucide-react';
import {
  PageHeader,
  FloatingCard,
  FloatingCardHeader,
  FloatingCardTitle,
  FloatingCardContent,
  LoadingPage,
  EmptyState,
  EnergyBar,
} from '@/components/custom';

export function JobsPage() {
  const { data, isLoading } = useJobs(50);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6 animate-float-up">
      {/* Header */}
      <PageHeader
        title="Jobs"
        description="Lịch sử công việc crawl dữ liệu"
      />

      {/* Table */}
      <FloatingCard padding="none">
        <FloatingCardHeader className="p-4">
          <FloatingCardTitle>Jobs gần đây ({data?.length || 0})</FloatingCardTitle>
        </FloatingCardHeader>
        <FloatingCardContent className="p-0">
          {data?.length === 0 ? (
            <EmptyState
              icon={<Settings className="h-8 w-8" />}
              title="Chưa có job nào"
              description="Sync dữ liệu để thấy công việc crawl"
              className="py-12"
            />
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">ID</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Loại</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Account</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Trạng thái</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase w-32">Tiến độ</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Tạo lúc</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Hoàn thành</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.map((job) => {
                    const progress = job.totalRecords
                      ? Math.round((job.processedRecords || 0) / job.totalRecords * 100)
                      : 0;

                    return (
                      <TableRow key={job.id} className="border-border/30 hover:bg-muted/30 transition-colors">
                        <TableCell className="text-muted-foreground">#{job.id}</TableCell>
                        <TableCell className="font-mono text-xs">{job.jobType}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{job.accountId}</TableCell>
                        <TableCell>
                          <Badge variant={getJobStatusVariant(job.status)}>{job.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {job.totalRecords ? (
                            <div className="space-y-1">
                              <EnergyBar value={progress} size="sm" />
                              <span className="text-xs text-muted-foreground">
                                {job.processedRecords ?? 0} / {job.totalRecords}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(job.createdAt).toLocaleString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {job.completedAt ? new Date(job.completedAt).toLocaleString('vi-VN') : '-'}
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
    </div>
  );
}
