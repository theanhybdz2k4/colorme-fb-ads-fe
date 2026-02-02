
import { useLeads } from '../context/LeadContext';
import { PageHeader } from '@/components/custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Loader2, Key } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cronSettingsApi } from '@/api/settings.api';
import { toast } from 'sonner';
import type { CrawlerCookieStatus } from '@/types/settings.types';
import { format } from 'date-fns';

export function LeadHeader() {
    const {
        syncLeads,
        isSyncing,
        selectedPageId,
        setSelectedPageId,
        availablePages,
        pagesLoading
    } = useLeads();

    return (
        <div className="p-4 md:p-6 pb-2 flex flex-col sm:flex-row items-start justify-between bg-background/50 backdrop-blur-md z-20 gap-4 sm:gap-0">
            <div className="flex flex-col gap-3 md:gap-4 w-full sm:w-auto">
                <PageHeader
                    title="Lead Insights"
                    description="Quản lý khách hàng tiềm năng và phân bổ nhân sự xử lý tin nhắn."
                    className="hidden sm:block"
                />
                <h1 className="text-xl font-bold sm:hidden">Lead Insights</h1>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center w-full">
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground whitespace-nowrap">Chọn Fanpage:</span>
                    <Select value={selectedPageId} onValueChange={setSelectedPageId} disabled={pagesLoading}>
                        <SelectTrigger className="h-9 w-full sm:w-[240px] md:w-[300px] bg-background border-primary/20 hover:border-primary/40 transition-colors rounded-xl shadow-sm">
                            {pagesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Tất cả Fanpage" />}
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Tất cả Fanpage</SelectItem>
                            {availablePages.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
                <CookieManager />
                <Button
                    onClick={syncLeads}
                    disabled={isSyncing}
                    className="rounded-xl font-bold gap-2 animate-shimmer flex-1 sm:flex-none"
                >
                    {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span className="whitespace-nowrap">Sync Avatar</span>
                </Button>
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
