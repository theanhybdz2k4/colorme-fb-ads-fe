import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, UsersRound, Target, MousePointerClick } from 'lucide-react';
import type { ReportMetrics } from '../context/ReportContext';

interface KPICardsProps {
    metrics?: ReportMetrics | null;
    localMetrics?: ReportMetrics | null;
    totalResults?: number;
    statsTotal?: number;
    statsPotential?: number;
}

export function KPICards({ metrics, localMetrics, totalResults, statsTotal, statsPotential }: KPICardsProps) {
    const spend = metrics?.spend || localMetrics?.spend || 0;
    const cpl = metrics?.cpl || localMetrics?.cpl || 0;
    const ctr = metrics?.ctr || localMetrics?.ctr || 0;
    const leads = (statsTotal && statsTotal > 0) ? statsTotal : (totalResults ?? 0);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="gap-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{spend.toLocaleString('vi-VN')} ₫</div>
                </CardContent>
            </Card>
            <Card className="gap-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {statsPotential !== undefined ? "Leads (Chất lượng/Tổng)" : "Tổng Leads (từ QC)"}
                    </CardTitle>
                    <UsersRound className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statsPotential !== undefined ? `${statsPotential}/${leads}` : leads}
                    </div>
                </CardContent>
            </Card>
            <Card className="gap-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">CPL (Cost/Lead)</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Math.round(cpl).toLocaleString('vi-VN')} ₫</div>
                </CardContent>
            </Card>
            <Card className="gap-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
                    <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{ctr.toFixed(2)}%</div>
                </CardContent>
            </Card>
        </div>
    );
}
