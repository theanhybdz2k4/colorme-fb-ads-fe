import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';

export interface Job {
  id: number;
  jobType: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  account?: {
    id: number;
    name: string;
    external_id: string;
  };
}

interface JobTableProps {
  jobs: Job[];
  isLoading: boolean;
}

export function JobTable({ jobs, isLoading }: JobTableProps) {
  const getStatusBadge = (status: Job['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600 text-white border-transparent">
            <CheckCircle2 className="h-3 w-3" /> Hoàn thành
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Thất bại
          </Badge>
        );
      case 'RUNNING':
        return (
          <Badge variant="secondary" className="gap-1 animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" /> Đang chạy
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" /> Chờ
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Công việc</TableHead>
            <TableHead>Tài khoản</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Bắt đầu</TableHead>
            <TableHead>Hoàn thành</TableHead>
            <TableHead className="text-right">Tạo lúc</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Chưa có dữ liệu.
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{job.jobType}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">#{job.id}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {job.account ? (
                    <div className="flex flex-col">
                      <span className="font-medium truncate max-w-[150px]">{job.account.name}</span>
                      <span className="text-[10px] text-muted-foreground">{job.account.external_id}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">N/A</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell className="text-xs font-mono">
                  {job.startedAt ? format(new Date(job.startedAt), 'HH:mm:ss') : '-'}
                </TableCell>
                <TableCell className="text-xs font-mono">
                  {job.completedAt ? format(new Date(job.completedAt), 'HH:mm:ss') : '-'}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {format(new Date(job.createdAt), 'dd/MM HH:mm')}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
