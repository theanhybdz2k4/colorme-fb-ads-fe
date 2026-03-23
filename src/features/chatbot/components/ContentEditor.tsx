import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
    Plus, X, Trash2, Loader2, ImagePlus, Crop, RectangleHorizontal, Square, Check, Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ImageCropModal } from './ImageCropModal';
import { toast } from 'sonner';
import { chatbotApi } from '@/api/chatbot.api';
import type { MessageType, FlowContent, QuickReply, ButtonItem, CarouselElement } from '@/types/chatbot.types';
import { Input } from '@/components/ui/input';

// Facebook API character limits
const FB_LIMITS = {
    BUTTON_TITLE: 20,
    QUICK_REPLY_TITLE: 20,
    BUTTON_TEXT: 640,
    ELEMENT_TITLE: 80,
    ELEMENT_SUBTITLE: 80,
};

// Emoji-safe character length
const charLen = (s: string) => Array.from(s || '').length;
// Emoji-safe slice
const charSlice = (s: string, n: number) => Array.from(s || '').slice(0, n).join('');

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
                className={className || 'w-full h-9 px-3 rounded-lg border border-border bg-background text-sm'}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
                <CharCount value={value} max={max} />
            </span>
        </div>
    );
}

// FB button paylod helper
const parsePayload = (payload: string): string[] => {
    if (!payload) return [];
    if (payload.startsWith('FLOW:')) return payload.substring(5).split(',').filter(Boolean);
    return [payload];
};

const stringifyPayload = (keys: string[], flows: { flow_key: string }[]): string => {
    if (keys.length === 0) return '';
    // If all selected keys are flow keys, use FLOW: prefix
    const allFlows = keys.every(k => flows.some(f => f.flow_key === k));
    if (allFlows) return `FLOW:${keys.join(',')}`;
    // Otherwise it's either a single custom payload or a mix (mix is discouraged but we take first if multi)
    return keys[0];
};

export function FlowMultiSelect({ flows, selectedKeys, onChange, compact, placeholder }: {
    flows: { flow_key: string; display_name: string }[];
    selectedKeys: string[];
    onChange: (keys: string[]) => void;
    compact?: boolean;
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const unselectedFlows = flows.filter(f => !selectedKeys.includes(f.flow_key));
    const filtered = unselectedFlows.filter(f => 
        f.display_name.toLowerCase().includes(search.toLowerCase()) || 
        f.flow_key.toLowerCase().includes(search.toLowerCase())
    );

    const showCustomAdd = search.trim() !== '' && !flows.some(f => f.flow_key === search || f.display_name === search);

    const toggle = (key: string) => {
        if (selectedKeys.includes(key)) {
            onChange(selectedKeys.filter(k => k !== key));
        } else {
            onChange([...selectedKeys, key]);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div 
                    className={cn(
                        "flex-1 flex flex-wrap gap-1 items-center p-1.5 rounded-lg border border-border bg-background cursor-pointer hover:border-primary/40 transition-colors empty:after:content-[attr(data-placeholder)] empty:after:text-muted-foreground empty:after:text-xs empty:after:py-1 empty:after:px-1",
                        compact && "min-h-[32px] p-1 text-[10px]"
                    )}
                    data-placeholder={placeholder || "Chọn Flow..."}
                >
                    {selectedKeys.map(key => {
                        const flow = flows.find(f => f.flow_key === key);
                        return (
                            <Badge 
                                key={key} 
                                variant="secondary" 
                                className={cn("gap-1 pr-1 pl-1.5 font-normal", compact && "h-5 text-[9px] px-1")}
                            >
                                {flow?.display_name || key}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggle(key); }}
                                    className="hover:text-red-500 rounded-full"
                                >
                                    <X className={cn("h-2.5 w-2.5", compact && "h-2 w-2")} />
                                </button>
                            </Badge>
                        );
                    })}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0 shadow-xl border border-border overflow-hidden" align="start">
                <div className="p-2 border-b border-border bg-muted/20 space-y-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm kiếm flow..." 
                            className="h-8 pl-8 text-xs"
                        />
                    </div>
                </div>
                <div className="max-h-[320px] overflow-y-auto p-1 custom-scrollbar">
                    {showCustomAdd && (
                        <div
                            onClick={() => { toggle(search.trim()); setSearch(''); }}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer text-xs text-primary"
                        >
                            <Plus className="h-3 w-3" />
                            <span>Thêm custom: <strong>{search}</strong></span>
                        </div>
                    )}
                    
                    {filtered.length === 0 && !showCustomAdd && (
                        <div className="py-4 text-center text-xs text-muted-foreground">Không tìm thấy flow nào</div>
                    )}
                    
                    {filtered.map(f => (
                        <div
                            key={f.flow_key}
                            onClick={() => { toggle(f.flow_key); setSearch(''); }}
                            className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer transition-colors"
                        >
                            <div className="flex flex-col">
                                <span className="text-xs font-medium">{f.display_name}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">{f.flow_key}</span>
                            </div>
                            {selectedKeys.includes(f.flow_key) && (
                                <Check className="h-4 w-4 text-primary" />
                            )}
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

interface ContentEditorProps {
    type: MessageType;
    content: FlowContent;
    onChange: (c: FlowContent) => void;
    flows?: { flow_key: string; display_name: string }[];
}

export function ContentEditor({ type, content, onChange, flows = [] }: ContentEditorProps) {
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
            {/* Text content & Image */}
            {(type === 'text' || type === 'quick_reply' || type === 'buttons') && (
                <div className="space-y-4">
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
                            rows={type === 'text' ? 5 : 3}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-y"
                            placeholder="Nhập nội dung tin nhắn..."
                        />
                    </div>

                    {/* Optional Image for plain text or quick_reply */}
                    {(type === 'text' || type === 'quick_reply') && (
                        <div className="space-y-2 border-t border-border/50 pt-3">
                            <Label className="text-xs text-muted-foreground font-bold italic">Hình ảnh đi kèm (tùy chọn)</Label>
                            <ImageUploadSection 
                                imageUrl={content.image_url || ''} 
                                aspectRatio={content.image_aspect_ratio || 'horizontal'}
                                onChange={(url) => onChange({ ...content, image_url: url })}
                                onAspectRatioChange={(ratio) => onChange({ ...content, image_aspect_ratio: ratio })}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Carousel text_before */}
            {type === 'carousel' && (
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label>Text giới thiệu (gửi trước carousel)</Label>
                        <textarea
                            value={content.text_before || ''}
                            onChange={e => updateTextBefore(e.target.value)}
                            rows={8}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-y"
                            placeholder="VD: Đây là 3 lộ trình chuyên nghiệp..."
                        />
                    </div>
                    {/* Image aspect ratio selector */}
                    <div className="space-y-1.5">
                        <Label>Tỷ lệ ảnh</Label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => onChange({ ...content, image_aspect_ratio: 'horizontal' })}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${(content.image_aspect_ratio || 'horizontal') === 'horizontal'
                                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                                        : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                                    }`}
                            >
                                <RectangleHorizontal className="h-4 w-4" />
                                <span>Ngang (1.91:1)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onChange({ ...content, image_aspect_ratio: 'square' })}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${content.image_aspect_ratio === 'square'
                                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                                        : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                                    }`}
                            >
                                <Square className="h-4 w-4" />
                                <span>Vuông (1:1)</span>
                            </button>
                        </div>
                    </div>
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
                                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm pr-14"
                            />
                            <div className="flex-1 space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Kích hoạt Flow (hoặc nhập Payload)</label>
                                <FlowMultiSelect
                                    flows={flows}
                                    selectedKeys={parsePayload(qr.payload || '')}
                                    onChange={keys => updateQuickReply(i, { ...qr, payload: stringifyPayload(keys, flows) })}
                                    placeholder="Chọn Flow hoặc nhập Payload..."
                                />
                            </div>
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
                        <div key={i} className="flex gap-2 items-start bg-muted/20 p-2 rounded-lg border border-border/50">
                            <div className="flex-1 space-y-2">
                                <div className="flex gap-2">
                                    <LimitedInput
                                        value={btn.title}
                                        onChange={v => updateButton(i, { ...btn, title: v })}
                                        max={FB_LIMITS.BUTTON_TITLE}
                                        placeholder="Tiêu đề nút (ví dụ: Xem ngay)..."
                                        className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm pr-14"
                                    />
                                    <button onClick={() => removeButton(i)} className="p-1.5 hover:text-red-400 group cursor-pointer">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Kích hoạt Flow (hoặc nhập Payload)</label>
                                    <FlowMultiSelect
                                        flows={flows}
                                        selectedKeys={parsePayload(btn.payload || '')}
                                        onChange={keys => updateButton(i, { ...btn, payload: stringifyPayload(keys, flows) })}
                                        placeholder="Chọn Flow hoặc nhập Payload..."
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Carousel Elements */}
            {type === 'carousel' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Các thẻ Carousel (tối đa 10)</Label>
                        <Button size="sm" variant="outline" onClick={addElement} disabled={(content.elements?.length || 0) >= 10} className="gap-1 bg-blue-500/10 border-blue-500/50 text-blue-600 hover:bg-blue-500/20">
                            <Plus className="h-4 w-4" /> Thêm thẻ Carousel
                        </Button>
                    </div>
                    {(!content.elements || content.elements.length === 0) && (
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl bg-muted/5 text-muted-foreground">
                            <ImagePlus className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm font-medium">Chưa có thẻ nào</p>
                            <p className="text-xs">Bấm "+ Thêm thẻ" để tải ảnh lên cho Carousel</p>
                        </div>
                    )}
                    {(content.elements || []).map((el, i) => (
                        <CarouselElementEditor
                            key={i}
                            index={i}
                            element={el}
                            imageAspectRatio={content.image_aspect_ratio || 'horizontal'}
                            flows={flows}
                            onChange={e => updateElement(i, e)}
                            onRemove={() => removeElement(i)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function CarouselElementEditor({ index, element, imageAspectRatio, onChange, onRemove, flows = [] }: {
    index: number;
    element: CarouselElement;
    imageAspectRatio: 'horizontal' | 'square';
    onChange: (el: CarouselElement) => void;
    onRemove: () => void;
    flows?: { flow_key: string; display_name: string }[];
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
                    className="w-full h-9 px-3 pr-14 rounded-lg border border-border bg-background text-sm"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2"><CharCount value={element.title} max={FB_LIMITS.ELEMENT_TITLE} /></span>
            </div>
            <div className="relative">
                <input
                    value={element.subtitle || ''}
                    onChange={e => onChange({ ...element, subtitle: charSlice(e.target.value, FB_LIMITS.ELEMENT_SUBTITLE) })}
                    placeholder="Phụ đề (tối đa 80 ký tự)..."
                    className="w-full h-9 px-3 pr-14 rounded-lg border border-border bg-background text-sm"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2"><CharCount value={element.subtitle || ''} max={FB_LIMITS.ELEMENT_SUBTITLE} /></span>
            </div>

            {/* Image: FB ratio preview + URL + upload + crop */}
            <ImageUploadSection
                imageUrl={element.image_url || ''}
                aspectRatio={imageAspectRatio}
                onChange={url => onChange({ ...element, image_url: url })}
            />

            {/* Card buttons */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Nút bấm (tối đa 3)</span>
                    <button onClick={addButton} disabled={(element.buttons?.length || 0) >= 3} className="text-xs text-blue-400 hover:underline cursor-pointer">+ Thêm</button>
                </div>
                {(element.buttons || []).map((btn, i) => (
                    <div key={i} className="space-y-1 p-2 rounded-lg border border-border/40 bg-muted/5">
                        <div className="flex gap-2 items-center">
                            <LimitedInput
                                value={btn.title}
                                onChange={v => updateButton(i, { ...btn, title: v })}
                                max={FB_LIMITS.BUTTON_TITLE}
                                placeholder="Tên nút..."
                                className="w-full px-2 py-1 rounded-lg min-h-[32px] border border-border bg-background text-xs pr-12"
                            />
                            <button onClick={() => removeButton(i)} className="text-muted-foreground hover:text-red-400 cursor-pointer"><X className="h-3 w-3" /></button>
                        </div>
                        <div className="flex gap-1 items-center">
                            <input
                                value={btn.payload || ''}
                                onChange={e => updateButton(i, { ...btn, payload: e.target.value })}
                                placeholder="Payload..."
                                className="flex-1 px-2 py-1 min-h-[32px] rounded-lg border border-border bg-background text-[10px] font-mono"
                            />
                            {flows.length > 0 && (
                                <FlowMultiSelect
                                    flows={flows}
                                    selectedKeys={(btn.payload || '').startsWith('FLOW:') ? (btn.payload || '').substring(5).split(',').filter(Boolean) : []}
                                    onChange={keys => updateButton(i, { ...btn, payload: keys.length > 0 ? `FLOW:${keys.join(',')}` : '' })}
                                    compact
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ImageUploadSection({ imageUrl, aspectRatio, onChange, onAspectRatioChange }: {
    imageUrl: string;
    aspectRatio: 'horizontal' | 'square';
    onChange: (url: string) => void;
    onAspectRatioChange?: (ratio: 'horizontal' | 'square') => void;
}) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [cropOpen, setCropOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isSquare = aspectRatio === 'square';

    const handleUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Chỉ hỗ trợ file ảnh');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ảnh tối đa 5MB');
            return;
        }
        setUploading(true);
        try {
            const { url } = await chatbotApi.uploadImage(file);
            onChange(url);
            toast.success('Tải ảnh thành công!');
        } catch (e: any) {
            toast.error(e.message || 'Tải ảnh thất bại');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleUpload(file);
    };

    return (
        <div className="space-y-3">
            {onAspectRatioChange && (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => onAspectRatioChange('horizontal')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${aspectRatio === 'horizontal'
                                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                            }`}
                    >
                        <RectangleHorizontal className="h-4 w-4" />
                        <span>Ngang (1.91:1)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onAspectRatioChange('square')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${aspectRatio === 'square'
                                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                            }`}
                    >
                        <Square className="h-4 w-4" />
                        <span>Vuông (1:1)</span>
                    </button>
                </div>
            )}

            {imageUrl && (
                <div
                    className="relative group rounded-lg overflow-hidden border border-border bg-black/50 cursor-pointer"
                    style={{ aspectRatio: isSquare ? '1' : '1.91' }}
                    onClick={() => setCropOpen(true)}
                >
                    <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={e => (e.currentTarget.style.display = 'none')}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <span className="bg-white/90 text-black text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <Crop className="h-3 w-3" /> Chỉnh sửa
                        </span>
                    </div>
                    <button
                        onClick={e => { e.stopPropagation(); onChange(''); }}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                        <X className="h-3 w-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                        {isSquare ? '1 : 1' : '1.91 : 1'}
                    </span>
                </div>
            )}
            <div className="flex gap-2 items-center">
                <input
                    value={imageUrl}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Dán link ảnh hoặc tải lên..."
                    className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-xs font-mono"
                />
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                        e.target.value = '';
                    }}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1 h-9 px-3 rounded-lg border border-dashed border-blue-400/50 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                >
                    {uploading ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang tải...</>
                    ) : (
                        <><ImagePlus className="h-3.5 w-3.5" /> {dragOver ? 'Thả ảnh...' : 'Tải ảnh'}</>
                    )}
                </button>
            </div>

            {imageUrl && (
                <ImageCropModal
                    open={cropOpen}
                    onClose={() => setCropOpen(false)}
                    imageUrl={imageUrl}
                    aspectRatio={aspectRatio}
                    isSaving={uploading}
                    onCropped={async (blob) => {
                        const file = new File([blob], `crop_${Date.now()}.jpg`, { type: 'image/jpeg' });
                        setUploading(true);
                        try {
                            const { url } = await chatbotApi.uploadImage(file);
                            onChange(url);
                            setCropOpen(false);
                            toast.success('Đã cắt và lưu ảnh!');
                        } catch (e: any) {
                            toast.error(e.message || 'Lưu ảnh thất bại');
                        } finally {
                            setUploading(false);
                        }
                    }}
                />
            )}
        </div>
    );
}
