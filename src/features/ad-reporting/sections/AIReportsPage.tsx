import { useState, useEffect } from 'react';
import { useAdAccounts } from '@/hooks/useAdAccounts';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Link, useSearchParams } from 'react-router-dom';
import { Brain, Megaphone, Users, ArrowRight, CheckCircle2, Clock, Building2, RefreshCw } from 'lucide-react';
import { ROUTES } from '@/constants';
import { PageHeader, LoadingPage, EmptyState, PlatformIcon } from '@/components/shared/common';
import { FloatingCard } from '@/components/shared/common/FloatingCard';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export function AIReportsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'campaigns';

    const handleTabChange = (value: string) => {
        searchParams.set('tab', value);
        setSearchParams(searchParams);
    };

    // Mặc định lấy 7 ngày qua của campaigns
    const dateStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dateEnd = new Date().toISOString().split('T')[0];

    const { data: accounts, isLoading: loadingAccounts } = useAdAccounts({ accountStatus: 'ACTIVE' });
    const { data: branches, isLoading: loadingBranches } = useQuery({
        queryKey: ['branches'],
        queryFn: () => apiClient.get('/branches').then(res => res.data.result || res.data.data || res.data || [])
    });
    const { data: campaigns, isLoading: loadingCampaigns } = useCampaigns({
        effectiveStatus: 'ACTIVE',
        dateStart,
        dateEnd
    });

    const [existingReports, setExistingReports] = useState<Record<string, { createdAt: string }>>({});
    const [loadingReports, setLoadingReports] = useState(true);

    useEffect(() => {
        const fetchExistingReports = async () => {
            try {
                const { data, error } = await supabase
                    .from('ai_reports')
                    .select('reference_id, type, created_at')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const mapping: Record<string, { createdAt: string }> = {};
                data?.forEach(report => {
                    const key = `${report.type}:${report.reference_id}`;
                    // Only keep the latest report for each entity
                    if (!mapping[key]) {
                        mapping[key] = { createdAt: report.created_at };
                    }
                });

                setExistingReports(mapping);
            } catch (err) {
                console.error('Error fetching existing reports:', err);
            } finally {
                setLoadingReports(false);
            }
        };

        fetchExistingReports();
    }, []);

    if (loadingAccounts && loadingCampaigns && loadingBranches && loadingReports) return <LoadingPage />;

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Trung tâm Báo Cáo AI"
                description="Tự động sinh báo cáo chuyên sâu và phân tích số liệu với trí tuệ nhân tạo Gemini."
            />

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="flex items-center justify-between mb-6">
                    <TabsList className="bg-muted/30 border border-border/50">
                        <TabsTrigger value="campaigns" className="flex items-center gap-2">
                            <Megaphone className="w-4 h-4" /> Báo cáo Chiến Dịch
                        </TabsTrigger>
                        <TabsTrigger value="accounts" className="flex items-center gap-2">
                            <Users className="w-4 h-4" /> Báo cáo Tài Khoản
                        </TabsTrigger>
                        <TabsTrigger value="branches" className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Báo cáo Chi Nhánh
                        </TabsTrigger>
                    </TabsList>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setLoadingReports(true);
                            // fetchExistingReports is internal to useEffect, let's pull it out
                            window.location.reload(); // Simple way for now or I can refactor
                        }}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loadingReports ? 'animate-spin' : ''}`} />
                        Làm mới danh sách
                    </Button>
                </div>

                <TabsContent value="campaigns" className="space-y-4">
                    {campaigns?.length === 0 ? (
                        <EmptyState title="Không tìm thấy chiến dịch nào đang chạy" description="Hãy kiểm tra lại danh sách campaigns" icon={<Megaphone className="w-8 h-8" />} />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {campaigns?.map((camp: any) => (
                                <FloatingCard key={camp.id}>
                                    <div className="p-5 flex flex-col h-full bg-linear-to-br hover:from-indigo-500/5 hover:to-purple-500/5 transition-colors">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                                                <PlatformIcon platformCode={camp.account?.platform?.code || 'facebook'} size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-semibold text-sm line-clamp-2" title={camp.name}>{camp.name}</h3>
                                                    {existingReports[`campaign:${camp.id}`] && (
                                                        <Badge variant="outline" className="shrink-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 px-2 py-0.5 rounded-full font-medium">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Đã có báo cáo
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 truncate">{camp.account?.name}</p>
                                                {existingReports[`campaign:${camp.id}`] && (
                                                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-emerald-600/70">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{format(new Date(existingReports[`campaign:${camp.id}`].createdAt), 'HH:mm dd/MM/yyyy', { locale: vi })}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-4 flex gap-2 w-full border-t border-border/50">
                                            <Button
                                                variant={existingReports[`campaign:${camp.id}`] ? "outline" : "default"}
                                                asChild
                                                className={`w-full font-medium rounded-full shadow-md transition-all duration-300 ${existingReports[`campaign:${camp.id}`]
                                                    ? "border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-600"
                                                    : "bg-primary-01 hover:bg-primary-01/90 text-white shadow-primary-01/20 hover:shadow-primary-01/40"
                                                    }`}
                                            >
                                                <Link to={`${ROUTES.AD_REPORTING.replace(':id', camp.id)}?dateStart=${dateStart}&dateEnd=${dateEnd}`}>
                                                    <Brain className="w-4 h-4 mr-2" />
                                                    {existingReports[`campaign:${camp.id}`] ? "Xem Báo Cáo AI" : "Tạo Báo Cáo AI"}
                                                    <ArrowRight className="w-3 h-3 ml-2 opacity-50" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </FloatingCard>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="accounts" className="space-y-4">
                    {accounts?.length === 0 ? (
                        <EmptyState title="Không tìm thấy tài khoản quảng cáo" description="Vui lòng kiểm tra lại danh sách tài khoản quảng cáo" icon={<Users className="w-8 h-8" />} />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {accounts?.map((acc: any) => (
                                <FloatingCard key={acc.id}>
                                    <div className="p-5 flex flex-col h-full bg-linear-to-br hover:from-blue-500/5 hover:to-cyan-500/5 transition-colors">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                                                <PlatformIcon platformCode={acc.platform?.code || 'facebook'} size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-semibold text-sm line-clamp-2" title={acc.name || acc.externalId}>{acc.name || acc.externalId}</h3>
                                                    {existingReports[`account:${acc.externalId}`] && (
                                                        <Badge variant="outline" className="shrink-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 px-2 py-0.5 rounded-full font-medium">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Đã có báo cáo
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 lowercase">
                                                    ID: {acc.externalId}
                                                </p>
                                                {existingReports[`account:${acc.externalId}`] && (
                                                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-emerald-600/70">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{format(new Date(existingReports[`account:${acc.externalId}`].createdAt), 'HH:mm dd/MM/yyyy', { locale: vi })}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-4 flex gap-2 w-full border-t border-border/50">
                                            <Button
                                                variant={existingReports[`account:${acc.externalId}`] ? "outline" : "default"}
                                                asChild
                                                className={`w-full font-medium rounded-full shadow-md transition-all duration-300 ${existingReports[`account:${acc.externalId}`]
                                                    ? "border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-600"
                                                    : "bg-primary-01 hover:bg-primary-01/90 text-white shadow-primary-01/20 hover:shadow-primary-01/40"
                                                    }`}
                                            >
                                                <Link to={`${ROUTES.AD_ACCOUNT_REPORTING.replace(':id', acc.externalId)}?dateStart=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&dateEnd=${new Date().toISOString().split('T')[0]}`}>
                                                    <Brain className="w-4 h-4 mr-2" />
                                                    {existingReports[`account:${acc.externalId}`] ? "Xem Báo Cáo Tài Khoản" : "Báo cáo Tài Khoản"}
                                                    <ArrowRight className="w-3 h-3 ml-2 opacity-50" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </FloatingCard>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="branches" className="space-y-4">
                    {branches?.length === 0 ? (
                        <EmptyState title="Không tìm thấy chi nhánh" description="Hãy thêm chi nhánh trong phần quản lý tài khoản" icon={<Building2 className="w-8 h-8" />} />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {branches?.map((branch: any) => (
                                <FloatingCard key={branch.id}>
                                    <div className="p-5 flex flex-col h-full bg-linear-to-br hover:from-orange-500/5 hover:to-amber-500/5 transition-colors">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                                                <Building2 className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-semibold text-sm truncate" title={branch.name}>{branch.name}</h3>
                                                    {existingReports[`branch:${branch.id}`] && (
                                                        <Badge variant="outline" className="shrink-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 px-2 py-0.5 rounded-full font-medium">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Đã có báo cáo
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 lowercase">
                                                    Code: {branch.code || 'N/A'}
                                                </p>
                                                {existingReports[`branch:${branch.id}`] && (
                                                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-emerald-600/70">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{format(new Date(existingReports[`branch:${branch.id}`].createdAt), 'HH:mm dd/MM/yyyy', { locale: vi })}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-4 flex gap-2 w-full border-t border-border/50">
                                            <Button
                                                variant={existingReports[`branch:${branch.id}`] ? "outline" : "default"}
                                                asChild
                                                className={`w-full font-medium rounded-full shadow-md transition-all duration-300 ${existingReports[`branch:${branch.id}`]
                                                    ? "border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-600"
                                                    : "bg-primary-01 hover:bg-primary-01/90 text-white shadow-primary-01/20 hover:shadow-primary-01/40"
                                                    }`}
                                            >
                                                <Link to={`${ROUTES.ACCOUNT_REPORTING.replace(':id', branch.id.toString())}?dateStart=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&dateEnd=${new Date().toISOString().split('T')[0]}`}>
                                                    <Brain className="w-4 h-4 mr-2" />
                                                    {existingReports[`branch:${branch.id}`] ? "Xem Báo Cáo Chi Nhánh" : "Báo cáo Chi Nhánh"}
                                                    <ArrowRight className="w-3 h-3 ml-2 opacity-50" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </FloatingCard>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
