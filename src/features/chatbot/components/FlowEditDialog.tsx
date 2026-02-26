import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Type, MousePointerClick, LayoutGrid, Bot, Search, X } from 'lucide-react';
import type { MessageType } from '@/types/chatbot.types';
import { ContentEditor } from './ContentEditor';
import { useChatbot } from '../context/ChatbotContext';

export const MESSAGE_TYPE_LABELS: Record<MessageType, { label: string; icon: any; color: string }> = {
    text: { label: 'Text', icon: Type, color: 'text-green-400' },
    quick_reply: { label: 'Quick Reply', icon: MousePointerClick, color: 'text-blue-400' },
    buttons: { label: 'Buttons', icon: LayoutGrid, color: 'text-purple-400' },
    carousel: { label: 'Carousel', icon: LayoutGrid, color: 'text-orange-400' },
};

export function FlowEditDialog() {
    const {
        showDialog: open,
        setShowDialog: setOpen,
        editingFlow: flow,
        setEditingFlow: setFlow,
        handleSaveFlow: onSave,
        saveFlow,
        ads,
        adsLoading
    } = useChatbot();

    const [adSearchQuery, setAdSearchQuery] = useState('');

    const normalizeString = (str?: string) => {
        if (!str) return '';
        return String(str)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/đ/g, 'd');
    };

    const filteredAds = useMemo(() => {
        if (!ads) return [];
        if (!adSearchQuery.trim()) return ads;
        const query = normalizeString(adSearchQuery.trim());
        return ads.filter(ad =>
            normalizeString(ad.name).includes(query) ||
            normalizeString(ad.campaign_name).includes(query) ||
            normalizeString(String(ad.id)).includes(query)
        );
    }, [ads, adSearchQuery]);

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
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                                placeholder="VD: Chào mừng"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Flow Key *</Label>
                            <input
                                type="text"
                                value={flow.flow_key || ''}
                                onChange={e => updateField('flow_key', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
                                placeholder="VD: welcome"
                            />
                        </div>
                    </div>

                    {/* Ad Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                            <Label>Liên kết với Facebook Ads</Label>
                            <div className="relative w-48">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Tìm Ads..."
                                    value={adSearchQuery}
                                    onChange={e => setAdSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-[11px] rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                                />
                                {adSearchQuery && (
                                    <button
                                        onClick={() => setAdSearchQuery('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded"
                                    >
                                        <X className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="border border-border rounded-xl p-3 bg-background/50 space-y-2 max-h-60 overflow-y-auto shadow-inner">
                            {adsLoading ? (
                                <p className="text-xs text-muted-foreground animate-pulse italic py-4 text-center">Đang tải danh sách Ads...</p>
                            ) : !filteredAds || filteredAds.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-xs text-muted-foreground">
                                        {adSearchQuery ? 'Không tìm thấy Ads phù hợp.' : 'Không tìm thấy Ads nào.'}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-1">Vui lòng kiểm tra kết nối tài khoản Facebook.</p>
                                </div>
                            ) : (
                                (() => {
                                    // Group ads by campaign
                                    const grouped = filteredAds.reduce((acc: any, ad) => {
                                        const campaign = ad.campaign_name || 'Khác';
                                        if (!acc[campaign]) acc[campaign] = [];
                                        acc[campaign].push(ad);
                                        return acc;
                                    }, {});

                                    return Object.entries(grouped).map(([campaign, ads]) => (
                                        <div key={campaign} className="space-y-1 pb-3">
                                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase px-2 mb-1.5 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                                {campaign}
                                            </p>
                                            <div className="grid grid-cols-1 gap-1">
                                                {(ads as any[]).map(ad => (
                                                    <label key={ad.external_id} className="flex items-center gap-4 p-3 hover:bg-muted/80 rounded-2xl cursor-pointer transition-all border border-border/10 hover:border-border/50 group bg-muted/20">
                                                        <div className="relative flex items-center justify-center p-0.5">
                                                            <input
                                                                type="checkbox"
                                                                checked={flow.linked_ad_ids?.includes(ad.id)}
                                                                onChange={e => {
                                                                    const current = flow.linked_ad_ids || [];
                                                                    const updated = e.target.checked
                                                                        ? [...current, ad.id]
                                                                        : current.filter(id => id !== ad.id);
                                                                    updateField('linked_ad_ids', updated);
                                                                }}
                                                                className="rounded h-5 w-5 border-muted-foreground/30 accent-primary shrink-0 transition-all cursor-pointer"
                                                            />
                                                        </div>
                                                        {ad.creative_thumbnail ? (
                                                            <div className="relative shrink-0 w-14 h-14 bg-muted rounded-xl overflow-hidden border border-border/40 shadow-sm">
                                                                <img
                                                                    src={ad.creative_thumbnail}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                    alt=""
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.classList.add('hidden');
                                                                        const next = target.nextElementSibling;
                                                                        if (next) next.classList.remove('hidden');
                                                                    }}
                                                                />
                                                                <div className="hidden absolute inset-0 flex items-center justify-center bg-muted">
                                                                    <Bot className="w-6 h-6 text-muted-foreground/20" />
                                                                </div>
                                                                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center border border-border/40 shadow-inner">
                                                                <Bot className="w-6 h-6 text-muted-foreground/20" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[13px] font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">{ad.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[9px] font-mono bg-muted/50 px-1.5 py-0.5 rounded border border-border/30 text-muted-foreground/80">
                                                                    ID: {ad.external_id}
                                                                </span>
                                                                <span className="text-[9px] text-muted-foreground/50 font-medium uppercase tracking-tight">
                                                                    Ready
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ));
                                })()
                            )}
                        </div>
                        <p className="text-[10px] text-muted-foreground px-1 leading-relaxed italic">
                            💡 Tip: Kịch bản này sẽ tự động được gửi khi khách hàng click vào các Ads đã chọn.
                        </p>
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
                                {Object.entries(MESSAGE_TYPE_LABELS).map(([key, info]) => (
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
                    />

                    {/* Triggers */}
                    <div className="space-y-2">
                        <Label>Trigger Payloads (cách nhau dấu phẩy)</Label>
                        <input
                            type="text"
                            value={(flow.trigger_payloads || []).join(', ')}
                            onChange={e => updateField('trigger_payloads', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
                            placeholder="VD: COMBO_CAP_TOC, MY_PAYLOAD"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Trigger Keywords (cách nhau dấu phẩy)</Label>
                        <input
                            type="text"
                            value={(flow.trigger_keywords || []).join(', ')}
                            onChange={e => updateField('trigger_keywords', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
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
