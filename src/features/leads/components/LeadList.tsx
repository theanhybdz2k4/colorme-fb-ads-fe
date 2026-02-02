import { useLeads } from '../context/LeadContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, RefreshCw, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function LeadList() {
    const {
        leads,
        selectedLeadId,
        setSelectedLeadId,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        syncHistoricLeads,
        isSyncing
    } = useLeads();

    const [hoveredLeadId, setHoveredLeadId] = useState<string | null>(null);

    const filteredLeads = leads.filter((l: any) => {
        const matchesSearch = !searchQuery ||
            l.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.phone?.includes(searchQuery) ||
            l.external_id?.includes(searchQuery);

        const matchesFilter = activeFilter === 'all' ||
            (activeFilter === 'unread' && !l.is_read) ||
            (activeFilter === 'mine' && l.assigned_user_id === 1);

        return matchesSearch && matchesFilter;
    });

    const handleSelectLead = (leadId: string) => {
        setSelectedLeadId(leadId);
    };

    return (
        <div className="w-[360px] flex flex-col border-r bg-muted/5 shrink-0 h-full">
            <div className="p-3 space-y-3 pb-0">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Messenger
                    </h2>
                    <Button variant="ghost" size="icon" onClick={syncHistoricLeads} disabled={isSyncing}>
                        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm tên, sđt khách hàng..."
                        className="pl-9 h-9 text-sm rounded-lg border-muted-foreground/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
                    <Button
                        variant={activeFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1 h-8 text-[10px] sm:text-[11px] font-bold min-w-[70px]"
                        onClick={() => setActiveFilter('all')}
                    >
                        TẤT CẢ
                    </Button>
                    <Button
                        variant={activeFilter === 'unread' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1 h-8 text-[10px] sm:text-[11px] font-bold gap-1 min-w-[90px]"
                        onClick={() => setActiveFilter('unread')}
                    >
                        CHƯA ĐỌC
                        {leads.filter((l: any) => !l.is_read).length > 0 && (
                            <span className="bg-rose-500 text-white rounded-full px-1 min-w-[16px] text-[9px]">
                                {leads.filter((l: any) => !l.is_read).length}
                            </span>
                        )}
                    </Button>
                    <Button
                        variant={activeFilter === 'mine' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1 h-8 text-[10px] sm:text-[11px] font-bold min-w-[70px]"
                        onClick={() => setActiveFilter('mine')}
                    >
                        CỦA TÔI
                    </Button>
                </div>
            </div>

            <Separator className="mt-3 opacity-50" />

            <ScrollArea className="flex-1">
                <div className="divide-y divide-border/5">
                    {filteredLeads.map((lead: any) => (
                        <Popover
                            key={lead.id}
                            open={hoveredLeadId === lead.id}
                            onOpenChange={(open) => !open && setHoveredLeadId(null)}
                        >
                            <PopoverTrigger asChild>
                                <div
                                    onClick={() => handleSelectLead(lead.id)}
                                    onMouseEnter={() => lead.ai_analysis && setHoveredLeadId(lead.id)}
                                    onMouseLeave={() => setHoveredLeadId(null)}
                                    className={`p-3 relative cursor-pointer hover:bg-muted/30 transition-all flex gap-3 border-l-4 group/lead ${selectedLeadId === lead.id ? 'bg-primary/5 border-primary shadow-sm' : 'border-transparent'}`}
                                >
                                    <Avatar className="h-12 w-12 border-2 border-border/10 shrink-0">
                                        <AvatarImage src={lead.customer_avatar} />
                                        <AvatarFallback>{lead.customer_name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className={`text-[13px] truncate flex items-center gap-1 min-w-0 ${!lead.is_read ? 'font-black text-foreground' : 'font-semibold text-foreground/80'}`}>
                                                {lead.customer_name}
                                                {lead.is_potential && lead.is_manual_potential && (
                                                    <span className="text-amber-500 animate-pulse-slow">⭐</span>
                                                )}
                                            </p>
                                            <Badge variant="secondary" className="text-[8px] h-3.5 px-1 bg-primary/10 text-primary border-none font-bold shrink-0 max-w-[100px] truncate">
                                                {lead.platform_pages?.name || lead.platform_data?.fb_page_name || 'Fanpage'}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 ml-auto">
                                                {lead.last_message_at ? (() => {
                                                    const msgDate = new Date(lead.last_message_at);
                                                    const today = new Date();
                                                    const isToday = msgDate.toDateString() === today.toDateString();
                                                    return isToday
                                                        ? format(msgDate, 'HH:mm')
                                                        : format(msgDate, 'dd/MM HH:mm');
                                                })() : '--:--'}
                                            </span>
                                        </div>
                                        {lead.ai_analysis ? (
                                            <p className="text-[10px] line-clamp-2 text-muted-foreground leading-relaxed">
                                                {lead.ai_analysis.split('\n').filter((line: string) => line.trim()).slice(0, 2).join(' • ')}
                                            </p>
                                        ) : (
                                            <p className={`text-[10px] line-clamp-1 ${!lead.is_read ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                                {(() => {
                                                    const snippet = lead.platform_data?.snippet || '';
                                                    if (snippet.startsWith('[Hình ảnh]')) return '📷 Hình ảnh';
                                                    if (snippet.startsWith('[Sticker]')) return '🎨 Sticker';
                                                    if (snippet.startsWith('[Video]')) return '🎥 Video';
                                                    if (snippet.startsWith('[Media]')) return '📎 File đính kèm';
                                                    return snippet || 'Tin nhắn mới';
                                                })()}
                                            </p>
                                        )}
                                        <div className="flex gap-1 items-center flex-wrap">
                                            {lead.phone && <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-emerald-500/10 text-emerald-600 border-none font-medium">📞 {lead.phone}</Badge>}
                                        </div>
                                    </div>
                                    {!lead.is_read && (
                                        <div className="absolute right-3 bottom-3 h-2.5 w-2.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                                    )}
                                </div>
                            </PopoverTrigger>
                            {lead.ai_analysis && (
                                <PopoverContent
                                    side="right"
                                    align="start"
                                    sideOffset={10}
                                    className="p-0 border-none bg-transparent shadow-none w-auto pointer-events-none"
                                >
                                    <div className="w-[300px] animate-in fade-in zoom-in-95 slide-in-from-left-2 duration-200">
                                        <div className="bg-background border shadow-2xl rounded-xl p-4 ml-2 relative before:content-[''] before:absolute before:top-6 before:-left-2 before:w-4 before:h-4 before:bg-background before:border-l before:border-b before:rotate-45">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <MessageSquare className="h-3 w-3 text-primary" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary/80">AI Insight</span>
                                                {lead.is_potential && (
                                                    <Badge className="ml-auto bg-amber-500 border-none text-[8px] h-3.5 px-1 font-bold animate-pulse">⭐ TIỀM NĂNG</Badge>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                                {lead.ai_analysis}
                                            </p>
                                        </div>
                                    </div>
                                </PopoverContent>
                            )}
                        </Popover>
                    ))}
                    {!filteredLeads.length && (
                        <div className="p-8 text-center text-muted-foreground opacity-50 flex flex-col items-center gap-2">
                            <Search className="h-8 w-8" />
                            <p className="text-sm">Không tìm thấy kết quả</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
