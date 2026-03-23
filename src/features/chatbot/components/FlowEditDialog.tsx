import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Type, MousePointerClick, LayoutGrid, Image as ImageIcon } from 'lucide-react';
import type { MessageType } from '@/types/chatbot.types';
import { ContentEditor, FlowMultiSelect } from './ContentEditor';
import { useChatbot } from '../context/ChatbotContext';

export const MESSAGE_TYPE_LABELS: Record<MessageType, { label: string; icon: any; color: string }> = {
    text: { label: 'Văn bản (Text)', icon: Type, color: 'text-green-400' },
    image: { label: 'Hình ảnh (Image)', icon: ImageIcon, color: 'text-pink-400' },
    quick_reply: { label: 'Phản hồi nhanh (Quick Reply)', icon: MousePointerClick, color: 'text-blue-400' },
    buttons: { label: 'Nút bấm (Buttons)', icon: LayoutGrid, color: 'text-purple-400' },
    carousel: { label: 'Thẻ quay vòng (Carousel)', icon: LayoutGrid, color: 'text-orange-400' },
};

export function FlowEditDialog() {
    const {
        showDialog: open,
        setShowDialog: setOpen,
        editingFlow: flow,
        setEditingFlow: setFlow,
        handleSaveFlow: onSave,
        saveFlow,
        flows,
    } = useChatbot();

    if (!flow) return null;

    const saving = saveFlow.isPending;
    const onClose = () => { setOpen(false); setFlow(null); };

    const updateField = (key: string, value: any) => setFlow({ ...flow, [key]: value });
    const updateContent = (key: string, value: any) => setFlow({ ...flow, content: { ...flow.content, [key]: value } });

    const messageType = flow.message_type || 'text';

    return (
        <Dialog open={open} onOpenChange={o => !o && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{flow.id ? 'Sửa bước' : 'Thêm bước mới'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tên hiển thị *</Label>
                            <input
                                type="text"
                                value={flow.display_name || ''}
                                onChange={e => updateField('display_name', e.target.value)}
                                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                                placeholder="VD: Chào mừng"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Flow Key *</Label>
                            <input
                                type="text"
                                value={flow.flow_key || ''}
                                onChange={e => updateField('flow_key', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-mono"
                                placeholder="VD: welcome"
                            />
                        </div>
                    </div>

                    {/* Message Type */}
                    <div className="space-y-2">
                        <Label>Loại tin nhắn</Label>
                        <Select value={messageType} onValueChange={(v: MessageType) => {
                            const newFlow = { ...flow, message_type: v };

                            // Reset content based on type
                            if (v === 'text') {
                                newFlow.content = { text: flow.content?.text || '' };
                            } else if (v === 'quick_reply') {
                                newFlow.content = { text: flow.content?.text || '', quick_replies: flow.content?.quick_replies || [] };
                            } else if (v === 'buttons') {
                                newFlow.content = { text: flow.content?.text || '', buttons: flow.content?.buttons || [] };
                            } else if (v === 'carousel') {
                                newFlow.content = { text_before: flow.content?.text_before || '', elements: flow.content?.elements || [] };
                            }

                            setFlow(newFlow);
                        }}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(MESSAGE_TYPE_LABELS)
                                    .filter(([key]) => key !== 'image')
                                    .map(([key, info]) => (
                                        <SelectItem key={key} value={key}>{info.label}</SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Content Editor */}
                    <ContentEditor
                        type={messageType}
                        content={flow.content || {}}
                        onChange={(c) => updateField('content', c)}
                        flows={flows}
                    />

                    {/* Triggers */}
                    <div className="space-y-2">
                        <Label>Trigger Payloads (chọn từ các Flow hiện có hoặc nhập thủ công)</Label>
                        <FlowMultiSelect
                            flows={flows || []}
                            selectedKeys={flow.trigger_payloads || []}
                            onChange={(keys) => updateField('trigger_payloads', keys)}
                        />
                        <p className="text-[10px] text-muted-foreground italic">Gợi ý: Dùng Flow Key của các bước khác để liên kết</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Trigger Keywords (cách nhau dấu phẩy)</Label>
                        <input
                            type="text"
                            value={(flow.trigger_keywords || []).join(', ')}
                            onChange={e => updateField('trigger_keywords', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                            placeholder="VD: xin chào, hello"
                        />
                    </div>

                    {/* Options */}
                    <div className="flex flex-wrap items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={flow.is_entry_point || false}
                                onChange={e => updateField('is_entry_point', e.target.checked)}
                                className="rounded"
                            />
                            Entry Point (welcome message)
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={flow.is_daily_welcome || false}
                                onChange={e => updateField('is_daily_welcome', e.target.checked)}
                                className="rounded"
                            />
                            Daily Welcome Message
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={flow.content?.handoff || false}
                                onChange={updateContent ? (e => updateContent('handoff', e.target.checked)) : (e => updateField('content', { ...flow.content, handoff: e.target.checked }))}
                                className="rounded"
                            />
                            Handoff (chuyển nhân viên)
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={flow.is_active ?? true}
                                onChange={e => updateField('is_active', e.target.checked)}
                                className="rounded"
                            />
                            Active
                        </label>
                    </div>

                    <div className="space-y-2">
                        <Label>Thứ tự sắp xếp</Label>
                        <input
                            type="number"
                            value={flow.sort_order ?? 0}
                            onChange={e => updateField('sort_order', parseInt(e.target.value) || 0)}
                            className="w-24 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Hủy</Button>
                    <Button onClick={onSave} disabled={saving}>
                        {saving ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
