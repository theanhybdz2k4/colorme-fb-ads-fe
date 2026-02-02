
import { useState, useEffect, useRef } from 'react';
import { useLeads } from '../context/LeadContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone, MoreVertical, Loader2, Send, Tag, StickyNote, Info, RefreshCw, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
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
        isSyncingMessages
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
                        <AvatarImage src={selectedLead.customer_avatar} />
                        <AvatarFallback>{selectedLead.customer_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <p className="font-bold text-xs md:text-sm truncate">{selectedLead.customer_name}</p>
                            <Badge className="bg-emerald-500 rounded-full h-1.5 w-1.5 md:h-2 md:w-2 p-0 border-none shrink-0" />
                        </div>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground truncate">
                            {selectedLead.platform_pages?.name || selectedLead.platform_data?.fb_page_name || 'Fanpage'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2 shrink-0">
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
                        const showDateSeparator = !prevMsgDate || msgDate.toDateString() !== prevMsgDate.toDateString();

                        const getDateLabel = (date: Date) => {
                            const today = new Date();
                            const yesterday = new Date(today);
                            yesterday.setDate(yesterday.getDate() - 1);

                            if (date.toDateString() === today.toDateString()) return 'Hôm nay';
                            if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';
                            return format(date, 'dd/MM/yyyy');
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
                                            <AvatarImage src={selectedLead.customer_avatar} />
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
                                            <div className="flex flex-wrap gap-1 mb-1">
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
                                                    return (
                                                        <div key={idx} className="bg-muted p-3 rounded-xl flex items-center gap-2 text-xs">
                                                            <Info className="h-4 w-4" />
                                                            <a href={att.payload?.url} target="_blank" rel="noreferrer" className="underline truncate max-w-[150px]">
                                                                File đính kèm ({att.type})
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
                                                        // Hide if this share link is likely the same as the sticker or an attachment image
                                                        const isStickerUrl = msg.sticker && share.link && share.link.includes(msg.sticker.split('?')[0]);
                                                        const isAttachmentUrl = msg.attachments?.some((att: any) => 
                                                            att.payload?.url && share.link && share.link.includes(att.payload.url.split('?')[0])
                                                        );
                                                        // Also hide if it's a very long CDN URL which is likely just the media itself
                                                        const isCdnUrl = share.link?.includes('fbcdn.net');
                                                        
                                                        return !isStickerUrl && !isAttachmentUrl && !isCdnUrl;
                                                    })
                                                    .map((share: any, idx: number) => (
                                                        <div key={idx} className="bg-muted/30 border border-border/50 rounded-xl p-3 max-w-[240px]">
                                                            <a href={share.link} target="_blank" rel="noreferrer" className="block">
                                                                <p className="font-bold text-sm truncate">{share.name || 'Shared Link'}</p>
                                                                <p className="text-xs text-muted-foreground truncate">{share.description}</p>
                                                                <p className="text-[10px] text-blue-500 mt-1 truncate">{share.link}</p>
                                                            </a>
                                                        </div>
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
                                            {format(new Date(msg.sent_at), 'HH:mm')}
                                        </p>
                                    </div>

                                    {isSystem && isLastInGroup && (
                                        <Avatar className="h-7 w-7 ml-2 mt-auto shrink-0 border border-border/20">
                                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">ME</AvatarFallback>
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
