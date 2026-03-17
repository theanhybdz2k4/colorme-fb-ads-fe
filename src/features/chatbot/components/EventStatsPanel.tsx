import { useState } from 'react';
import { Hash, Trophy, AlertTriangle, Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import { useEventStats, useRedemptions } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


interface Props {
    eventId: string;
}

export function EventStatsPanel({ eventId }: Props) {
    const { data: stats, isLoading: statsLoading } = useEventStats(eventId);
    const [page, setPage] = useState(1);
    const { data: redemptionsData, isLoading: redemptionsLoading } = useRedemptions(eventId, page);

    const redemptions = redemptionsData?.result || [];
    const totalRedemptions = redemptionsData?.total || 0;
    const totalPages = Math.ceil(totalRedemptions / 50);

    if (statsLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full" />
            </div>
        );
    }

    if (!stats) return null;

    const STATUS_LABELS: Record<string, { label: string; icon: any; color: string }> = {
        success: { label: 'Thành công', icon: CheckCircle, color: 'text-green-400' },
        already_used: { label: 'Đã dùng', icon: AlertTriangle, color: 'text-yellow-400' },
        expired: { label: 'Hết hạn', icon: Clock, color: 'text-red-400' },
        no_reward_available: { label: 'Hết ưu đãi', icon: XCircle, color: 'text-gray-400' },
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow space-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-1 opacity-5 group-hover:scale-150 transition-transform duration-700">
                        <Hash className="h-12 w-12" />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground relative">
                        <Hash className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-tight">Tổng mã code</span>
                    </div>
                    <p className="text-2xl font-bold relative">{stats.codes.total}</p>
                    <p className="text-[10px] text-muted-foreground relative">
                        {stats.codes.available} còn lại · {stats.codes.used} đã dùng
                    </p>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow space-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-1 opacity-5 group-hover:scale-150 transition-transform duration-700">
                        <Users className="h-12 w-12" />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground relative">
                        <Users className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-tight">Lượt nhập mã</span>
                    </div>
                    <p className="text-2xl font-bold relative">{stats.redemptions.total}</p>
                    <p className="text-[10px] text-muted-foreground relative">
                        Tất cả lượt thử
                    </p>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow space-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:scale-150 transition-transform duration-700 text-green-500">
                        <Trophy className="h-12 w-12" />
                    </div>
                    <div className="flex items-center gap-2 text-green-500 relative">
                        <Trophy className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-tight">Thành công</span>
                    </div>
                    <p className="text-2xl font-bold text-green-500 relative">{stats.redemptions.success}</p>
                    <p className="text-[10px] text-muted-foreground relative">
                        {stats.redemptions.total > 0
                            ? `${Math.round((stats.redemptions.success / stats.redemptions.total) * 100)}% tỷ lệ thành công`
                            : 'Chưa có dữ liệu'}
                    </p>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow space-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:scale-150 transition-transform duration-700 text-yellow-500">
                        <AlertTriangle className="h-12 w-12" />
                    </div>
                    <div className="flex items-center gap-2 text-yellow-500 relative">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-tight">Thất bại</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-500 relative">
                        {stats.redemptions.already_used + stats.redemptions.expired + stats.redemptions.no_reward}
                    </p>
                    <p className="text-[10px] text-muted-foreground relative">
                        {stats.redemptions.already_used} đã dùng · {stats.redemptions.expired} hết hạn
                    </p>
                </div>
            </div>

            {/* Rewards Breakdown */}
            {stats.rewards.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-bold px-1">Phân bổ ưu đãi</h4>
                    <div className="rounded-xl bg-white overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50">
                                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Ưu đãi</th>
                                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Đã phát</th>
                                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Giới hạn</th>
                                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Trọng số</th>
                                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {stats.rewards.map(r => (
                                    <tr key={r.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-2.5 font-medium">{r.name}</td>
                                        <td className="px-4 py-2.5 text-center">{r.claimed_count}</td>
                                        <td className="px-4 py-2.5 text-center">{r.max_claims ?? '∞'}</td>
                                        <td className="px-4 py-2.5 text-center">{r.weight}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                                                ${r.is_active ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                                {r.is_active ? 'BẬT' : 'TẮT'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Redemption History */}
            <div className="space-y-3">
                <h4 className="text-sm font-bold px-1">Lịch sử nhập mã ({totalRedemptions})</h4>

                {redemptionsLoading && (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full" />
                    </div>
                )}

                {!redemptionsLoading && redemptions.length > 0 && (
                    <>
                        <div className="rounded-xl bg-white overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/50">
                                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Thời gian</th>
                                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Khách hàng</th>
                                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">PSID</th>
                                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Mã</th>
                                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Ưu đãi nhận</th>
                                        <th className="text-center px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {redemptions.map(r => {
                                        const st = STATUS_LABELS[r.status] || STATUS_LABELS.success;
                                        const Icon = st.icon;
                                        return (
                                            <tr key={r.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                                                    {new Date(r.redeemed_at).toLocaleString('vi-VN')}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6 border border-border">
                                                            <AvatarImage src={r.leads?.customer_avatar || undefined} />
                                                            <AvatarFallback className="text-[10px]">
                                                                {(r.leads?.customer_name || 'U').substring(0, 1)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-semibold line-clamp-1">{r.leads?.customer_name || r.customer_name || 'Khách hàng'}</span>
                                                            {r.leads?.phone && <span className="text-[10px] text-muted-foreground">{r.leads.phone}</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5 font-mono text-[10px] text-muted-foreground whitespace-nowrap">{r.customer_psid}</td>
                                                <td className="px-4 py-2.5 font-mono font-bold whitespace-nowrap">{r.promo_codes?.code || '—'}</td>
                                                <td className="px-4 py-2.5 text-xs line-clamp-1">{r.promo_rewards?.name || '—'}</td>
                                                <td className="px-4 py-2.5 text-center whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${st.color}`}>
                                                        <Icon className="h-3 w-3" />
                                                        {st.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="rounded-lg"
                                >
                                    Trước
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    Trang {page} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="rounded-lg"
                                >
                                    Sau
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {!redemptionsLoading && redemptions.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                        Chưa có lượt nhập mã nào.
                    </div>
                )}
            </div>
        </div>
    );
}
