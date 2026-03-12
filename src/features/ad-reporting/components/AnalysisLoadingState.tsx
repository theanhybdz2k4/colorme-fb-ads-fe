import { SparklesIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants';

// ── Section definitions matching Edge Function v3 ──────────────
const CAMPAIGN_SECTIONS = [
    { id: 'verdict', title: 'Kết luận điều hành' },
    { id: 'ads_audit', title: 'Kiểm toán mẫu quảng cáo' },
    { id: 'funnel', title: 'Chẩn đoán phễu chuyển đổi' },
    { id: 'action_plan', title: 'Kế hoạch hành động 72h' },
    { id: 'creative_reform', title: 'Đề xuất cải tiến sáng tạo' },
    { id: 'risk_summary', title: 'Rủi ro & Tổng kết CEO' },
];

const ACCOUNT_SECTIONS = [
    { id: 'portfolio', title: 'Chiến lược danh mục' },
    { id: 'quality', title: 'Kiểm toán chất lượng Lead' },
    { id: 'scaling', title: 'Chiến lược scale ngân sách' },
    { id: 'risk_summary', title: 'Rủi ro & Tổng kết CEO' },
];

const BRANCH_SECTIONS = [
    { id: 'branch_health', title: 'Sức khỏe tổng thể cơ sở' },
    { id: 'account_efficiency', title: 'Hiệu quả tài khoản/chiến dịch' },
    { id: 'quality', title: 'Chất lượng Lead cơ sở' },
    { id: 'risk_summary', title: 'Rủi ro & Tổng kết CEO' },
];

function getSections(reportType?: string) {
    if (reportType === 'branch') return BRANCH_SECTIONS;
    if (reportType === 'account') return ACCOUNT_SECTIONS;
    return CAMPAIGN_SECTIONS;
}

interface AnalysisLoadingStateProps {
    status: string;
    completedSections: string[];
    reportType?: string; // 'campaign' | 'account' | 'branch'
}

export function AnalysisLoadingState({ status, completedSections, reportType }: AnalysisLoadingStateProps) {
    const sections = getSections(reportType);

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
            <Button variant="ghost" asChild className="px-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
                <Link to={ROUTES.AI_REPORTS}><ArrowLeft className="w-4 h-4 mr-2" /> Trở về danh sách báo cáo</Link>
            </Button>

            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                    <SparklesIcon className="w-16 h-16 text-blue-600 relative z-10 animate-bounce" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{status || 'AI đang phân tích dữ liệu...'}</h2>
                <p className="text-slate-500 mb-10 max-w-md text-center">
                    Hệ thống đang đọc tỉ lệ chuyển đổi và phân tích nội dung chuyên sâu. Vui lòng đợi trong giây lát.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                    {sections.map((section) => {
                        const isDone = completedSections.includes(section.id);
                        return (
                            <div
                                key={section.id}
                                className={`flex items-center p-4 rounded-xl border transition-all duration-300 ${isDone
                                    ? 'bg-green-50/50 border-green-100 text-green-700'
                                    : 'bg-white border-slate-100 text-slate-400 opacity-60'
                                    }`}
                            >
                                {isDone ? (
                                    <CheckCircle2 className="w-5 h-5 mr-3 text-green-500 shrink-0" />
                                ) : (
                                    <div className="w-5 h-5 mr-3 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin shrink-0" />
                                )}
                                <span className="font-medium">{section.title}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
