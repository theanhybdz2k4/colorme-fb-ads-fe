import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, X, Gift, Calendar, Hash, Trophy, Pause, Play, Trash2, BarChart3, Settings2 } from 'lucide-react';
import { useEvents, useDeleteEvent, useSaveEvent } from '@/hooks/useEvents';
import type { PromoEvent } from '@/types/events.types';
import { EventEditDialog } from '../components/EventEditDialog';
import { EventDetailView } from '../components/EventDetailView';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'Nháp', color: 'text-gray-400', bg: 'bg-gray-500/10' },
    active: { label: 'Đang chạy', color: 'text-green-400', bg: 'bg-green-500/10' },
    paused: { label: 'Tạm dừng', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    ended: { label: 'Đã kết thúc', color: 'text-red-400', bg: 'bg-red-500/10' },
};

export function EventsTab() {
    const { data: events, isLoading } = useEvents();
    const deleteEvent = useDeleteEvent();
    const saveEvent = useSaveEvent();

    const [searchQuery, setSearchQuery] = useState('');
    const [editingEvent, setEditingEvent] = useState<Partial<PromoEvent> | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    const filtered = (events || []).filter(e =>
        !searchQuery.trim() ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleNew = () => {
        setEditingEvent({
            name: '',
            description: '',
            status: 'draft',
            page_ids: [],
            code_used_reply: { message_type: 'text', content: { text: 'Mã này đã được sử dụng rồi! 😊' } },
            code_expired_reply: { message_type: 'text', content: { text: 'Mã này đã hết hạn! ⏰' } },
            no_reward_reply: { message_type: 'text', content: { text: 'Rất tiếc, ưu đãi đã hết! 😢' } },
        });
        setShowDialog(true);
    };

    const handleEdit = (event: PromoEvent) => {
        setEditingEvent({ ...event });
        setShowDialog(true);
    };

    const handleToggleStatus = async (event: PromoEvent) => {
        const newStatus = event.status === 'active' ? 'paused' : 'active';
        await saveEvent.mutateAsync({ id: event.id, name: event.name, status: newStatus });
    };

    const handleDelete = async (id: string) => {
        if (confirm('Xóa event này? Tất cả mã code và lịch sử sẽ bị xóa!')) {
            await deleteEvent.mutateAsync(id);
        }
    };

    // If an event is selected, show detail view
    if (selectedEventId) {
        return (
            <EventDetailView
                eventId={selectedEventId}
                onBack={() => setSelectedEventId(null)}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold tracking-tight">Event Builder</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <span className="w-1 h-1 rounded-full bg-primary/50" />
                        {events?.length || 0} event đang quản lý
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm event..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-9 h-11 rounded-xl bg-b-surface2 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-md transition-colors"
                            >
                                <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                        )}
                    </div>

                    <Button
                        onClick={handleNew}
                        className="gap-2 rounded-xl px-5 font-bold h-11 shadow-sm"
                    >
                        <Plus className="h-4 w-4" /> Tạo Event
                    </Button>
                </div>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center h-64 gap-3 bg-muted rounded-2xl border border-dashed border-border">
                    <div className="animate-spin w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">Đang tải events...</p>
                </div>
            )}

            {!isLoading && filtered.length > 0 && (
                <div className="grid gap-4">
                    {filtered.map(event => {
                        const sc = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;
                        const stats = event._stats;
                        return (
                            <div
                                key={event.id}
                                className="group p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
                                onClick={() => setSelectedEventId(event.id)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 min-w-0 flex-1">
                                        <div className="p-2.5 rounded-xl bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                                            <Gift className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-foreground truncate">{event.name}</h4>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${sc.bg} ${sc.color}`}>
                                                    {sc.label}
                                                </span>
                                            </div>
                                            {event.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{event.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                {event.starts_at && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(event.starts_at).toLocaleDateString('vi-VN')}
                                                        {event.ends_at && ` - ${new Date(event.ends_at).toLocaleDateString('vi-VN')}`}
                                                    </span>
                                                )}
                                                {stats && (
                                                    <>
                                                        <span className="flex items-center gap-1">
                                                            <Hash className="h-3 w-3" />
                                                            {stats.totalCodes} mã ({stats.usedCodes} đã dùng)
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Trophy className="h-3 w-3" />
                                                            {stats.successRedemptions} lượt thành công
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg"
                                            onClick={() => setSelectedEventId(event.id)}
                                            title="Thống kê"
                                        >
                                            <BarChart3 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg"
                                            onClick={() => handleEdit(event)}
                                            title="Cài đặt"
                                        >
                                            <Settings2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg"
                                            onClick={() => handleToggleStatus(event)}
                                            title={event.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                                        >
                                            {event.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(event.id)}
                                            title="Xóa"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!isLoading && events?.length === 0 && !searchQuery && (
                <div className="text-center py-20 bg-muted rounded-2xl border-2 border-dashed border-border space-y-4">
                    <div className="inline-flex p-5 rounded-2xl bg-card border border-border mt-2">
                        <Gift className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-lg font-bold text-foreground">Chưa có event nào</p>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            Tạo event mới để bắt đầu phân phát mã khuyến mãi và voucher qua Messenger.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleNew}
                        className="mt-2 rounded-xl border-dashed hover:border-solid hover:bg-background transition-all"
                    >
                        Tạo Event đầu tiên
                    </Button>
                </div>
            )}

            <EventEditDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                event={editingEvent}
                setEvent={setEditingEvent}
            />
        </div>
    );
}
