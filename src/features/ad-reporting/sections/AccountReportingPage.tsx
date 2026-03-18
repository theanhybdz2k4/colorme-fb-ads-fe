import { useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, AlertCircle, SparklesIcon, RefreshCw, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/constants';
import { ReportProvider, useReport } from '../context/ReportContext';
import { KPICards } from '../components/KPICards';
import { ReportContent } from '../components/ReportContent';
import { AnalysisLoadingState } from '../components/AnalysisLoadingState';

export function AccountReportingPage() {
    return (
        <ReportProvider>
            <AccountReportingPageInner />
        </ReportProvider>
    );
}

function AccountReportingPageInner() {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const dateStart = searchParams.get('dateStart') || undefined;
    const dateEnd = searchParams.get('dateEnd') || undefined;

    const {
        loading, data, error, status, completedSections,
        localMetrics, stats,
        loadCachedReport, generateReport
    } = useReport();

    const { pathname } = window.location;
    const isBranchReport = pathname.includes('/reporting/branch/');
    const reportType: 'branch' | 'account' = isBranchReport ? 'branch' : 'account';

    useEffect(() => {
        if (!id) return;
        loadCachedReport(id, reportType, dateStart, dateEnd);
    }, [id, loadCachedReport, reportType, dateStart, dateEnd]);

    const handleGenerateNew = () => {
        if (id) generateReport(id, reportType, dateStart, dateEnd);
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
                text: `Báo Cáo Phân Tích Tài Khoản: ${data.campaignName}`,
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
                    paragraphs.push(new Paragraph({ text: text.replace(/^[-*] /, ''), bullet: { level: 0 }, spacing: { after: 60 } }));
                } else {
                    paragraphs.push(new Paragraph({ text, spacing: { after: 120 } }));
                }
            }
            const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
            const blob = await Packer.toBlob(doc);
            saveAs(blob, `AI_Report_Account_${id}.docx`);
            toast.success("Đã tải xong file Word!", { id: 'export-docx' });
        } catch (err: any) {
            toast.error("Lỗi tạo file Word: " + err.message, { id: 'export-docx' });
        }
    };

    // Loading state (generating report)
    if (loading && (!data || !data.campaignName)) {
        return <AnalysisLoadingState status={status} completedSections={completedSections} reportType={reportType} />;
    }

    // Error state
    if (error) {
        return (
            <div className="p-8 mx-auto space-y-6">
                <Button variant="outline" asChild className="mb-4">
                    <Link to={`${ROUTES.AI_REPORTS}?tab=${isBranchReport ? 'branches' : 'accounts'}`}><ArrowLeft className="w-4 h-4 mr-2" /> Trở về danh sách báo cáo</Link>
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
                        <Button onClick={handleGenerateNew} variant="outline">Thử lại</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { campaignName, metrics, report, createdAt } = data || {};

    return (
        <div className="space-y-6">
            {/* Nav */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="px-0 hover:bg-transparent text-t-tertiary hover:text-t-primary">
                    <Link to={`${ROUTES.AI_REPORTS}?tab=${isBranchReport ? 'branches' : 'accounts'}`} className="flex items-center"><ArrowLeft className="w-4 h-4 mr-2" /> Trở về danh sách báo cáo</Link>
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadWord} className="rounded-xl border-s-subtle">
                        <Download className="w-4 h-4 mr-2" />
                        Tải Báo Cáo
                    </Button>
                    <Button onClick={handleGenerateNew} className="rounded-xl shadow-depth-toggle">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Tạo mới báo cáo
                    </Button>
                </div>
            </div>

            {/* Header + KPI */}
            <div className="space-y-6">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-3">
                        <SparklesIcon className="w-3 h-3" />
                        AI Macro Strategy Report
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{campaignName}</h1>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-[10px] font-semibold border border-blue-100 dark:border-blue-800">
                            <CalendarDays className="w-3 h-3" />
                            Dữ liệu {(localMetrics?.dateStart && localMetrics?.dateEnd) ? `từ ${new Date(localMetrics.dateStart).toLocaleDateString('vi-VN')} đến ${new Date(localMetrics.dateEnd).toLocaleDateString('vi-VN')}` : (dateStart && dateEnd ? `từ ${new Date(dateStart).toLocaleDateString('vi-VN')} đến ${new Date(dateEnd).toLocaleDateString('vi-VN')}` : '30 ngày qua')}
                        </div>
                    </div>
                    {createdAt && (
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                            <SparklesIcon className="w-3.5 h-3.5 text-emerald-500" />
                            Báo cáo gần nhất: {new Date(createdAt).toLocaleString('vi-VN')}
                        </p>
                    )}
                </div>

                <KPICards
                    metrics={metrics}
                    localMetrics={localMetrics}
                    totalResults={data?.metrics?.totalResults}
                    statsTotal={stats.total}
                    statsPotential={stats.potential}
                />
            </div>

            {/* Report Content */}
            <ReportContent
                report={report}
                createdAt={createdAt}
                status={status}
                completedSections={completedSections}
                onGenerate={handleGenerateNew}
            />
        </div>
    );
}
