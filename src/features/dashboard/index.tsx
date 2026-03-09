
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { KpiSection } from './sections/KpiSection';
import { AccountDetailsSection } from './sections/AccountDetailsSection';
import { QuickInsightsSection } from './sections/QuickInsightsSection';
import { LoadingPage } from '@/components/shared/common';

function DashboardContent() {
  const { user, isLoading } = useDashboard();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="flex max-lg:block animate-in fade-in duration-500">
      <div className="col-left">
        <div className="flex flex-col gap-1 mb-8">
          <p className="text-body-2 text-t-secondary transition-colors">
            Xin chào, <span className="font-bold text-t-primary">{user?.name || user?.email}</span>! Đây là tổng quan hiệu suất trong 30 ngày qua.
          </p>
        </div>

        {/* Primary KPIs */}
        <KpiSection />

        <div className="mt-8">
          <AccountDetailsSection />
        </div>
      </div>

      <div className="col-right">
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
