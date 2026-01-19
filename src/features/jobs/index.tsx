export { jobsApi } from '@/api/jobs.api';
import { Settings } from 'lucide-react';
import {
  PageHeader,
  FloatingCard,
  FloatingCardHeader,
  FloatingCardTitle,
  FloatingCardContent,
  EmptyState,
} from '@/components/custom';

export function JobsPage() {
  return (
    <div className="space-y-6 animate-float-up">
      {/* Header */}
      <PageHeader
        title="Jobs"
        description="Lịch sử công việc crawl dữ liệu"
      />

      {/* Content */}
      <FloatingCard padding="none">
        <FloatingCardHeader className="p-4">
          <FloatingCardTitle>Jobs gần đây</FloatingCardTitle>
        </FloatingCardHeader>
        <FloatingCardContent className="p-0">
          <EmptyState
            icon={<Settings className="h-8 w-8" />}
            title="Tính năng đang phát triển"
            description="Backend chưa có endpoint cho Jobs, tính năng này sẽ được triển khai sau."
            className="py-12"
          />
        </FloatingCardContent>
      </FloatingCard>
    </div>
  );
}

