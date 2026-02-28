
import { useState, useEffect, useRef } from 'react';
import { useLeads } from '../context/LeadContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone, MoreVertical, Loader2, Send, Tag, StickyNote, Info, RefreshCw, ChevronLeft, Target } from 'lucide-react';
import { format, isValid } from 'date-fns';

// Explicit ICT formatting helper
const formatVnTime = (dateInput: any) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (!isValid(date)) return '';

    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
};
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { LeadDetails } from './LeadDetails';

export function ChatWindow() {
    const {
        leads,
        selectedLeadId,
        setSelectedLeadId,
        messages,
        messagesLoading,
        sendReply,
        isSending,
        syncMessages,
        isSyncingMessages,
        reanalyzeLead,
        isReanalyzing,
        agents,
        assignAgent
    } = useLeads();

    const [replyText, setReplyText] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const selectedLead = leads?.find((l: any) => l.id === selectedLeadId);

    // Scroll to bottom when messages load
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!replyText.trim() || isSending) return;
        await sendReply(replyText);
        setReplyText("");
    };

    if (!selectedLead) {
        return (
            <div className="flex-1 h-full flex flex-col items-center justify-center animate-fade-in gap-4 bg-background px-6">
                <div className="p-6 bg-primary/5 rounded-full animate-pulse-slow">
                    <MessageSquare className="h-12 w-12 md:h-20 md:w-20 text-primary/20" />
                </div>
                <div className="text-center">
                    <h3 className="font-bold text-base md:text-lg">Chào mừng quay lại!</h3>
                    <p className="text-muted-foreground text-xs md:text-sm max-w-[300px]">Hãy chọn một hội thoại bên trái để bắt đầu tư vấn và chốt đơn.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-muted/10 relative h-full overflow-hidden">
            {/* Chat Header */}
            <div className="h-14 flex items-center justify-between px-3 md:px-6 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10 w-full">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden h-8 w-8 -ml-1"
                        onClick={() => setSelectedLeadId(null)}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-8 w-8 md:h-9 md:w-9 shrink-0">
                        <AvatarFallback>{selectedLead.customer_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                            <p className="font-bold text-xs md:text-sm truncate">{selectedLead.customer_name}</p>
                            <Badge className="bg-emerald-500 rounded-full h-1.5 w-1.5 md:h-2 md:w-2 p-0 border-none shrink-0" />

                            {/* Status Badges */}
                            {selectedLead.is_potential && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[9px] h-4 px-1.5 font-black flex items-center gap-1 group/tooltip relative">
                                    <Target className="h-2.5 w-2.5" />
                                    AI TIỀM NĂNG
                                    <div className="absolute top-full left-0 mt-1 w-48 p-2 bg-background border rounded-lg shadow-xl hidden group-hover/tooltip:block z-[100] font-normal normal-case text-foreground text-[10px] leading-relaxed">
                                        {selectedLead.ai_analysis}
                                    </div>
                                </Badge>
                            )}
                            {selectedLead.is_qualified && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 text-[9px] h-4 px-1.5 font-black flex items-center gap-1">
                                    <RefreshCw className="h-2.5 w-2.5" />
                                    QUALIFIED
                                </Badge>
                            )}
                        </div>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground truncate">
                            {selectedLead.platform_pages?.name || selectedLead.platform_data?.fb_page_name || 'Fanpage'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                    {/* Agent Assignment */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className={`h-8 gap-2 px-2 hidden sm:flex border-dashed ${selectedLead.assigned_agent_id ? 'border-primary/50 bg-primary/5' : 'text-muted-foreground'}`}
                            >
                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-bold text-primary">
                                        {selectedLead.assigned_agent_name?.charAt(0) || '?'}
                                    </span>
                                </div>
                                <span className="text-[11px] font-medium max-w-[80px] truncate">
                                    {selectedLead.assigned_agent_name || 'Chưa bàn giao'}
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2" align="end">
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold px-2 py-1.5 text-muted-foreground uppercase tracking-wider">Chọn nhân viên phụ trách</p>
                                {agents.length > 0 ? (
                                    agents.map((agent: any) => (
                                        <Button
                                            key={agent.id}
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start font-normal h-9"
                                            onClick={() => assignAgent(agent)}
                                        >
                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                                                <span className="text-[10px] font-bold text-primary">{agent.name.charAt(0)}</span>
                                            </div>
                                            <span className="text-sm">{agent.name}</span>
                                            {selectedLead.assigned_agent_id === agent.id && (
                                                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                                            )}
                                        </Button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-xs text-muted-foreground">
                                        Chưa phát hiện nhân viên nào.
                                        <p className="mt-1">Hãy để nhân viên nhắn tin cho khách trên fanpage để tự động nhận diện.</p>
                                    </div>
                                )}
                                {selectedLead.assigned_agent_id && (
                                    <>
                                        <Separator className="my-1" />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start font-normal h-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                            onClick={() => assignAgent({ id: '', name: '' })}
                                        >
                                            <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center mr-2">
                                                <span className="text-[10px] font-bold text-rose-500">X</span>
                                            </div>
                                            <span className="text-sm">Gỡ phân công</span>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 md:h-9 md:w-9 text-muted-foreground hover:text-primary"
                        onClick={syncMessages}
                        disabled={isSyncingMessages}
                        title="Đồng bộ lại tin nhắn"
                    >
                        <RefreshCw className={`h-4 w-4 ${isSyncingMessages ? 'animate-spin' : ''}`} />
                    </Button>

                    {/* Info Button for Mobile */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="xl:hidden h-8 w-8 md:h-9 md:w-9 text-muted-foreground">
                                <Info className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="p-0 border-none bg-transparent max-w-[360px] h-[80vh]">
                            <div className="h-full bg-background rounded-2xl overflow-hidden border">
                                <LeadDetails />
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button variant="ghost" size="icon" className="hidden sm:flex h-8 w-8 md:h-9 md:w-9 text-muted-foreground"><Phone className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 text-muted-foreground"><MoreVertical className="h-4 w-4" /></Button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar" ref={scrollRef}>
                {selectedLead.ai_analysis && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Target className="h-12 w-12 text-amber-600" />
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <Badge className="bg-amber-500 hover:bg-amber-600 text-[10px] font-black tracking-wider px-2 border-none">AI INSIGHT</Badge>
                                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-tight">Tóm tắt nhu cầu</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-auto h-6 text-[10px] text-amber-600 hover:text-amber-700 hover:bg-amber-100/50 gap-1.5 font-bold"
                                    onClick={() => reanalyzeLead()}
                                    disabled={isReanalyzing}
                                >
                                    <RefreshCw className={`h-3 w-3 ${isReanalyzing ? 'animate-spin' : ''}`} />
                                    PHÂN TÍCH LẠI
                                </Button>
                            </div>
                            <p className="text-[13px] text-amber-900/80 leading-relaxed font-medium whitespace-pre-wrap">
                                {selectedLead.ai_analysis}
                            </p>
                        </div>
                    </div>
                )}

                {messagesLoading ? (
                    <div className="h-full flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : (
                    messages.map((msg: any, i: number) => {
                        const isSystem = !msg.is_from_customer;
                        const nextMsg = messages[i + 1];
                        const prevMsg = messages[i - 1];
                        const isLastInGroup = !nextMsg || nextMsg.is_from_customer !== msg.is_from_customer;

                        // Date separator logic
                        const msgDate = new Date(msg.sent_at);
                        const prevMsgDate = prevMsg ? new Date(prevMsg.sent_at) : null;

                        const toIctDateOnly = (d: Date) => new Intl.DateTimeFormat('en-US', {
                            timeZone: 'Asia/Ho_Chi_Minh',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        }).format(d);

                        const showDateSeparator = !prevMsgDate || toIctDateOnly(msgDate) !== toIctDateOnly(prevMsgDate);

                        const getDateLabel = (date: Date) => {
                            const now = new Date();
                            const yesterday = new Date(now);
                            yesterday.setDate(now.getDate() - 1);

                            const toIctLabel = (d: Date) => new Intl.DateTimeFormat('en-US', {
                                timeZone: 'Asia/Ho_Chi_Minh',
                                day: '2-digit',
                                month: '2-digit'
                            }).format(d);

                            const toIctYear = (d: Date) => new Intl.DateTimeFormat('en-US', {
                                timeZone: 'Asia/Ho_Chi_Minh',
                                year: 'numeric'
                            }).format(d);

                            if (toIctDateOnly(date) === toIctDateOnly(now)) return 'Hôm nay';
                            if (toIctDateOnly(date) === toIctDateOnly(yesterday)) return 'Hôm qua';

                            // For older dates, format in ICT
                            return new Intl.DateTimeFormat('vi-VN', {
                                timeZone: 'Asia/Ho_Chi_Minh',
                                day: '2-digit',
                                month: '2-digit',
                                year: toIctYear(date) !== toIctYear(now) ? 'numeric' : undefined
                            }).format(date);
                        };

                        return (
                            <div key={msg.id}>
                                {showDateSeparator && (
                                    <div className="flex items-center gap-3 my-4">
                                        <div className="flex-1 h-px bg-border/50" />
                                        <span className="text-[11px] text-muted-foreground font-medium px-3 py-1 bg-muted/50 rounded-full">
                                            {getDateLabel(msgDate)}
                                        </span>
                                        <div className="flex-1 h-px bg-border/50" />
                                    </div>
                                )}
                                <div className={`flex ${isSystem ? 'justify-end' : 'justify-start'}`}>
                                    {!isSystem && isLastInGroup && (
                                        <Avatar className="h-7 w-7 mr-2 mt-auto shrink-0 border border-border/20">
                                            <AvatarFallback className="text-[10px]">{selectedLead.customer_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    {!isSystem && !isLastInGroup && <div className="w-9 shrink-0" />}

                                    <div className="group relative max-w-[70%]">
                                        {/* 1. Stickers (No bubble) */}
                                        {msg.sticker && (
                                            <div className="mb-1">
                                                <img
                                                    src={msg.sticker}
                                                    alt="Sticker"
                                                    className="h-32 w-auto hover:opacity-90 transition-opacity cursor-pointer"
                                                />
                                            </div>
                                        )}

                                        {/* 2. Attachments (Images/Videos/Files) */}
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="flex flex-col gap-1 mb-1">
                                                {msg.attachments.map((att: any, idx: number) => {
                                                    if (att.type === 'image' || att.type === 'sticker') {
                                                        return (
                                                            <img
                                                                key={idx}
                                                                src={att.payload?.url}
                                                                alt="Attachment"
                                                                className={att.type === 'sticker' ? "h-32 w-auto hover:opacity-90 transition-opacity cursor-pointer mb-1" : "rounded-xl w-full max-w-[240px] h-auto border border-border/10 cursor-pointer hover:opacity-95"}
                                                            />
                                                        );
                                                    }
                                                    if (att.type === 'video') {
                                                        return (
                                                            <video
                                                                key={idx}
                                                                src={att.payload?.url}
                                                                className="rounded-xl w-full max-w-[240px] h-auto border border-border/10"
                                                                controls
                                                            />
                                                        );
                                                    }
                                                    if (att.type === 'template') {
                                                        const templateType = att.payload?.template_type;
                                                        // BUTTON TEMPLATE
                                                        if (templateType === 'button') {
                                                            return (
                                                                <div key={idx} className="max-w-[280px] rounded-2xl overflow-hidden border border-border/50 bg-background shadow-sm">
                                                                    {att.title && (
                                                                        <div className="px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap">
                                                                            {att.title}
                                                                        </div>
                                                                    )}
                                                                    {att.payload?.buttons?.map((btn: any, btnIdx: number) => (
                                                                        <div key={btnIdx} className="border-t border-border/30">
                                                                            {btn.type === 'web_url' ? (
                                                                                <a
                                                                                    href={btn.url}
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-medium text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                                                                                >
                                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                                    {btn.title}
                                                                                </a>
                                                                            ) : (
                                                                                <div className="flex items-center justify-center px-4 py-2.5 text-[13px] font-medium text-primary">
                                                                                    {btn.title}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        }
                                                        // GENERIC TEMPLATE (single card or carousel)
                                                        if (templateType === 'generic' && att.payload?.elements) {
                                                            const elements = att.payload.elements;
                                                            return (
                                                                <div key={idx} className={`flex gap-2 ${elements.length > 1 ? 'overflow-x-auto pb-2 snap-x snap-mandatory custom-scrollbar' : ''}`}
                                                                    style={elements.length > 1 ? { maxWidth: '320px' } : undefined}
                                                                >
                                                                    {elements.map((el: any, elIdx: number) => (
                                                                        <div
                                                                            key={elIdx}
                                                                            className={`rounded-2xl overflow-hidden border border-border/50 bg-background shadow-sm shrink-0 snap-start ${elements.length > 1 ? 'w-[220px]' : 'w-full max-w-[280px]'}`}
                                                                        >
                                                                            {el.image_url && (
                                                                                el.default_action?.url ? (
                                                                                    <a href={el.default_action.url} target="_blank" rel="noreferrer">
                                                                                        <img
                                                                                            src={el.image_url}
                                                                                            alt={el.title || 'Template'}
                                                                                            className="w-full h-[140px] object-cover hover:opacity-90 transition-opacity"
                                                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                                                        />
                                                                                    </a>
                                                                                ) : (
                                                                                    <img
                                                                                        src={el.image_url}
                                                                                        alt={el.title || 'Template'}
                                                                                        className="w-full h-[140px] object-cover"
                                                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                                                    />
                                                                                )
                                                                            )}
                                                                            <div className="px-3 py-2.5">
                                                                                {el.title && (
                                                                                    <p className="text-[13px] font-bold leading-snug line-clamp-2">{el.title}</p>
                                                                                )}
                                                                                {el.subtitle && (
                                                                                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug line-clamp-3">{el.subtitle}</p>
                                                                                )}
                                                                            </div>
                                                                            {el.buttons?.map((btn: any, btnIdx: number) => (
                                                                                <div key={btnIdx} className="border-t border-border/30">
                                                                                    {btn.type === 'web_url' ? (
                                                                                        <a
                                                                                            href={btn.url}
                                                                                            target="_blank"
                                                                                            rel="noreferrer"
                                                                                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                                                                                        >
                                                                                            <ExternalLink className="h-3 w-3" />
                                                                                            {btn.title}
                                                                                        </a>
                                                                                    ) : (
                                                                                        <div className="flex items-center justify-center px-3 py-2 text-[12px] font-medium text-primary">
                                                                                            {btn.title}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        }
                                                        // Fallback for other template types
                                                        return (
                                                            <div key={idx} className="max-w-[280px] rounded-2xl overflow-hidden border border-border/50 bg-background shadow-sm px-4 py-3">
                                                                <p className="text-[13px] whitespace-pre-wrap">{att.title || '[Template]'}</p>
                                                            </div>
                                                        );
                                                    }
                                                    if (att.type === 'fallback' || att.type === 'share') {
                                                        const linkUrl = att.url || att.payload?.url;
                                                        const imgSrc = att.media?.image?.src || att.image_data?.url || att.payload?.url;
                                                        const isImage = imgSrc && (imgSrc.match(/\.(jpg|jpeg|png|gif|webp)/i) || imgSrc.includes('fbcdn'));
                                                        return (
                                                            <a key={idx} href={linkUrl} target="_blank" rel="noreferrer" className="block max-w-[260px] rounded-xl overflow-hidden border border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow">
                                                                {isImage && (
                                                                    <img src={imgSrc} alt="" className="w-full h-[140px] object-cover" />
                                                                )}
                                                                <div className="px-3 py-2">
                                                                    <p className="font-semibold text-[13px] line-clamp-2">{att.title || 'Shared Link'}</p>
                                                                    {att.description && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{att.description}</p>}
                                                                    {linkUrl && <p className="text-[10px] text-blue-500 mt-1 truncate">{linkUrl}</p>}
                                                                </div>
                                                            </a>
                                                        );
                                                    }
                                                    // GENERIC_TEMPLATE: Vimeo/Zoom/Ad link preview cards (no type field)
                                                    if (att.generic_template) {
                                                        const gt = att.generic_template;
                                                        const cardUrl = att.url || gt.url || gt.media_url;
                                                        const CardWrapper = cardUrl ? 'a' : 'div';
                                                        return (
                                                            <CardWrapper key={idx} {...(cardUrl ? { href: cardUrl, target: '_blank', rel: 'noreferrer' } : {})} className="block max-w-[260px] rounded-xl overflow-hidden border border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                                                {gt.media_url && (
                                                                    <img src={gt.media_url} alt="" className="w-full h-[140px] object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                                )}
                                                                <div className="px-3 py-2">
                                                                    {gt.title && <p className="font-semibold text-[13px] line-clamp-2">{gt.title}</p>}
                                                                    {gt.subtitle && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{gt.subtitle}</p>}
                                                                </div>
                                                            </CardWrapper>
                                                        );
                                                    }
                                                    // IMAGE_DATA: Direct image attachments
                                                    if (att.image_data?.url) {
                                                        return (
                                                            <div key={idx} className="max-w-[260px] rounded-xl overflow-hidden">
                                                                <img src={att.image_data.preview_url || att.image_data.url} alt="" className="w-full rounded-xl" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <div key={idx} className="bg-muted p-3 rounded-xl flex items-center gap-2 text-xs">
                                                            <Info className="h-4 w-4" />
                                                            <a href={att.payload?.url} target="_blank" rel="noreferrer" className="underline truncate max-w-[150px]">
                                                                File đính kèm ({att.type || 'file'})
                                                            </a>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* 3. Shares (Links) */}
                                        {msg.shares && msg.shares.length > 0 && (
                                            <div className="flex flex-col gap-1 mb-1">
                                                {msg.shares
                                                    .filter((share: any) => {
                                                        const isStickerUrl = msg.sticker && share.link && share.link.includes(msg.sticker.split('?')[0]);
                                                        const isAttachmentUrl = msg.attachments?.some((att: any) =>
                                                            att.payload?.url && share.link && share.link.includes(att.payload.url.split('?')[0])
                                                        );
                                                        const isCdnUrl = share.link?.includes('fbcdn.net');
                                                        return !isStickerUrl && !isAttachmentUrl && !isCdnUrl;
                                                    })
                                                    .map((share: any, idx: number) => (
                                                        <a key={idx} href={share.link} target="_blank" rel="noreferrer" className="block max-w-[260px] rounded-xl overflow-hidden border border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow">
                                                            {share.picture && (
                                                                <img src={share.picture} alt="" className="w-full h-[140px] object-cover" />
                                                            )}
                                                            <div className="px-3 py-2">
                                                                <p className="font-semibold text-[13px] line-clamp-2">{share.name || 'Shared Link'}</p>
                                                                {share.description && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{share.description}</p>}
                                                                {share.link && <p className="text-[10px] text-blue-500 mt-1 truncate">{share.link}</p>}
                                                            </div>
                                                        </a>
                                                    ))}
                                            </div>
                                        )}

                                        {/* 4. Text Content (Bubble) - Only show if valid text exists and isn't just a media placeholder */}
                                        {msg.message_content &&
                                            !msg.message_content.startsWith('[Sticker]') &&
                                            !msg.message_content.startsWith('[Media]') &&
                                            !msg.message_content.startsWith('[Hình ảnh]') &&
                                            !msg.message_content.startsWith('[Ảnh]') &&
                                            !msg.message_content.startsWith('[Video]') &&
                                            !msg.message_content.startsWith('[template]') &&
                                            !msg.message_content.startsWith('[Event]') &&
                                            !msg.message_content.startsWith('[Link]') &&
                                            !msg.message_content.startsWith('[Hình ảnh/File]') &&
                                            !msg.message_content.startsWith('[File]') &&
                                            !msg.message_content.startsWith('[Audio]') &&
                                            !msg.message_content.startsWith('[undefined]') &&
                                            !(msg.attachments && msg.attachments.length > 0 &&
                                                (msg.message_content.trim() === '[Hình ảnh]' ||
                                                    msg.message_content.trim() === '[Ảnh]' ||
                                                    msg.message_content.trim() === '[Video]' ||
                                                    msg.message_content.trim() === '[Media]')) &&
                                            (
                                                <div className={`px-4 py-2.5 rounded-2xl text-[14px] shadow-sm leading-relaxed wrap-break-word whitespace-pre-wrap ${isSystem ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-background border border-border/50 text-foreground rounded-bl-sm'}`}>
                                                    {msg.message_content}
                                                </div>
                                            )}

                                        <p className={`text-[10px] mt-1 opacity-60 group-hover:opacity-100 transition-opacity ${isSystem ? 'text-right' : 'text-left'} text-muted-foreground`}>
                                            {formatVnTime(msg.sent_at)}
                                        </p>
                                    </div>

                                    {isSystem && isLastInGroup && (
                                        <Avatar className="h-7 w-7 ml-2 mt-auto shrink-0 border border-border/20">
                                            <AvatarImage src={selectedLead.platform_pages?.avatar_url} />
                                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                                {selectedLead.platform_pages?.name?.charAt(0) || 'ME'}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    {isSystem && !isLastInGroup && <div className="w-9 shrink-0" />}
                                </div>
                            </div>
                        );
                    })
                )}
                {!messages.length && !messagesLoading && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
                        <MessageSquare className="h-16 w-16" />
                        <p className="font-medium">Chưa có tin nhắn nào</p>
                    </div>
                )}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-background border-t">
                <div className="flex items-end gap-2 bg-muted/30 rounded-2xl p-2 border border-border/50 focus-within:border-primary/50 transition-all">
                    <textarea
                        className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] p-2 resize-none max-h-32 min-h-[40px] outline-none"
                        placeholder="Nhập tin nhắn..."
                        rows={1}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <Button
                        size="icon"
                        className="rounded-xl h-9 w-9"
                        disabled={!replyText.trim() || isSending}
                        onClick={handleSend}
                    >
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="flex gap-4 mt-2 px-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-primary"><Tag className="h-3 w-3" /> Gắn Tag</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-primary"><StickyNote className="h-3 w-3" /> Ghi chú</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-primary"><Info className="h-3 w-3" /> Tạo đơn</span>
                </div>
            </div>
        </div>
    );
}
