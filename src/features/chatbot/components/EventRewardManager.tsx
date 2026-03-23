import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, Save, X, Award } from 'lucide-react';
import { useRewards, useSaveReward, useDeleteReward } from '@/hooks/useEvents';
import { useChatbotFlows } from '@/hooks/useChatbot';
import { ContentEditor } from './ContentEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PromoReward } from '@/types/events.types';
import type { MessageType } from '@/types/chatbot.types';

interface Props {
    eventId: string;
}

export function EventRewardManager({ eventId }: Props) {
    const { data: rewards, isLoading } = useRewards(eventId);
    const { data: flows } = useChatbotFlows();
    const saveReward = useSaveReward();
    const deleteReward = useDeleteReward();

    const [editingReward, setEditingReward] = useState<Partial<PromoReward> | null>(null);
    const [isNew, setIsNew] = useState(false);

    const handleNew = () => {
        setEditingReward({
            name: '',
            reply_template: { message_type: 'text', content: { text: '🎉 Chúc mừng! Bạn nhận được ưu đãi!' } },
            weight: 1,
            max_claims: null,
            is_active: true,
        });
        setIsNew(true);
    };

    const handleEdit = (reward: PromoReward) => {
        setEditingReward({ ...reward });
        setIsNew(false);
    };

    const handleSave = async () => {
        if (!editingReward?.name?.trim()) return;
        await saveReward.mutateAsync({ eventId, reward: editingReward });
        setEditingReward(null);
    };

    const handleDelete = async (rewardId: string) => {
        if (confirm('Xóa ưu đãi này?')) {
            await deleteReward.mutateAsync({ eventId, rewardId });
        }
    };

    const update = (key: string, value: any) => {
        if (editingReward) setEditingReward({ ...editingReward, [key]: value });
    };

    const updateReplyTemplate = (key: string, value: any) => {
        if (editingReward) {
            setEditingReward({
                ...editingReward,
                reply_template: {
                    ...editingReward.reply_template!,
                    [key]: value
                }
            });
        }
    };

    // Calculate total weight for probability display
    const totalWeight = (rewards || []).filter(r => r.is_active).reduce((sum, r) => sum + r.weight, 0);

    return (
        <div className="space-y-6">
            {/* Reward Form */}
            {editingReward && (
                <div className="p-5 rounded-2xl border border-primary/30 bg-card space-y-4">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                        {isNew ? <Plus className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                        {isNew ? 'Thêm ưu đãi mới' : 'Sửa ưu đãi'}
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Tên ưu đãi *</Label>
                            <input
                                type="text"
                                value={editingReward.name || ''}
                                onChange={e => update('name', e.target.value)}
                                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                                placeholder="VD: Giảm 20%, Free Ship"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Trọng số random</Label>
                                <input
                                    type="number"
                                    value={editingReward.weight || 1}
                                    onChange={e => update('weight', Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                                    min={1}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Giới hạn</Label>
                                <input
                                    type="number"
                                    value={editingReward.max_claims ?? ''}
                                    onChange={e => update('max_claims', e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                                    placeholder="∞"
                                    min={1}
                                />
                            </div>
                        </div>
                    </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Loại tin nhắn</Label>
                            <Select 
                                value={editingReward.reply_template?.message_type || 'text'} 
                                onValueChange={(v: MessageType) => {
                                    const currentContent = editingReward.reply_template?.content || {};
                                    let newContent = { ...currentContent };
                                    
                                    // Basic content reset similar to FlowEditDialog
                                    if (v === 'text') {
                                        newContent = { text: currentContent.text || '' };
                                    } else if (v === 'quick_reply') {
                                        newContent = { text: currentContent.text || '', quick_replies: currentContent.quick_replies || [] };
                                    } else if (v === 'buttons') {
                                        newContent = { text: currentContent.text || '', buttons: currentContent.buttons || [] };
                                    } else if (v === 'carousel') {
                                        newContent = { text_before: currentContent.text_before || '', elements: currentContent.elements || [] };
                                    }

                                    update('reply_template', {
                                        message_type: v,
                                        content: newContent
                                    });
                                }}
                            >
                                <SelectTrigger className="h-9 rounded-xl border-border bg-background"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">Văn bản (Text)</SelectItem>
                                    <SelectItem value="quick_reply">Phản hồi nhanh (Quick Reply)</SelectItem>
                                    <SelectItem value="buttons">Nút bấm (Buttons)</SelectItem>
                                    <SelectItem value="carousel">Thẻ quay vòng (Carousel)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-primary">Nội dung tin nhắn ưu đãi</Label>
                        <ContentEditor
                            type={(editingReward.reply_template?.message_type as any) || 'text'}
                            content={editingReward.reply_template?.content || {}}
                            flows={flows}
                            onChange={(content) => updateReplyTemplate('content', content)}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editingReward.is_active ?? true}
                                onChange={e => update('is_active', e.target.checked)}
                                className="rounded"
                            />
                            Bật ưu đãi
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={saveReward.isPending} className="gap-2 rounded-xl" size="sm">
                            <Save className="h-3.5 w-3.5" /> {saveReward.isPending ? 'Đang lưu...' : 'Lưu'}
                        </Button>
                        <Button variant="ghost" onClick={() => setEditingReward(null)} size="sm" className="rounded-xl">
                            <X className="h-3.5 w-3.5 mr-1" /> Hủy
                        </Button>
                    </div>
                </div>
            )}

            {/* Rewards List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h4 className="text-sm font-bold">{rewards?.length || 0} ưu đãi trong pool</h4>
                    {!editingReward && (
                        <Button variant="outline" size="sm" onClick={handleNew} className="gap-2 rounded-xl">
                            <Plus className="h-3.5 w-3.5" /> Thêm ưu đãi
                        </Button>
                    )}
                </div>

                {isLoading && (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full" />
                    </div>
                )}

                {!isLoading && rewards && rewards.length > 0 && (
                    <div className="grid gap-3">
                        {rewards.map(reward => {
                            const prob = totalWeight > 0 ? Math.round((reward.weight / totalWeight) * 100) : 0;
                            return (
                                <div key={reward.id} className="group p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-all">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className={`p-2 rounded-lg ${reward.is_active ? 'bg-linear-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20' : 'bg-muted border border-border'}`}>
                                                <Award className={`h-4 w-4 ${reward.is_active ? 'text-amber-400' : 'text-muted-foreground'}`} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm truncate">{reward.name}</span>
                                                    {!reward.is_active && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-muted text-muted-foreground">TẮT</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                    <span>Trọng số: {reward.weight} ({prob}%)</span>
                                                    <span>Đã phát: {reward.claimed_count}{reward.max_claims !== null ? `/${reward.max_claims}` : ''}</span>
                                                </div>
                                                {reward.reply_template?.content?.text && (
                                                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 italic">
                                                        "{reward.reply_template.content.text}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(reward)}>
                                                <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(reward.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!isLoading && (!rewards || rewards.length === 0) && !editingReward && (
                    <div className="text-center py-12 bg-muted/50 rounded-xl border border-dashed border-border space-y-3">
                        <Award className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                        <div>
                            <p className="text-sm font-medium text-foreground">Chưa có ưu đãi nào</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Thêm ưu đãi vào pool để user nhận khi nhập mã code</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleNew} className="rounded-xl border-dashed">
                            Thêm ưu đãi đầu tiên
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
