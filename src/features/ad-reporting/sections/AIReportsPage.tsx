import { useState } from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Brain, Megaphone, Users, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/constants';
import { PageHeader, LoadingPage, EmptyState, PlatformIcon } from '@/components/custom';
import { FloatingCard } from '@/components/custom/FloatingCard';

export function AIReportsPage() {
    const [activeTab, setActiveTab] = useState('campaigns');

    // Mặc định lấy 7 ngày qua của campaigns
    const dateStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dateEnd = new Date().toISOString().split('T')[0];

    const { data: accounts, isLoading: loadingAccounts } = useAccounts();
    const { data: campaigns, isLoading: loadingCampaigns } = useCampaigns({
        effectiveStatus: 'ACTIVE',
        dateStart,
        dateEnd
    });

    if (loadingAccounts && loadingCampaigns) return <LoadingPage />;

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Trung tâm Báo Cáo AI"
                description="Tự động sinh báo cáo chuyên sâu và phân tích số liệu với trí tuệ nhân tạo Gemini."
            />

            <Tabs defaultValue="campaigns" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-muted/30 border border-border/50 mb-6">
                    <TabsTrigger value="campaigns" className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4" /> Báo cáo Chiến Dịch
                    </TabsTrigger>
                    <TabsTrigger value="accounts" className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> Báo cáo Tài Khoản
                    </TabsTrigger>
                </TabsList>

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
                                                <h3 className="font-semibold text-sm line-clamp-2" title={camp.name}>{camp.name}</h3>
                                                <p className="text-xs text-muted-foreground mt-1 truncate">{camp.account?.name}</p>
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-4 flex gap-2 w-full border-t border-border/50">
                                            <Button variant="default" asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-900/20 hover:shadow-indigo-900/40">
                                                <Link to={ROUTES.AD_REPORTING.replace(':id', camp.id)}>
                                                    <Brain className="w-4 h-4 mr-2" />
                                                    Tạo Báo Cáo AI
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
                        <EmptyState title="Không tìm thấy tài khoản hệ thống" description="Vui lòng kết nối tài khoản ở mục Accounts" icon={<Users className="w-8 h-8" />} />
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
                                                <h3 className="font-semibold text-sm line-clamp-2" title={acc.name || acc.externalId}>{acc.name || acc.externalId}</h3>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Kết nối: {new Date(acc.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-4 flex gap-2 w-full border-t border-border/50">
                                            {acc.platform?.code === 'facebook' ? (
                                                <Button variant="default" asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-900/20 hover:shadow-blue-900/40">
                                                    <Link to={ROUTES.ACCOUNT_REPORTING.replace(':id', acc.id.toString())}>
                                                        <Brain className="w-4 h-4 mr-2" />
                                                        Báo cáo Tài Khoản
                                                        <ArrowRight className="w-3 h-3 ml-2 opacity-50" />
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <Button variant="secondary" disabled className="w-full">
                                                    Chưa hỗ trợ nền tảng này
                                                </Button>
                                            )}
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
