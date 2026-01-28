import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/features/auth';
import { ThemeProvider } from "@/components/theme-provider"
import { DashboardLayout } from '@/layouts/DashboardLayout';

// Lazy load feature components
const LoginPage = lazy(() => import('@/features/auth').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/features/auth').then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('@/features/dashboard/index').then(m => ({ default: m.DashboardPage })));
const AccountsPage = lazy(() => import('@/features/accounts').then(m => ({ default: m.AccountsPage })));
const AdAccountsPage = lazy(() => import('@/features/adAccounts').then(m => ({ default: m.AdAccountsPage })));
const CampaignsPage = lazy(() => import('@/features/campaigns').then(m => ({ default: m.CampaignsPage })));
const AdSetsPage = lazy(() => import('@/features/adSets').then(m => ({ default: m.AdSetsPage })));
const AdsPage = lazy(() => import('@/features/advertisements').then(m => ({ default: m.AdsPage })));
const AdDetailPage = lazy(() => import('@/features/advertisements').then(m => ({ default: m.AdDetailPage })));
const InsightsPage = lazy(() => import('@/features/insights').then(m => ({ default: m.InsightsPage })));
const BranchAnalyticsPage = lazy(() => import('@/features/insights').then(m => ({ default: m.BranchAnalytics })));
const LeadInsightsPage = lazy(() => import('@/features/leads').then(m => ({ default: m.LeadsPage })));
const JobsPage = lazy(() => import('@/features/jobs').then(m => ({ default: m.JobsPage })));
const CronSettingsPage = lazy(() => import('@/features/settings').then(m => ({ default: m.CronSettingsPage })));
const ProfilePage = lazy(() => import('@/features/profile/sections/ProfilePage').then(m => ({ default: m.ProfilePage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const hasToken = !!localStorage.getItem('accessToken');

  // If we have a token, we show the app layout immediately even if /me is still loading
  if (isLoading && !hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">Đang tải ứng dụng...</p>
        </div>
      </div>
    }>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="ad-accounts" element={<AdAccountsPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="adsets" element={<AdSetsPage />} />
          <Route path="ads" element={<AdsPage />} />
          <Route path="ads/:adId" element={<AdDetailPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="branch-analytics" element={<BranchAnalyticsPage />} />
          <Route path="lead-insights" element={<LeadInsightsPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="settings" element={<CronSettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
            <Toaster position="top-right" />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
