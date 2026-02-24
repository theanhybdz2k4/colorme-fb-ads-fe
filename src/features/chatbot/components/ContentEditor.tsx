import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X, Trash2 } from 'lucide-react';
import type { MessageType, FlowContent, QuickReply, ButtonItem, CarouselElement } from '@/types/chatbot.types';

// Facebook API character limits
const FB_LIMITS = {
    BUTTON_TITLE: 20,
    QUICK_REPLY_TITLE: 20,
    BUTTON_TEXT: 640,
    ELEMENT_TITLE: 80,
    ELEMENT_SUBTITLE: 80,
};

// Emoji-safe character length
const charLen = (s: string) => Array.from(s).length;
// Emoji-safe slice
const charSlice = (s: string, n: number) => Array.from(s).slice(0, n).join('');

// Char counter badge component
function CharCount({ value, max }: { value: string; max: number }) {
    const len = charLen(value || '');
    const isOver = len > max;
    const isNear = len >= max - 3;
    return (
        <span className={`text-[10px] tabular-nums ${isOver ? 'text-red-500 font-bold' : isNear ? 'text-yellow-500' : 'text-muted-foreground'}`}>
            {len}/{max}
        </span>
    );
}

// Input with FB limit enforcement (maxLength + paste clipping)
function LimitedInput({ value, onChange, max, placeholder, className }: {
    value: string;
    onChange: (v: string) => void;
    max: number;
    placeholder?: string;
    className?: string;
}) {
    return (
        <div className="flex-1 relative">
            <input
                value={value}
                onChange={e => onChange(charSlice(e.target.value, max))}
                onPaste={e => {
                    e.preventDefault();
                    const pasted = e.clipboardData.getData('text');
                    const current = value || '';
                    const cursorStart = (e.target as HTMLInputElement).selectionStart || 0;
                    const cursorEnd = (e.target as HTMLInputElement).selectionEnd || 0;
                    const before = Array.from(current).slice(0, cursorStart).join('');
                    const after = Array.from(current).slice(cursorEnd).join('');
                    const combined = before + pasted + after;
                    onChange(charSlice(combined, max));
                }}
                placeholder={placeholder}
                className={className || 'w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm'}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
                <CharCount value={value} max={max} />
            </span>
        </div>
    );
}

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
                    <div className="flex items-center justify-between">
                        <Label>Nội dung tin nhắn</Label>
                        {type === 'buttons' && <CharCount value={content.text || ''} max={FB_LIMITS.BUTTON_TEXT} />}
                    </div>
                    <textarea
                        value={content.text || ''}
                        onChange={e => {
                            if (type === 'buttons') {
                                updateText(charSlice(e.target.value, FB_LIMITS.BUTTON_TEXT));
                            } else {
                                updateText(e.target.value);
                            }
                        }}
                        onPaste={type === 'buttons' ? (e) => {
                            e.preventDefault();
                            const pasted = e.clipboardData.getData('text');
                            const current = content.text || '';
                            const ta = e.target as HTMLTextAreaElement;
                            const before = Array.from(current).slice(0, ta.selectionStart || 0).join('');
                            const after = Array.from(current).slice(ta.selectionEnd || 0).join('');
                            updateText(charSlice(before + pasted + after, FB_LIMITS.BUTTON_TEXT));
                        } : undefined}
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
                        <Label>Phản hồi nhanh (Quick Replies)</Label>
                        <Button size="sm" variant="outline" onClick={addQuickReply} className="gap-1">
                            <Plus className="h-3 w-3" /> Thêm
                        </Button>
                    </div>
                    {(content.quick_replies || []).map((qr, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <LimitedInput
                                value={qr.title}
                                onChange={v => updateQuickReply(i, { ...qr, title: v })}
                                max={FB_LIMITS.QUICK_REPLY_TITLE}
                                placeholder="Tiêu đề (tối đa 20)..."
                                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm pr-14"
                            />
                            <input
                                value={qr.payload}
                                onChange={e => updateQuickReply(i, { ...qr, payload: e.target.value })}
                                placeholder="Mã định danh (Payload)..."
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
                        <Label>Nút bấm (tối đa 3)</Label>
                        <Button size="sm" variant="outline" onClick={addButton} disabled={(content.buttons?.length || 0) >= 3} className="gap-1">
                            <Plus className="h-3 w-3" /> Thêm
                        </Button>
                    </div>
                    {(content.buttons || []).map((btn, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <LimitedInput
                                value={btn.title}
                                onChange={v => updateButton(i, { ...btn, title: v })}
                                max={FB_LIMITS.BUTTON_TITLE}
                                placeholder="Tiêu đề (tối đa 20)..."
                                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm pr-14"
                            />
                            <input
                                value={btn.payload || ''}
                                onChange={e => updateButton(i, { ...btn, payload: e.target.value })}
                                placeholder="Mã định danh (Payload)..."
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
                        <Label>Các thẻ Carousel (tối đa 10)</Label>
                        <Button size="sm" variant="outline" onClick={addElement} disabled={(content.elements?.length || 0) >= 10} className="gap-1">
                            <Plus className="h-3 w-3" /> Thêm thẻ
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
                <span className="text-xs font-bold text-muted-foreground">Thẻ #{index + 1}</span>
                <button onClick={onRemove} className="p-1 hover:text-red-400 text-muted-foreground group cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            <div className="relative">
                <input
                    value={element.title}
                    onChange={e => onChange({ ...element, title: charSlice(e.target.value, FB_LIMITS.ELEMENT_TITLE) })}
                    placeholder="Tiêu đề (tối đa 80 ký tự)..."
                    className="w-full px-3 py-1.5 pr-14 rounded-lg border border-border bg-background text-sm"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2"><CharCount value={element.title} max={FB_LIMITS.ELEMENT_TITLE} /></span>
            </div>
            <div className="relative">
                <input
                    value={element.subtitle || ''}
                    onChange={e => onChange({ ...element, subtitle: charSlice(e.target.value, FB_LIMITS.ELEMENT_SUBTITLE) })}
                    placeholder="Mô tả phụ (tối đa 80 ký tự)..."
                    className="w-full px-3 py-1.5 pr-14 rounded-lg border border-border bg-background text-sm"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2"><CharCount value={element.subtitle || ''} max={FB_LIMITS.ELEMENT_SUBTITLE} /></span>
            </div>
            <input
                value={element.image_url || ''}
                onChange={e => onChange({ ...element, image_url: e.target.value })}
                placeholder="URL hình ảnh (không bắt buộc)..."
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-mono text-xs"
            />
            {/* Card buttons */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Nút bấm (tối đa 3)</span>
                    <button onClick={addButton} disabled={(element.buttons?.length || 0) >= 3} className="text-xs text-blue-400 hover:underline cursor-pointer">+ Thêm</button>
                </div>
                {(element.buttons || []).map((btn, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <LimitedInput
                            value={btn.title}
                            onChange={v => updateButton(i, { ...btn, title: v })}
                            max={FB_LIMITS.BUTTON_TITLE}
                            placeholder="Tiêu đề (tối đa 20)..."
                            className="w-full px-2 py-1 rounded border border-border bg-background text-xs pr-12"
                        />
                        <input
                            value={btn.payload || ''}
                            onChange={e => updateButton(i, { ...btn, payload: e.target.value })}
                            placeholder="Mã (Payload)..."
                            className="flex-1 px-2 py-1 rounded border border-border bg-background text-xs font-mono"
                        />
                        <button onClick={() => removeButton(i)} className="text-muted-foreground hover:text-red-400 cursor-pointer"><X className="h-3 w-3" /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}
