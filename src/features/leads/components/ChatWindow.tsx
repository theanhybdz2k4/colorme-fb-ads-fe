
import { useState, useEffect, useRef } from 'react';
import { useLeads } from '../context/LeadContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone, MoreVertical, Loader2, Send, Tag, StickyNote, Info } from 'lucide-react';
import { format } from 'date-fns';

export function ChatWindow() {
    const {
        leads,
        selectedLeadId,
        messages,
        messagesLoading,
        sendReply,
        isSending
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
            <div className="flex-1 h-full flex flex-col items-center justify-center animate-fade-in gap-4 bg-background">
                <div className="p-6 bg-primary/5 rounded-full animate-pulse-slow">
                    <MessageSquare className="h-20 w-20 text-primary/20" />
                </div>
                <div className="text-center">
                    <h3 className="font-bold text-lg">Chào mừng quay lại!</h3>
                    <p className="text-muted-foreground text-sm max-w-[300px]">Hãy chọn một hội thoại bên trái để bắt đầu tư vấn và chốt đơn.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-muted/10 relative h-full">
            {/* Chat Header */}
            <div className="h-14 flex items-center justify-between px-6 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={selectedLead.customer_avatar} />
                        <AvatarFallback>{selectedLead.customer_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-sm">{selectedLead.customer_name}</p>
                            <Badge className="bg-emerald-500 rounded-full h-2 w-2 p-0 border-none" />
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {selectedLead.platform_data?.fb_page_name} • {selectedLead.external_id}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground"><Phone className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground"><MoreVertical className="h-4 w-4" /></Button>
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
                        const isLastInGroup = !nextMsg || nextMsg.is_from_customer !== msg.is_from_customer;

                        return (
                            <div key={msg.id} className={`flex ${isSystem ? 'justify-end' : 'justify-start'}`}>
                                {!isSystem && isLastInGroup && (
                                    <Avatar className="h-7 w-7 mr-2 mt-auto shrink-0 border border-border/20">
                                        <AvatarImage src={selectedLead.customer_avatar} />
                                        <AvatarFallback className="text-[10px]">{selectedLead.customer_name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                {!isSystem && !isLastInGroup && <div className="w-9 shrink-0" />}

                                <div className="max-w-[85%] group relative">
                                    <div className={`px-4 py-2.5 rounded-2xl text-[13.5px] shadow-sm leading-relaxed wrap-break-word whitespace-pre-wrap ${isSystem ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-background border border-border/50 text-foreground rounded-bl-sm'}`}>
                                        {msg.message_content}
                                    </div>
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
