import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X, Trash2 } from 'lucide-react';
import type { MessageType, FlowContent, QuickReply, ButtonItem, CarouselElement } from '@/types/chatbot.types';

interface ContentEditorProps {
    type: MessageType;
    content: FlowContent;
    onChange: (c: FlowContent) => void;
}

export function ContentEditor({ type, content, onChange }: ContentEditorProps) {
    const updateText = (text: string) => onChange({ ...content, text });
    const updateTextBefore = (text_before: string) => onChange({ ...content, text_before });

    // Quick Reply helpers
    const addQuickReply = () => onChange({ ...content, quick_replies: [...(content.quick_replies || []), { content_type: 'text', title: '', payload: '' }] });
    const removeQuickReply = (i: number) => onChange({ ...content, quick_replies: content.quick_replies?.filter((_, idx) => idx !== i) });
    const updateQuickReply = (i: number, qr: QuickReply) => onChange({ ...content, quick_replies: content.quick_replies?.map((q, idx) => idx === i ? qr : q) });

    // Button helpers
    const addButton = () => onChange({ ...content, buttons: [...(content.buttons || []), { type: 'postback', title: '', payload: '' }] });
    const removeButton = (i: number) => onChange({ ...content, buttons: content.buttons?.filter((_, idx) => idx !== i) });
    const updateButton = (i: number, btn: ButtonItem) => onChange({ ...content, buttons: content.buttons?.map((b, idx) => idx === i ? btn : b) });

    // Carousel helpers
    const addElement = () => onChange({ ...content, elements: [...(content.elements || []), { title: '', subtitle: '', image_url: '', buttons: [] }] });
    const removeElement = (i: number) => onChange({ ...content, elements: content.elements?.filter((_, idx) => idx !== i) });
    const updateElement = (i: number, el: CarouselElement) => onChange({ ...content, elements: content.elements?.map((e, idx) => idx === i ? el : e) });

    return (
        <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-muted/10">
            {/* Text content */}
            {(type === 'text' || type === 'quick_reply' || type === 'buttons') && (
                <div className="space-y-2">
                    <Label>Nội dung tin nhắn</Label>
                    <textarea
                        value={content.text || ''}
                        onChange={e => updateText(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-y"
                        placeholder="Nhập nội dung tin nhắn..."
                    />
                </div>
            )}

            {/* Carousel text_before */}
            {type === 'carousel' && (
                <div className="space-y-2">
                    <Label>Text giới thiệu (gửi trước carousel)</Label>
                    <textarea
                        value={content.text_before || ''}
                        onChange={e => updateTextBefore(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-y"
                        placeholder="VD: Đây là 3 lộ trình chuyên nghiệp..."
                    />
                </div>
            )}

            {/* Quick Replies */}
            {type === 'quick_reply' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Quick Replies</Label>
                        <Button size="sm" variant="outline" onClick={addQuickReply} className="gap-1">
                            <Plus className="h-3 w-3" /> Thêm
                        </Button>
                    </div>
                    {(content.quick_replies || []).map((qr, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <input
                                value={qr.title}
                                onChange={e => updateQuickReply(i, { ...qr, title: e.target.value })}
                                placeholder="Title..."
                                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
                            />
                            <input
                                value={qr.payload}
                                onChange={e => updateQuickReply(i, { ...qr, payload: e.target.value })}
                                placeholder="Payload..."
                                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-mono"
                            />
                            <button onClick={() => removeQuickReply(i)} className="p-1 hover:text-red-400 group cursor-pointer">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Buttons */}
            {type === 'buttons' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Buttons (tối đa 3)</Label>
                        <Button size="sm" variant="outline" onClick={addButton} disabled={(content.buttons?.length || 0) >= 3} className="gap-1">
                            <Plus className="h-3 w-3" /> Thêm
                        </Button>
                    </div>
                    {(content.buttons || []).map((btn, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <input
                                value={btn.title}
                                onChange={e => updateButton(i, { ...btn, title: e.target.value })}
                                placeholder="Title..."
                                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
                            />
                            <input
                                value={btn.payload || ''}
                                onChange={e => updateButton(i, { ...btn, payload: e.target.value })}
                                placeholder="Payload..."
                                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-mono"
                            />
                            <button onClick={() => removeButton(i)} className="p-1 hover:text-red-400 group cursor-pointer">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Carousel Elements */}
            {type === 'carousel' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Carousel Cards (tối đa 10)</Label>
                        <Button size="sm" variant="outline" onClick={addElement} disabled={(content.elements?.length || 0) >= 10} className="gap-1">
                            <Plus className="h-3 w-3" /> Thêm Card
                        </Button>
                    </div>
                    {(content.elements || []).map((el, i) => (
                        <CarouselElementEditor
                            key={i}
                            index={i}
                            element={el}
                            onChange={e => updateElement(i, e)}
                            onRemove={() => removeElement(i)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function CarouselElementEditor({ index, element, onChange, onRemove }: {
    index: number;
    element: CarouselElement;
    onChange: (el: CarouselElement) => void;
    onRemove: () => void;
}) {
    const addButton = () => onChange({ ...element, buttons: [...(element.buttons || []), { type: 'postback', title: '', payload: '' }] });
    const removeButton = (i: number) => onChange({ ...element, buttons: element.buttons?.filter((_, idx) => idx !== i) });
    const updateButton = (i: number, btn: ButtonItem) => onChange({ ...element, buttons: element.buttons?.map((b, idx) => idx === i ? btn : b) });

    return (
        <div className="p-3 rounded-lg border border-border/50 bg-card space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Card #{index + 1}</span>
                <button onClick={onRemove} className="p-1 hover:text-red-400 text-muted-foreground group cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            <input
                value={element.title}
                onChange={e => onChange({ ...element, title: e.target.value })}
                placeholder="Title (max 80 ký tự)..."
                maxLength={80}
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
            />
            <input
                value={element.subtitle || ''}
                onChange={e => onChange({ ...element, subtitle: e.target.value })}
                placeholder="Subtitle (max 80 ký tự)..."
                maxLength={80}
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
            />
            <input
                value={element.image_url || ''}
                onChange={e => onChange({ ...element, image_url: e.target.value })}
                placeholder="Image URL (optional)..."
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-mono text-xs"
            />
            {/* Card buttons */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Buttons (tối đa 3)</span>
                    <button onClick={addButton} disabled={(element.buttons?.length || 0) >= 3} className="text-xs text-blue-400 hover:underline cursor-pointer">+ Thêm</button>
                </div>
                {(element.buttons || []).map((btn, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <input
                            value={btn.title}
                            onChange={e => updateButton(i, { ...btn, title: e.target.value })}
                            placeholder="Title..."
                            className="flex-1 px-2 py-1 rounded border border-border bg-background text-xs"
                        />
                        <input
                            value={btn.payload || ''}
                            onChange={e => updateButton(i, { ...btn, payload: e.target.value })}
                            placeholder="Payload..."
                            className="flex-1 px-2 py-1 rounded border border-border bg-background text-xs font-mono"
                        />
                        <button onClick={() => removeButton(i)} className="text-muted-foreground hover:text-red-400 cursor-pointer"><X className="h-3 w-3" /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}
