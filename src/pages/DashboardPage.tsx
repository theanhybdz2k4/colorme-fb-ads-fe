import { useQuery } from '@tanstack/react-query';
import { adAccountsApi, campaignsApi, jobsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DashboardPage() {
    const { user } = useAuth();

    const { data: adAccounts } = useQuery({
        queryKey: ['ad-accounts'],
        queryFn: async () => {
            const { data } = await adAccountsApi.list();
            return data.result || data.data || data || [];
        },
    });

    const { data: campaigns } = useQuery({
        queryKey: ['campaigns'],
        queryFn: async () => {
            const { data } = await campaignsApi.list();
            return data.result || data.data || data || [];
        },
    });

    const { data: jobs } = useQuery({
        queryKey: ['jobs'],
        queryFn: async () => {
            try {
                const { data } = await jobsApi.list(10);
                return data.result || data.data || data || [];
            } catch {
                return []; // Return empty array on error
            }
        },
    });

    const activeCampaigns = campaigns?.filter((c: { status: string }) => c.status === 'ACTIVE')?.length || 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Xin chào, {user?.name || user?.email}! Đây là tổng quan về tài khoản của bạn.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tài khoản FB</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user?.fbAccounts?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Tài khoản đã kết nối
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ad Accounts</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <rect width="20" height="14" x="2" y="5" rx="2" />
                            <path d="M2 10h20" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{adAccounts?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Tài khoản quảng cáo
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{campaigns?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {activeCampaigns} đang chạy
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jobs gần đây</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{jobs?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Công việc crawl
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Ad Accounts</CardTitle>
                        <CardDescription>Danh sách tài khoản quảng cáo đã sync</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {adAccounts?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Chưa có ad account nào</p>
                        ) : (
                            <div className="space-y-2">
                                {adAccounts?.slice(0, 5).map((account: { id: string; name: string; accountStatus: number }) => (
                                    <div key={account.id} className="flex items-center justify-between">
                                        <span className="text-sm">{account.name || account.id}</span>
                                        <Badge variant={account.accountStatus === 1 ? 'default' : 'secondary'}>
                                            {account.accountStatus === 1 ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Jobs gần đây</CardTitle>
                        <CardDescription>Trạng thái công việc crawl</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {jobs?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Chưa có job nào</p>
                        ) : (
                            <div className="space-y-2">
                                {jobs?.slice(0, 5).map((job: { id: number; jobType: string; status: string }) => (
                                    <div key={job.id} className="flex items-center justify-between">
                                        <span className="text-sm">{job.jobType}</span>
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
                                        >
                                            {job.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
