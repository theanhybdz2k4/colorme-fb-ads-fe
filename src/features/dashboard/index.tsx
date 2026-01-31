
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { KpiSection } from './sections/KpiSection';
import { AccountDetailsSection } from './sections/AccountDetailsSection';
import { QuickInsightsSection } from './sections/QuickInsightsSection';
import { LoadingPage } from '@/components/custom';

function DashboardContent() {
  const { user, isLoading } = useDashboard();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold bg-clip-text text-foreground tracking-tight">
          Hệ thống Quản lý Quảng cáo
        </h1>
        <p className="text-muted-foreground">
          Xin chào, <span className="font-semibold text-foreground">{user?.name || user?.email}</span>! Tổng quan hiệu suất trong 30 ngày qua.
        </p>
      </div>

      {/* Primary KPIs */}
      <KpiSection />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats Summary & Campaigns */}
        <AccountDetailsSection />

        {/* Real-time Insights & Tips */}
        <QuickInsightsSection />
      </div>
    </div>
  );
}

export function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
