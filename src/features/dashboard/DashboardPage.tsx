import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { Badge } from '@/components/ui/badge';
import { adAccountsApi } from '@/features/adAccounts';
import { campaignsApi } from '@/features/campaigns';
import { jobsApi } from '@/features/jobs';
import {
  PageHeader,
  StatsCard,
  StatsGrid,
  FloatingCard,
  FloatingCardHeader,
  FloatingCardTitle,
  FloatingCardContent,
  LoadingPage,
  EmptyState,
} from '@/components/custom';
import { Users, CreditCard, Megaphone, Settings } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();

  const { data: adAccounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ['ad-accounts'],
    queryFn: async () => {
      const { data } = await adAccountsApi.list();
      return data.result || data.data || data || [];
    },
  });

  const { data: campaigns, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data } = await campaignsApi.list();
      return data.result || data.data || data || [];
    },
  });

  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        const { data } = await jobsApi.list(10);
        return data.result || data.data || data || [];
      } catch {
        return [];
      }
    },
  });

  const isLoading = loadingAccounts || loadingCampaigns || loadingJobs;
  const activeCampaigns = campaigns?.filter((c: { status: string }) => c.status === 'ACTIVE')?.length || 0;

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6 animate-float-up">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description={`Xin chào, ${user?.name || user?.email}! Đây là tổng quan tài khoản của bạn.`}
      />

      {/* Stats Grid */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Tài khoản FB"
          value={user?.fbAccounts?.length || 0}
          subtitle="Đã kết nối"
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          title="Ad Accounts"
          value={adAccounts?.length || 0}
          subtitle="Tài khoản quảng cáo"
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatsCard
          title="Campaigns"
          value={campaigns?.length || 0}
          subtitle={`${activeCampaigns} đang chạy`}
          icon={<Megaphone className="h-4 w-4" />}
        />
        <StatsCard
          title="Jobs"
          value={jobs?.length || 0}
          subtitle="Công việc gần đây"
          icon={<Settings className="h-4 w-4" />}
        />
      </StatsGrid>

      {/* Content Grid - Asymmetric */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Ad Accounts - Takes more space */}
        <FloatingCard padding="none" className="lg:col-span-3">
          <FloatingCardHeader className="p-4">
            <FloatingCardTitle>Ad Accounts</FloatingCardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Danh sách tài khoản đã sync</p>
          </FloatingCardHeader>
          <FloatingCardContent className="p-4 pt-0">
            {!adAccounts?.length ? (
              <EmptyState
                title="Chưa có ad account"
                description="Sync tài khoản từ Facebook để bắt đầu"
              />
            ) : (
              <div className="space-y-2">
                {adAccounts?.slice(0, 5).map((account: { id: string; name: string; accountStatus: number }) => (
                  <div 
                    key={account.id} 
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-sm text-foreground">{account.name || account.id}</span>
                    <Badge 
                      variant={account.accountStatus === 1 ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {account.accountStatus === 1 ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </FloatingCardContent>
        </FloatingCard>

        {/* Jobs - Smaller */}
        <FloatingCard padding="none" className="lg:col-span-2">
          <FloatingCardHeader className="p-4">
            <FloatingCardTitle>Jobs gần đây</FloatingCardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Trạng thái công việc crawl</p>
          </FloatingCardHeader>
          <FloatingCardContent className="p-4 pt-0">
            {!jobs?.length ? (
              <EmptyState
                title="Chưa có job"
                description="Sync dữ liệu để thấy jobs"
              />
            ) : (
              <div className="space-y-2">
                {jobs?.slice(0, 5).map((job: { id: number; jobType: string; status: string }) => (
                  <div 
                    key={job.id} 
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-sm text-foreground font-mono">{job.jobType}</span>
                    <Badge
                      variant={
                        job.status === 'COMPLETED'
                          ? 'default'
                          : job.status === 'RUNNING'
                            ? 'secondary'
                            : job.status === 'FAILED'
                              ? 'destructive'
                              : 'outline'
                      }
                      className="text-xs"
                    >
                      {job.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </FloatingCardContent>
        </FloatingCard>
      </div>
    </div>
  );
}
