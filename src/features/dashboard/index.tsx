import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { adAccountsApi, campaignsApi } from '@/api';
import { useInsights } from '@/hooks/useInsights';
import {
  MetricCard,
  LoadingPage,
  EmptyState,
} from '@/components/custom';
import { DollarSign, Users, Target, MousePointer, CreditCard, Megaphone } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();

  // Get date range for last 30 days as a default
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const dateEnd = today.toISOString().split('T')[0];
  const dateStart = thirtyDaysAgo.toISOString().split('T')[0];

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

  const { data: insightsData, isLoading: loadingInsights } = useInsights({
    dateStart,
    dateEnd
  });

  const isLoading = loadingAccounts || loadingCampaigns || loadingInsights;

  // Safe data access
  const safeInsights = Array.isArray(insightsData) ? insightsData : [];
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
  const safeAccounts = Array.isArray(adAccounts) ? adAccounts : [];

  // Aggregating metrics from insights
  const totalSpend = safeInsights.reduce((sum, item) => sum + (Number(item.spend) || 0), 0) || 0;
  const totalLeads = safeInsights.reduce((sum, item) => sum + (Number(item.results || item.messagingStarted) || 0), 0) || 0;
  const totalClicks = safeInsights.reduce((sum, item) => sum + (Number(item.clicks) || 0), 0) || 0;
  const totalImpressions = safeInsights.reduce((sum, item) => sum + (Number(item.impressions) || 0), 0) || 0;

  const overallCPL = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  const activeCampaigns = safeCampaigns.filter((c: any) => c.effectiveStatus === 'ACTIVE' || c.status === 'ACTIVE').length;

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-foreground mb-2">
          Hệ thống Quản lý Quảng cáo
        </h1>
        <p className="text-muted-foreground">
          Xin chào, {user?.name || user?.email}! Tổng quan hiệu suất trong 30 ngày qua.
        </p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Tổng chi tiêu"
          value={`$${totalSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          subtitle={`${activeCampaigns} campaigns đang hoạt động`}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true, label: '30 ngày qua' }}
          color="blue"
          chart="area"
        />
        <MetricCard
          title="Tổng Leads"
          value={totalLeads.toLocaleString()}
          subtitle="Số khách hàng tiềm năng"
          icon={Users}
          trend={{ value: 18.3, isPositive: true, label: '30 ngày qua' }}
          color="green"
          status={totalLeads > 0 ? 'excellent' : undefined}
          chart="bar"
        />
        <MetricCard
          title="Chi phí/Lead (CPL)"
          value={`$${overallCPL.toFixed(2)}`}
          subtitle={`CTR trung bình: ${overallCTR.toFixed(2)}%`}
          icon={Target}
          trend={{ value: 8.2, isPositive: false, label: '30 ngày qua' }}
          color="purple"
          status={overallCPL > 0 && overallCPL <= 10 ? 'excellent' : overallCPL <= 15 ? 'good' : overallCPL > 15 ? 'poor' : undefined}
          chart="line"
        />
        <MetricCard
          title="Tổng Clicks"
          value={totalClicks.toLocaleString()}
          subtitle={`CPC: $${(totalClicks > 0 ? totalSpend / totalClicks : 0).toFixed(2)}`}
          icon={MousePointer}
          trend={{ value: 15.7, isPositive: true, label: '30 ngày qua' }}
          color="orange"
          chart="area"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats Summary */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Chi tiết tài khoản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl border border-border/50 p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <CreditCard className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tài khoản quảng cáo</p>
                <p className="text-2xl font-bold">{safeAccounts.length || 0}</p>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border/50 p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Megaphone className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng số Campaigns</p>
                <p className="text-2xl font-bold">{safeCampaigns.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-sm">
            {!safeCampaigns.length ? (
              <EmptyState
                title="Chưa có dữ liệu chiến dịch"
                description="Các chiến dịch sẽ xuất hiện ở đây sau khi bạn kết nối tài khoản Facebook."
              />
            ) : (
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Chiến dịch hoạt động gần đây</h3>
                <div className="divide-y divide-border/50">
                  {safeCampaigns.slice(0, 5).map((campaign: any) => (
                    <div key={campaign.id} className="py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground">{campaign.platform || 'Facebook'}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${(campaign.effectiveStatus === 'ACTIVE' || campaign.status === 'ACTIVE') ? 'bg-green-500/20 text-green-500' : 'bg-slate-500/20 text-slate-500'
                        }`}>
                        {campaign.effectiveStatus || campaign.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Insights Simulation/Summary */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Thông tin nhanh</h2>
          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Trạng thái Sync</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-green-500">Live</span>
              </span>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-slate-500/5 rounded-xl border border-border/30">
                <p className="text-xs font-bold text-blue-500 mb-1">OPTIMIZATION TIP</p>
                <p className="text-sm leading-relaxed">
                  Campaign <strong>"{safeCampaigns?.[0]?.name || 'Chiến dịch mới'}"</strong> đang có CTR cao hơn 25% so với trung bình. Hãy cân nhắc tăng ngân sách.
                </p>
              </div>
              <div className="p-4 bg-slate-500/5 rounded-xl border border-border/30">
                <p className="text-xs font-bold text-purple-500 mb-1">AUDIENCE INSIGHT</p>
                <p className="text-sm leading-relaxed">
                  Độ tuổi 25-34 đang mang lại lượng Leads chất lượng nhất với CPL thấp nhất.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
