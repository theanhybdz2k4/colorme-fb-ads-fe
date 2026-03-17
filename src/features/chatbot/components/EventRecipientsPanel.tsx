import { useState } from 'react';
import { Users, Clock, Search, ExternalLink } from 'lucide-react';
import { useRedemptions } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Filter } from 'lucide-react';

interface Props {
    eventId: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    success: { label: 'Thành công', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
    already_used: { label: 'Đã dùng', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    expired: { label: 'Hết hạn', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
    no_reward_available: { label: 'Hết ưu đãi', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-900/30' },
};

export function EventRecipientsPanel({ eventId }: Props) {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const { data: redemptionsData, isLoading } = useRedemptions(eventId, page);

    const redemptions = redemptionsData?.result || [];
    const totalRedemptions = redemptionsData?.total || 0;
    const totalPages = Math.ceil(totalRedemptions / 50);

    // Frontend filtering (limited to current page results)
    const filtered = redemptions.filter(r => {
        const matchesSearch = !searchQuery.trim() ||
            r.customer_psid.includes(searchQuery) ||
            r.leads?.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.promo_codes?.code.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (isLoading && page === 1) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 max-w-2xl">
                    <div className="relative flex-1 w-full sm:max-w-[280px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm theo tên, mã..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 rounded-xl h-10 text-sm shadow-sm bg-white dark:bg-zinc-900 border-border"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-full sm:w-auto">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-2xl bg-white dark:bg-zinc-900 text-xs font-bold px-3">
                                <Filter className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border bg-white dark:bg-zinc-900 shadow-xl">
                                <SelectItem value="all" className="text-xs font-bold">Tất cả trạng thái</SelectItem>
                                <SelectItem value="success" className="text-xs font-bold text-green-500">Thành công</SelectItem>
                                <SelectItem value="already_used" className="text-xs font-bold text-yellow-500">Đã dùng</SelectItem>
                                <SelectItem value="expired" className="text-xs font-bold text-red-500">Hết hạn</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-xs font-black tracking-widest text-muted-foreground bg-white dark:bg-zinc-900 px-4 h-10 rounded-2xl">
                        <Users className="h-3 w-3 text-primary animate-pulse" />
                        <span className="uppercase">{totalRedemptions} NGƯỜI NHẬN</span>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="text-left px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Khách hàng</th>
                                <th className="text-left px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Mã ưu đãi</th>
                                <th className="text-left px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Ưu đãi nhận</th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap text-center">Trạng thái</th>
                                <th className="text-left px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Thời gian</th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map(r => {
                                const st = STATUS_LABELS[r.status] || STATUS_LABELS.success;
                                return (
                                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border border-border shadow-xs">
                                                    <AvatarImage src={r.leads?.customer_avatar || undefined} />
                                                    <AvatarFallback>
                                                        {(r.leads?.customer_name || 'U').substring(0, 1)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-foreground truncate max-w-[150px]">
                                                        {r.leads?.customer_name || r.customer_name || 'Khách hàng'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-mono truncate">PSID: {r.customer_psid}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <code className="text-[10px] font-bold bg-primary/5 text-primary px-2 py-1 rounded-md border border-primary/10">
                                                {r.promo_codes?.code || '—'}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-medium text-foreground">{r.promo_rewards?.name || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge variant="outline" className={`${st.bg} ${st.color} border-none text-[10px] font-bold uppercase tracking-tight`}>
                                                {st.label}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-foreground font-medium">{new Date(r.redeemed_at).toLocaleDateString('vi-VN')}</span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-2 w-2" />
                                                    {new Date(r.redeemed_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary" asChild title="Xem đoạn chat">
                                                <a href={`/lead-insights?leadId=${r.lead_id || ''}&tab=chat`} target="_blank" rel="noreferrer">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="bg-muted inline-flex p-4 rounded-full mb-4">
                            <Users className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Không tìm thấy kết quả</h3>
                        <p className="text-xs text-muted-foreground mt-1 px-4 max-w-xs mx-auto">
                            Chúng tôi không tìm thấy người nhận nào khớp với các điều kiện lọc của bạn.
                        </p>
                        <Button
                            variant="link"
                            size="sm"
                            className="mt-2 text-primary text-xs"
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                            }}
                        >
                            Xóa bộ lọc
                        </Button>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className="rounded-xl px-4"
                    >
                        Trang trước
                    </Button>
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
                        {page} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="rounded-xl px-4"
                    >
                        Trang sau
                    </Button>
                </div>
            )}
        </div>
    );
}
