
import { useLeads } from '../context/LeadContext';
import { PageHeader } from '@/components/custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Loader2, Key, BarChart2, MessageSquare, Clock } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cronSettingsApi } from '@/api/settings.api';
import { toast } from 'sonner';
import type { CrawlerCookieStatus } from '@/types/settings.types';
import { format } from 'date-fns';
import { DateRangeFilter } from '@/components/custom';

interface LeadHeaderProps {
    onTabChange: (value: string) => void;
}

export function LeadHeader({ onTabChange }: LeadHeaderProps) {
    const {
        syncLeads,
        isSyncing,
        selectedPageId,
        setSelectedPageId,
        availablePages,
        pagesLoading,
        dateRange,
        setDateRange
    } = useLeads();

    return (
        <div className="px-4 md:px-6 py-3 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-background/50 backdrop-blur-md z-20 gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 flex-1">
                    <div className="flex items-center gap-4">
                        <PageHeader
                            title="Lead Insights"
                            description=""
                            className="shrink-0"
                        />

                        <TabsList className="bg-muted/30 border border-border/50 p-1 rounded-xl h-10">
                            <TabsTrigger value="stats" onClick={() => onTabChange("stats")} className="rounded-lg data-[state=active]:bg-primary/90 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all px-4 gap-2 text-xs md:text-sm h-8">
                                <BarChart2 className="h-4 w-4" />
                                Số liệu
                            </TabsTrigger>
                            <TabsTrigger value="chat" onClick={() => onTabChange("chat")} className="rounded-lg data-[state=active]:bg-primary/90 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all px-4 gap-2 text-xs md:text-sm h-8">
                                <MessageSquare className="h-4 w-4" />
                                Tin nhắn
                            </TabsTrigger>
                            <TabsTrigger value="realtime" onClick={() => onTabChange("realtime")} className="rounded-lg data-[state=active]:bg-primary/90 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all px-4 gap-2 text-xs md:text-sm h-8 font-bold">
                                <Clock className="h-4 w-4" />
                                Realtime
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2 min-w-[200px]">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden xl:block">Fanpage</span>
                            <Select value={selectedPageId} onValueChange={setSelectedPageId} disabled={pagesLoading}>
                                <SelectTrigger className="h-10 w-full bg-background border-primary/20 hover:border-primary/40 transition-colors rounded-xl shadow-sm">
                                    {pagesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Tất cả Fanpage" />}
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">Tất cả Fanpage</SelectItem>
                                    {availablePages.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 items-center justify-end">
                    <CookieManager />
                    <Button
                        onClick={syncLeads}
                        disabled={isSyncing}
                        className="rounded-xl h-10 font-bold gap-2 animate-shimmer min-w-[140px]"
                    >
                        {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        <span className="whitespace-nowrap">Đồng bộ Leads</span>
                    </Button>
                </div>
            </div>

            <div className="flex flex-warp">
                <DateRangeFilter
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    className="w-full"
                    showLabel={false}
                />
            </div>
        </div>
    );
}

function CookieManager() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<CrawlerCookieStatus | null>(null);
    const [newCookie, setNewCookie] = useState('');

    const fetchStatus = async () => {
        try {
            const data = await cronSettingsApi.getCookieStatus();
            setStatus(data);
        } catch (e) {
            console.error('Failed to fetch cookie status', e);
        }
    };

    useEffect(() => {
        if (open) fetchStatus();
    }, [open]);

    const handleUpdate = async () => {
        if (!newCookie.trim()) {
            toast.error('Vui lòng nhập cookie');
            return;
        }

        setLoading(true);
        try {
            const res = await cronSettingsApi.updateCookie(newCookie);
            if (res.success) {
                toast.success('Cập nhật Cookie thành công!');
                setNewCookie('');
                fetchStatus();
                setOpen(false);
            } else {
                toast.error(res.error || 'Cập nhật thất bại');
            }
        } catch (e: any) {
            toast.error(e.response?.data?.error || 'Lỗi hệ thống');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl border-primary/20 hover:bg-primary/5">
                    <Key className={`h-4 w-4 ${status?.hasCookie ? 'text-green-500' : 'text-muted-foreground'}`} />
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-primary" />
                        Quản lý Facebook Cookie
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {status && (
                        <div className="text-xs bg-muted/50 p-3 rounded-lg border space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Trạng thái:</span>
                                <span className={status.hasCookie ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                                    {status.hasCookie ? 'Đang hoạt động' : 'Chưa có Cookie'}
                                </span>
                            </div>
                            {status.updatedAt && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Cập nhật lúc:</span>
                                    <span>{format(new Date(status.updatedAt), 'HH:mm dd/MM/yyyy')}</span>
                                </div>
                            )}
                            {status.maskedValue && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Giá trị:</span>
                                    <code className="bg-background px-1 rounded">{status.maskedValue}</code>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="cookie">Dán Cookie mới vào đây:</Label>
                        <Input
                            id="cookie"
                            placeholder="datr=...; sb=...; c_user=...; xs=..."
                            value={newCookie}
                            onChange={(e) => setNewCookie(e.target.value)}
                            className="rounded-xl"
                        />
                        <p className="text-[10px] text-muted-foreground leading-tight italic">
                            * Lưu ý: Cookie phải chứa c_user và xs để hệ thống có thể hoạt động.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Hủy</Button>
                    <Button onClick={handleUpdate} disabled={loading} className="rounded-xl px-6 font-bold">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu Cookie
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
