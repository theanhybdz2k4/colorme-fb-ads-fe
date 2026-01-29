
import { useLeads } from '../context/LeadContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, RefreshCw, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function LeadList() {
    const {
        leads,
        selectedLeadId,
        setSelectedLeadId,
        selectedAccountId,
        setSelectedAccountId,
        selectedPageId,
        setSelectedPageId,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        adAccounts,
        availablePages,
        pagesLoading,
        markAsRead
    } = useLeads();

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
        const lead = leads.find((l: any) => l.id === leadId);
        if (lead && !lead.is_read) {
            markAsRead(leadId);
        }
    };

    return (
        <div className="w-[360px] flex flex-col border-r bg-muted/5 shrink-0 h-full">
            <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Messenger
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedLeadId(null)}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm tên, sđt khách hàng..."
                        className="pl-9 h-9 text-sm rounded-lg border-muted-foreground/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-1">
                    <Button
                        variant={activeFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1 h-8 text-[11px] font-bold"
                        onClick={() => setActiveFilter('all')}
                    >
                        TẤT CẢ
                    </Button>
                    <Button
                        variant={activeFilter === 'unread' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1 h-8 text-[11px] font-bold gap-1"
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
                        className="flex-1 h-8 text-[11px] font-bold"
                        onClick={() => setActiveFilter('mine')}
                    >
                        CỦA TÔI
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Select value={selectedPageId} onValueChange={setSelectedPageId} disabled={pagesLoading}>
                        <SelectTrigger className="h-8 text-[10px] bg-background">
                            {pagesLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <SelectValue placeholder="Trang" />}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả Trang</SelectItem>
                            {availablePages.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                        <SelectTrigger className="h-8 text-[10px] bg-background">
                            <SelectValue placeholder="Tài khoản" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả TKQC</SelectItem>
                            {adAccounts.map((a: any) => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Separator className="opacity-50" />

            <ScrollArea className="flex-1">
                <div className="divide-y divide-border/5">
                    {filteredLeads.map((lead: any) => (
                        <div
                            key={lead.id}
                            onClick={() => handleSelectLead(lead.id)}
                            className={`p-3 relative cursor-pointer hover:bg-muted/30 transition-all flex gap-3 border-l-4 ${selectedLeadId === lead.id ? 'bg-primary/5 border-primary shadow-sm' : 'border-transparent'}`}
                        >
                            <Avatar className="h-12 w-12 border-2 border-border/10 shrink-0">
                                <AvatarImage src={lead.customer_avatar} />
                                <AvatarFallback>{lead.customer_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex justify-between items-start mb-0.5">
                                    <p className={`text-[13px] truncate pr-1 ${!lead.is_read ? 'font-black text-foreground' : 'font-semibold text-foreground/80'}`}>
                                        {lead.customer_name}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
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
                                <p className={`text-[11px] line-clamp-1 ${!lead.is_read ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                    {lead.platform_data?.snippet || '...'}
                                </p>
                                <div className="flex gap-1 mt-1.5 items-center flex-wrap">
                                    {lead.phone && <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-emerald-500/10 text-emerald-600 border-none font-medium">📞 {lead.phone}</Badge>}
                                    <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-blue-500/10 text-blue-600 border-none font-semibold flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                        {lead.platform_pages?.name || lead.platform_data?.fb_page_name || lead.fb_page_id || 'Unknown Page'}
                                    </Badge>
                                </div>
                            </div>
                            {!lead.is_read && (
                                <div className="absolute right-3 bottom-3 h-2.5 w-2.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                            )}
                        </div>
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
