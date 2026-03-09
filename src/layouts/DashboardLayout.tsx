import { Outlet, useLocation } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { PlatformProvider } from '@/contexts';
import { Sidebar } from '@/components/shared/layout/Sidebar';
import { Header } from '@/components/shared/layout/Header';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';

function DashboardContent() {
  const location = useLocation();
  const [visibleSidebar, setVisibleSidebar] = useState(false);

  // Map pathname to Page Title
  const pageTitle = useMemo(() => {
    const route = location.pathname;
    if (route === ROUTES.DASHBOARD) return 'Tổng quan';
    if (route === ROUTES.ACCOUNTS) return 'Tài khoản Facebook';
    if (route === ROUTES.AD_ACCOUNTS) return 'Ad Accounts';
    if (route === ROUTES.CAMPAIGNS) return 'Chiến dịch';
    if (route === ROUTES.ADSETS) return 'Nhóm quảng cáo';
    if (route === ROUTES.ADS) return 'Quảng cáo';
    if (route === ROUTES.INSIGHTS) return 'Phân tích số liệu';
    if (route === ROUTES.LEADS) return 'Inbox & Leads';
    if (route === ROUTES.AI_REPORTS) return 'Báo cáo AI';
    if (route === ROUTES.SETTINGS) return 'Cài đặt';
    return 'Dashboard';
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-b-surface1 text-t-primary transition-colors duration-300">
      {/* Centralized Sidebar component */}
      <Sidebar
        visible={visibleSidebar}
        onClose={() => setVisibleSidebar(false)}
        expanded={true}
      />

      {/* Main content area */}
      <div
        className={cn(
          "transition-all duration-300 min-h-screen p-5 max-md:p-3",
          "pl-85 max-4xl:pl-70 max-3xl:pl-60 max-xl:pl-0"
        )}
      >
        {/* Centralized Header component */}
        <Header
          onToggleSidebar={() => setVisibleSidebar(true)}
          title={pageTitle}
        />

        {/* Dynamic Page Content */}
        <main className="pt-22 pb-5 max-md:pt-18">
          <div className="center-with-sidebar animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  return (
    <PlatformProvider>
      <DashboardContent />
    </PlatformProvider>
  );
}
