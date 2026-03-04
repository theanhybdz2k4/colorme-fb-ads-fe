import { marked } from 'marked';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import './ReportContent.css';

interface ReportContentProps {
    report?: string;
    createdAt?: string;
    status: string;
    completedSections: string[];
    onGenerate: () => void;
}

function renderMarkdown(text: string) {
    if (!text) return '';
    try {
        return marked.parse(text) as string;
    } catch {
        return text;
    }
}

export function ReportContent({ report, createdAt, status, completedSections, onGenerate }: ReportContentProps) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/30 pb-4">
                <CardTitle className="text-lg font-semibold">
                    Báo Cáo Phân Tích
                </CardTitle>
                <CardDescription>
                    {createdAt
                        ? `Tạo lúc: ${new Date(createdAt).toLocaleString('vi-VN')}`
                        : 'Được tự động tổng hợp từ dữ liệu quảng cáo.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                {report ? (
                    <div className="report-content max-w-full overflow-x-auto">
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(report) }} />
                    </div>
                ) : status ? (
                    <div className="text-center py-12 space-y-3">
                        <RefreshCw className="w-8 h-8 text-primary mx-auto animate-spin" />
                        <p className="text-sm text-muted-foreground">{status}</p>
                        {completedSections.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                Hoàn thành {completedSections.length}/6 phần
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12 space-y-3">
                        <p className="text-muted-foreground">Chưa có báo cáo AI cho đối tượng này.</p>
                        <Button onClick={onGenerate} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Tạo báo cáo mới
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
