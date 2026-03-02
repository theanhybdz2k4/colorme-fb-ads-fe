import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Download, AlertCircle, TrendingUp, UsersRound, Target, MousePointerClick, SparklesIcon, RefreshCw, CalendarDays } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ROUTES } from '@/constants';
import { marked } from 'marked';
import { apiClient } from '@/lib/apiClient';

export function AccountReportingPage() {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        fetchReport();
    }, [id]);

    const fetchReport = async (force = false) => {
        try {
            setLoading(true);
            setError('');

            // 1. Fetch account info from the backend API
            const { data: accountData } = await apiClient.get(`/ad-accounts/${id}`);
            const account = accountData.result || accountData.data || accountData;
            const accountName = account?.name || `Tài khoản ${id}`;

            // 2. Fetch insights for this account (last 30 days)
            const dateEnd = new Date().toISOString().split('T')[0];
            const dateStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const { data: insightsData } = await apiClient.get('/insights', {
                params: { accountId: id, dateStart, dateEnd }
            });
            const insights = insightsData.result || insightsData.data || insightsData || [];
            const insightsArr = Array.isArray(insights) ? insights : [];

            // Aggregate metrics
            const spend = insightsArr.reduce((s: number, i: any) => s + (Number(i.spend) || 0), 0);
            const impressions = insightsArr.reduce((s: number, i: any) => s + (Number(i.impressions) || 0), 0);
            const clicks = insightsArr.reduce((s: number, i: any) => s + (Number(i.clicks) || 0), 0);
            const totalResults = insightsArr.reduce((s: number, i: any) => s + (Number(i.results || i.messagingStarted) || 0), 0);

            // Group by campaign for detailed analysis
            const campaignMap: Record<string, any> = {};
            insightsArr.forEach((i: any) => {
                const cId = i.campaignId || 'unknown';
                if (!campaignMap[cId]) {
                    campaignMap[cId] = {
                        name: i.campaign?.name || 'Chiến dịch không tên',
                        spend: 0,
                        leads: 0,
                        clicks: 0,
                        impressions: 0
                    };
                }
                campaignMap[cId].spend += (Number(i.spend) || 0);
                campaignMap[cId].leads += (Number(i.results || i.messagingStarted) || 0);
                campaignMap[cId].clicks += (Number(i.clicks) || 0);
                campaignMap[cId].impressions += (Number(i.impressions) || 0);
            });

            // 2. Prepare entity breakdown (Campaigns) and fetch lead quality
            const { data: leadStats } = await supabase
                .from('leads')
                .select('source_campaign_id, is_potential, is_manual_potential')
                .eq('platform_account_id', id);

            const campaignLeadStats: Record<string, { total: number, potential: number }> = {};
            leadStats?.forEach(l => {
                const cId = l.source_campaign_id || 'unknown';
                if (!campaignLeadStats[cId]) campaignLeadStats[cId] = { total: 0, potential: 0 };
                campaignLeadStats[cId].total++;
                if (l.is_potential || l.is_manual_potential) campaignLeadStats[cId].potential++;
            });

            const totalLeadsCount = leadStats?.length || 0;
            const potentialLeadsCount = leadStats?.filter(l => l.is_potential || l.is_manual_potential).length || 0;

            const entityBreakdown = Object.entries(campaignMap).map(([cId, c]: [string, any]) => {
                const stats = campaignLeadStats[cId] || { total: 0, potential: 0 };
                return {
                    id: cId,
                    name: c.name,
                    spend: c.spend,
                    leads: c.leads,
                    potentialLeads: stats.potential,
                    qualityRate: stats.total > 0 ? (stats.potential / stats.total) * 100 : 0,
                    cpl: c.leads > 0 ? c.spend / c.leads : c.spend,
                    ctr: c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0
                };
            }).sort((a, b) => b.spend - a.spend).slice(0, 15);

            // 3. Call Edge Function with enriched metrics
            const qs = force ? '?force=true' : '';
            const { data: result, error: invokeError } = await supabase.functions.invoke(`ads-analytics-report/report/generate${qs}`, {
                method: 'POST',
                body: {
                    type: 'account',
                    referenceId: id,
                    campaignName: `Toàn bộ: ${accountName}`,
                    metrics: {
                        spend, impressions, clicks, totalResults,
                        entityBreakdown,
                        leadQuality: {
                            totalCount: totalLeadsCount,
                            potentialCount: potentialLeadsCount
                        },
                        type: 'account',
                        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
                        cpc: clicks > 0 ? spend / clicks : 0,
                        cpl: totalResults > 0 ? spend / totalResults : 0,
                    }
                }
            });

            if (invokeError || !result?.success) {
                throw new Error(invokeError?.message || result?.error || 'Lỗi khi lấy báo cáo AI');
            }

            setData(result.data);
            toast.success(force ? 'Đã tạo mới báo cáo!' : 'Đã tải xong báo cáo!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadWord = async () => {
        if (!data || !data.report) {
            toast.error("Chưa có dữ liệu báo cáo để tải!");
            return;
        }

        try {
            toast.loading("Đang xuất báo cáo ra file Word...", { id: 'export-docx' });

            const paragraphs = [];

            paragraphs.push(new Paragraph({
                text: `Báo Cáo Phân Tích: ${data.campaignName}`,
                heading: HeadingLevel.TITLE,
                spacing: { after: 400 }
            }));

            const lines = data.report.split('\n');

            for (const line of lines) {
                const text = line.trim();
                if (!text) continue;

                if (text.startsWith('### ')) {
                    paragraphs.push(new Paragraph({ text: text.replace('### ', ''), heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } }));
                } else if (text.startsWith('## ')) {
                    paragraphs.push(new Paragraph({ text: text.replace('## ', ''), heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
                } else if (text.startsWith('# ')) {
                    paragraphs.push(new Paragraph({ text: text.replace('# ', ''), heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
                } else if (text.startsWith('- ') || text.startsWith('* ')) {
                    let content = text.replace(/^[-*] /, '');
                    paragraphs.push(new Paragraph({ text: content, bullet: { level: 0 }, spacing: { after: 60 } }));
                } else {
                    paragraphs.push(new Paragraph({ text: text, spacing: { after: 120 } }));
                }
            }

            const doc = new Document({
                sections: [{ properties: {}, children: paragraphs }]
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `AI_Report_Account_${id}.docx`);

            toast.success("Đã tải xong file Word!", { id: 'export-docx' });
        } catch (err: any) {
            toast.error("Lỗi tạo file Word: " + err.message, { id: 'export-docx' });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[60vh] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <h3 className="text-xl font-medium">
                    AI đang tổng hợp báo cáo...
                </h3>
                <p className="text-muted-foreground text-sm max-w-md text-center">
                    Hệ thống đang đọc tỉ lệ chuyển đổi và phân tích content. Vui lòng đợi trong giây lát.
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-4xl mx-auto space-y-6">
                <Button variant="outline" asChild className="mb-4">
                    <Link to={ROUTES.AI_REPORTS}><ArrowLeft className="w-4 h-4 mr-2" /> Trở về danh sách báo cáo</Link>
                </Button>

                <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400 text-lg">
                            <AlertCircle className="w-5 h-5" />
                            Lỗi lấy báo cáo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
                        <Button onClick={() => fetchReport()} variant="outline">Thử lại</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { campaignName, metrics, report, createdAt } = data || {};

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
            {/* Nav */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="px-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
                    <Link to={ROUTES.AI_REPORTS}><ArrowLeft className="w-4 h-4 mr-2" /> Trở về danh sách báo cáo</Link>
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadWord}>
                        <Download className="w-4 h-4 mr-2" />
                        Tải Báo Cáo
                    </Button>
                    <Button onClick={() => fetchReport(true)} variant="default">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Tạo mới báo cáo
                    </Button>
                </div>
            </div>

            {/* Header / Stats */}
            <div className="space-y-6">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-3">
                        <SparklesIcon className="w-3 h-3" />
                        AI Analytics Report
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {campaignName}
                    </h1>
                    {createdAt && (
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" />
                            Được tạo lúc: {new Date(createdAt).toLocaleString('vi-VN')}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(metrics?.spend || 0).toLocaleString('vi-VN')} ₫</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Quality Leads</CardTitle>
                            <UsersRound className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(metrics?.totalResults || 0).toLocaleString('vi-VN')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">CPL (Cost/Lead)</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Math.round(metrics?.cpl || 0).toLocaleString('vi-VN')} ₫</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
                            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(metrics?.ctr || 0).toFixed(2)}%</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* AI Report Content */}
            <Card className="shadow-sm">
                <CardHeader className="border-b bg-muted/30 pb-4">
                    <CardTitle className="text-lg font-semibold">
                        Báo Cáo Phân Tích
                    </CardTitle>
                    <CardDescription>
                        Được tự động tổng hợp từ dữ liệu quảng cáo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 overflow-hidden">
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-full overflow-x-auto wrap-break-word">
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(report) }} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function renderMarkdown(text: string) {
    if (!text) return '';
    try {
        return marked.parse(text);
    } catch {
        return text;
    }
}
