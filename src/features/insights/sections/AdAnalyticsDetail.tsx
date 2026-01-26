import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { useAdAnalytics } from '@/hooks/useAdAnalytics';
import { LoadingState, EmptyState, FloatingCard } from '@/components/custom';
import {
    Smartphone,
    Monitor,
    Layout,
    Users,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Target,
    MousePointer2,
    Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdAnalyticsDetailProps {
    adId: string | null;
    adName?: string;
    dateStart: string;
    dateEnd: string;
    onClose: () => void;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function AdAnalyticsDetail({ adId, adName, dateStart, dateEnd, onClose }: AdAnalyticsDetailProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const { data, isLoading } = useAdAnalytics({
        adId: adId || '',
        dateStart,
        dateEnd,
        enabled: !!adId
    });

    if (!adId) return null;

    const summary = data?.summary;
    const growth = summary?.growth;

    const MetricCard = ({
        label,
        value,
        icon: Icon,
        growth: growthVal,
        prefix = '',
        suffix = ''
    }: {
        label: string;
        value: string | number;
        icon: any;
        growth?: number | null;
        prefix?: string;
        suffix?: string;
    }) => (
        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon size={16} />
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold tracking-tight">
                    {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                </h3>
                {growthVal !== undefined && growthVal !== null && (
                    <div className={cn(
                        "flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md",
                        growthVal >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                        {growthVal >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                        {Math.abs(growthVal).toFixed(1)}%
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Dialog open={!!adId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
                <DialogHeader className="p-6 border-b border-border/50 shrink-0">
                    <div className="flex justify-between items-center">
                        <div>
                            <DialogTitle className="text-2xl font-bold">{adName || 'Chi tiết quảng cáo'}</DialogTitle>
                            <DialogDescription className="text-sm font-mono text-muted-foreground mt-1">ID: {adId}</DialogDescription>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Khoảng thời gian</div>
                            <div className="text-sm font-medium">{dateStart} → {dateEnd}</div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {isLoading ? (
                        <LoadingState text="Đang phân tích dữ liệu chuyên sâu..." />
                    ) : !data ? (
                        <EmptyState title="Không tìm thấy dữ liệu" description="Thử chọn khoảng thời gian khác hoặc kiểm tra lại tiến trình sync." />
                    ) : (
                        <>
                            {/* Summary Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <MetricCard
                                    label="Tổng chi tiêu"
                                    value={summary.totalSpend}
                                    icon={DollarSign}
                                    growth={growth?.spend}
                                    suffix=" đ"
                                />
                                <MetricCard
                                    label="Kết quả"
                                    value={summary.totalResults}
                                    icon={Target}
                                    growth={growth?.results}
                                />
                                <MetricCard
                                    label="Lượt Click"
                                    value={summary.totalClicks}
                                    icon={MousePointer2}
                                    growth={growth?.clicks}
                                />
                                <MetricCard
                                    label="Hiển thị"
                                    value={summary.totalImpressions}
                                    icon={Eye}
                                    growth={growth?.impressions}
                                />
                            </div>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                                <TabsList className="bg-muted/30 border border-border/50 p-1 rounded-xl">
                                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all px-6">Tổng quan</TabsTrigger>
                                    <TabsTrigger value="devices" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all px-6">Thiết bị</TabsTrigger>
                                    <TabsTrigger value="placements" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all px-6">Vị trí</TabsTrigger>
                                    <TabsTrigger value="demographics" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all px-6">Nhân khẩu học</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                    <FloatingCard>
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center">
                                                <TrendingUp size={16} className="mr-2 text-primary" />
                                                Biểu đồ hiệu suất theo ngày
                                            </h4>
                                        </div>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={data.dailyInsights}>
                                                    <defs>
                                                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                                    <XAxis
                                                        dataKey="date"
                                                        tickFormatter={(val) => new Date(val).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                        tick={{ fontSize: 10, fill: '#888888' }}
                                                        axisLine={false}
                                                    />
                                                    <YAxis tick={{ fontSize: 10, fill: '#888888' }} axisLine={false} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                                                        formatter={(value: any) => [value.toLocaleString(), '']}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="spend"
                                                        name="Chi tiêu"
                                                        stroke="#8884d8"
                                                        fillOpacity={1}
                                                        fill="url(#colorSpend)"
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="results"
                                                        name="Kết quả"
                                                        stroke="#82ca9d"
                                                        fillOpacity={0}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </FloatingCard>
                                </TabsContent>

                                <TabsContent value="devices" className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <FloatingCard>
                                            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center">
                                                <Smartphone size={16} className="mr-2 text-primary" />
                                                Phân bổ chi tiêu theo thiết bị
                                            </h4>
                                            <div className="h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={data.deviceBreakdown}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={100}
                                                            paddingAngle={5}
                                                            dataKey="spend"
                                                            nameKey="device"
                                                            label={({ device, percent }: any) => `${device} (${((percent || 0) * 100).toFixed(0)}%)`}
                                                        >
                                                            {data.deviceBreakdown.map((_entry: any, index: number) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value: any) => value.toLocaleString() + ' đ'} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </FloatingCard>
                                        <FloatingCard>
                                            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center">
                                                <Monitor size={16} className="mr-2 text-primary" />
                                                Hiệu quả theo thiết bị
                                            </h4>
                                            <div className="h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={data.deviceBreakdown} layout="vertical">
                                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#88888820" />
                                                        <XAxis type="number" hide />
                                                        <YAxis dataKey="device" type="category" tick={{ fontSize: 12, fill: '#888888' }} axisLine={false} />
                                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                                        <Bar dataKey="impressions" name="Hiển thị" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </FloatingCard>
                                    </div>
                                </TabsContent>

                                <TabsContent value="placements" className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                    <FloatingCard>
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center">
                                            <Layout size={16} className="mr-2 text-primary" />
                                            Phân bổ theo vị trí hiển thị
                                        </h4>
                                        <div className="h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={data.placementBreakdown}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                                    <XAxis
                                                        dataKey="position"
                                                        tick={{ fontSize: 10, fill: '#888888' }}
                                                        interval={0}
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={100}
                                                    />
                                                    <YAxis tick={{ fontSize: 10, fill: '#888888' }} axisLine={false} />
                                                    <Tooltip />
                                                    <Bar dataKey="spend" name="Chi tiêu" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </FloatingCard>
                                </TabsContent>

                                <TabsContent value="demographics" className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                    <FloatingCard>
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center">
                                            <Users size={16} className="mr-2 text-primary" />
                                            Chi tiêu theo độ tuổi và giới tính
                                        </h4>
                                        <div className="h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={data.ageGenderBreakdown}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                                    <XAxis dataKey="age" tick={{ fontSize: 12, fill: '#888888' }} />
                                                    <YAxis tick={{ fontSize: 12, fill: '#888888' }} axisLine={false} />
                                                    <Tooltip />
                                                    <Bar dataKey="spend" name="Chi tiêu" fill="#ffc658" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </FloatingCard>
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
