
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { KpiSection } from './sections/KpiSection';
import { LoadingPage } from '@/components/shared/common';

function DashboardContent() {
  const { user, isLoading } = useDashboard();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="max-lg:block animate-in fade-in duration-500">
          <p className="text-body-2 text-t-secondary transition-colors mb-6">
            Xin chào, <span className="font-bold text-t-primary">{user?.name || user?.email}</span>! Đây là tổng quan hiệu suất trong 30 ngày qua.
          </p>
        <KpiSection />
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
