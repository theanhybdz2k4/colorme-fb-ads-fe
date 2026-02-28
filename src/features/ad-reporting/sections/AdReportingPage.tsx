import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Download, Brain, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ROUTES } from '@/constants';

export function AdReportingPage() {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        fetchReport();
    }, [id]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError('');

            const { data: result, error: invokeError } = await supabase.functions.invoke(`ads-analytics-report/report/campaign/${id}`, {
                method: 'GET',
            });

            if (invokeError || !result?.success) {
                throw new Error(invokeError?.message || result?.error || 'Lỗi khi lấy báo cáo AI');
            }

            setData(result.data);
            toast.success("Đã tải xong báo cáo phân tích!");
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

            // Tiêu đề chính
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
            saveAs(blob, `AI_Report_${data.campaignName.replace(/\s+/g, '_')}.docx`);

            toast.success("Đã tải xong file Word!", { id: 'export-docx' });
        } catch (err: any) {
            toast.error("Lỗi tạo file Word: " + err.message, { id: 'export-docx' });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[60vh] gap-4">
                <Spinner variant="gradient" size="lg" />
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-indigo-400">
                    AI đang tổng hợp và phân tích chiến dịch...
                </h3>
                <p className="text-muted-foreground text-sm max-w-md text-center">
                    Gemini đang đọc các số liệu, tính toán tỉ lệ chuyển đổi từ inbox và phân tích nội dung hình ảnh quảng cáo để đưa ra insight chiến lược nhất. Vui lòng chờ trong giây lát (có thể mất tới 30s).
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-4xl mx-auto space-y-6">
                <Button variant="outline" asChild className="mb-4">
                    <Link to={ROUTES.CAMPAIGNS}><ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách chiến dịch</Link>
                </Button>

                <Card className="border-red-500/50 bg-red-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-500">
                            <AlertCircle className="w-5 h-5" />
                            Lỗi tạo báo cáo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-red-400">{error}</p>
                        <Button onClick={fetchReport} className="mt-4" variant="default">Thử lại</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { campaignName, metrics, report } = data || {};

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Nav */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="hover:bg-transparent px-0 text-muted-foreground hover:text-foreground">
                    <Link to={ROUTES.CAMPAIGNS}><ArrowLeft className="w-4 h-4 mr-2" /> Trở về danh sách</Link>
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleDownloadWord} className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                        <Download className="w-4 h-4 mr-2" />
                        Tải Báo Cáo (Word)
                    </Button>
                    <Button onClick={fetchReport} variant="secondary">Làm mới AI</Button>
                </div>
            </div>

            {/* Header Dashboard (Premium Glassmorphism Style) */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-indigo-900/40 via-purple-900/30 to-background backdrop-blur-xl p-8 shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <Brain className="w-64 h-64 text-purple-300" />
                </div>
                <div className="relative z-10 space-y-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium mb-3 border border-blue-500/30">
                            <SparklesIcon className="w-3 h-3" />
                            Generated by Gemini AI
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-blue-100 to-indigo-300">
                            {campaignName}
                        </h1>
                        <p className="text-muted-foreground mt-2 flex items-center gap-2">
                            Full Performance & Attribution Report
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        <MetricCard
                            title="Total Spend"
                            value={`${(metrics?.spend || 0).toLocaleString()} ₫`}
                            icon={TrendingUp}
                            color="text-emerald-400"
                            bg="bg-emerald-500/10"
                            border="border-emerald-500/20"
                        />
                        <MetricCard
                            title="Quality Leads (Inbox)"
                            value={metrics?.totalResults?.toLocaleString() || '0'}
                            icon={UsersRound}
                            color="text-blue-400"
                            bg="bg-blue-500/10"
                            border="border-blue-500/20"
                        />
                        <MetricCard
                            title="CPL (Cost/Lead)"
                            value={`${(metrics?.cpl || 0).toLocaleString()} ₫`}
                            icon={Target}
                            color="text-orange-400"
                            bg="bg-orange-500/10"
                            border="border-orange-500/20"
                        />
                        <MetricCard
                            title="Average CTR"
                            value={`${(metrics?.ctr || 0).toFixed(2)}%`}
                            icon={MousePointerClick}
                            color="text-purple-400"
                            bg="bg-purple-500/10"
                            border="border-purple-500/20"
                        />
                    </div>
                </div>
            </div>

            {/* AI Report Content (Markdown formatting) */}
            <Card className="border border-white/5 bg-card/50 shadow-xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-blue-500 via-indigo-500 to-purple-500" />
                <CardHeader className="pl-8 pb-2">
                    <CardTitle className="text-xl flex items-center gap-2 font-bold mb-1">
                        Báo Cáo Chuyên Môn
                    </CardTitle>
                    <CardDescription>
                        Được phân tích dưới góc nhìn của Senior Performance Marketer.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-8 pt-4">
                    <div className="prose prose-invert prose-blue max-w-none prose-h2:text-2xl prose-h2:tracking-tight prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300">
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(report) }} />
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}

// ------ Helper Components ------
import { Sparkles as SparklesIcon, Users as UsersRound, MousePointerClick, Target } from 'lucide-react';
import { marked } from 'marked';

function MetricCard({ title, value, icon: Icon, color, bg, border }: any) {
    return (
        <div className={`p-4 rounded-xl border ${border} ${bg} backdrop-blur-md flex flex-col gap-2 transition-transform hover:scale-105 duration-300`}>
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md bg-background/50 ${color}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-300">{title}</span>
            </div>
            <div className={`text-2xl font-black ${color} tracking-tight`}>
                {value}
            </div>
        </div>
    );
}

const Spinner = ({ variant = 'default', size = 'default' }) => {
    return <Loader2 className={`animate-spin ${size === 'lg' ? 'w-10 h-10' : 'w-5 h-5'} ${variant === 'gradient' ? 'text-blue-500' : 'text-slate-500'}`} />
}

function renderMarkdown(text: string) {
    if (!text) return '';
    try {
        return marked.parse(text);
    } catch {
        return text;
    }
}
