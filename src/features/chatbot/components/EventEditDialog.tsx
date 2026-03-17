import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSaveEvent } from '@/hooks/useEvents';
import { usePages } from '@/hooks/usePages';
import type { PromoEvent } from '@/types/events.types';
import { Check, Info } from 'lucide-react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: Partial<PromoEvent> | null;
    setEvent: (event: Partial<PromoEvent> | null) => void;
}

export function EventEditDialog({ open, onOpenChange, event, setEvent }: Props) {
    const saveEvent = useSaveEvent();
    const { data: pages } = usePages();

    if (!event) return null;

    const saving = saveEvent.isPending;

    const update = (key: string, value: any) => setEvent({ ...event, [key]: value });

    const handleSave = async () => {
        if (!event.name?.trim()) return;
        await saveEvent.mutateAsync(event);
        onOpenChange(false);
        setEvent(null);
    };

    const onClose = () => { onOpenChange(false); setEvent(null); };

    return (
        <Dialog open={open} onOpenChange={o => !o && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{event.id ? 'Sửa Event' : 'Tạo Event mới'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Name & Description */}
                    <div className="space-y-2">
                        <Label>Tên Event *</Label>
                        <input
                            type="text"
                            value={event.name || ''}
                            onChange={e => update('name', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            placeholder="VD: Khuyến mãi Tết 2026"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Mô tả</Label>
                        <textarea
                            value={event.description || ''}
                            onChange={e => update('description', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm min-h-[80px] resize-y"
                            placeholder="Mô tả ngắn về event..."
                        />
                    </div>

                    {/* Page Selection */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <Label>Áp dụng cho trang (Fanpage)</Label>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Info className="h-3 w-3" /> Để trống nếu áp dụng cho tất cả
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-dashed border-border bg-muted/20">
                            {pages?.map(page => {
                                const isSelected = event.page_ids?.includes(page.id);
                                return (
                                    <button
                                        key={page.id}
                                        onClick={() => {
                                            const current = event.page_ids || [];
                                            const next = isSelected 
                                                ? current.filter(id => id !== page.id)
                                                : [...current, page.id];
                                            update('page_ids', next);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                                            ${isSelected 
                                                ? 'bg-primary/10 border-primary/40 text-primary shadow-sm' 
                                                : 'bg-background border-border text-muted-foreground hover:border-primary/20'}`}
                                    >
                                        {isSelected && <Check className="h-3 w-3" />}
                                        {page.name}
                                    </button>
                                );
                            })}
                            {!pages?.length && (
                                <p className="text-[10px] text-muted-foreground italic">Đang tải danh sách trang...</p>
                            )}
                        </div>
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Bắt đầu</Label>
                            <input
                                type="datetime-local"
                                value={event.starts_at ? new Date(event.starts_at).toISOString().slice(0, 16) : ''}
                                onChange={e => update('starts_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Kết thúc</Label>
                            <input
                                type="datetime-local"
                                value={event.ends_at ? new Date(event.ends_at).toISOString().slice(0, 16) : ''}
                                onChange={e => update('ends_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            />
                        </div>
                    </div>

                    {/* Reply Templates */}
                    <div className="space-y-3 pt-2 border-t border-border">
                        <h4 className="text-sm font-bold">Tin nhắn tự động</h4>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Khi mã đã hết lượt sử dụng</Label>
                            <textarea
                                value={event.code_used_reply?.content?.text || ''}
                                onChange={e => update('code_used_reply', {
                                    message_type: 'text',
                                    content: { text: e.target.value }
                                })}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm min-h-[60px] resize-y"
                                placeholder="VD: Mã này đã được sử dụng rồi!"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Khi mã/event hết hạn</Label>
                            <textarea
                                value={event.code_expired_reply?.content?.text || ''}
                                onChange={e => update('code_expired_reply', {
                                    message_type: 'text',
                                    content: { text: e.target.value }
                                })}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm min-h-[60px] resize-y"
                                placeholder="VD: Mã này đã hết hạn!"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Khi hết ưu đãi trong pool</Label>
                            <textarea
                                value={event.no_reward_reply?.content?.text || ''}
                                onChange={e => update('no_reward_reply', {
                                    message_type: 'text',
                                    content: { text: e.target.value }
                                })}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm min-h-[60px] resize-y"
                                placeholder="VD: Rất tiếc, ưu đãi đã hết!"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label>Trạng thái</Label>
                        <select
                            value={event.status || 'draft'}
                            onChange={e => update('status', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        >
                            <option value="draft">Nháp</option>
                            <option value="active">Đang chạy</option>
                            <option value="paused">Tạm dừng</option>
                            <option value="ended">Đã kết thúc</option>
                        </select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Hủy</Button>
                    <Button onClick={handleSave} disabled={saving || !event.name?.trim()}>
                        {saving ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
