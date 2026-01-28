
import { useState, useMemo } from 'react';
import { leadsApi, adAccountsApi } from '@/api';
import { PageHeader } from '@/components/custom/PageHeader';
import { FloatingCard, FloatingCardHeader, FloatingCardTitle, FloatingCardContent } from '@/components/custom/FloatingCard';
import { LoadingState } from '@/components/custom/LoadingState';
import { EmptyState } from '@/components/custom/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Users,
  Target,
  MessageSquare,
  DollarSign,
  Loader2,
  Send,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function LeadInsights() {
  const queryClient = useQueryClient();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [selectedPageId, setSelectedPageId] = useState<string>("all");
  const activeBranchId = "all"; // Simplified for now since filtering is global

  // Queries
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['leads', activeBranchId, selectedAccountId, selectedPageId],
    queryFn: async () => {
      const { data } = await leadsApi.list({
        branchId: activeBranchId,
        accountId: selectedAccountId === "all" ? undefined : selectedAccountId,
        pageId: selectedPageId === "all" ? undefined : selectedPageId
      });
      return data.result || [];
    }
  });

  const { data: adAccountsData } = useQuery({
    queryKey: ['ad-accounts-list'],
    queryFn: async () => {
      const { data } = await adAccountsApi.list({ branchId: activeBranchId });
      return data || []; // Ad-accounts returns array directly
    }
  });

  // Unique pages from leads for filtering (when not filtered)
  const availablePages = useMemo(() => {
    // If we have leads data, extract all unique pages
    // However, if filtered, it will only show pages from filtered leads
    // Ideally we should have an endpoint, but for now we try to get it from leads
    // Safe bet: Extract from leadsData if available
    const pageMap = new Map();
    leadsData?.forEach((l: any) => {
      const pId = l.platform_data?.fb_page_id;
      const pName = l.platform_data?.fb_page_name;
      if (pId && !pageMap.has(pId)) {
        pageMap.set(pId, pName || pId);
      }
    });
    return Array.from(pageMap.entries()).map(([id, name]) => ({ id, name }));
  }, [leadsData]);



  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedLeadId],
    queryFn: async () => {
      if (!selectedLeadId) return [];
      const { data } = await leadsApi.getMessages(selectedLeadId);
      return data.result || [];
    },
    enabled: !!selectedLeadId
  });

  // Default date range (Last 30 days) - Matching Dashboard logic
  const dateRange = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return {
      start: thirtyDaysAgo.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  }, []);

  const { data: statsData } = useQuery({
    queryKey: ['lead-stats', activeBranchId, dateRange.start, dateRange.end],
    queryFn: async () => {
      const { data } = await leadsApi.getStats({
        branchId: activeBranchId,
        dateStart: dateRange.start,
        dateEnd: dateRange.end
      });
      return data.result;
    }
  });

  // Mutations
  const syncLeadsMutation = useMutation({
    mutationFn: async () => {
      const result = await leadsApi.syncLeadsFromFacebook();
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
      
      if (data.success) {
        const { pagesSynced, leadsSynced, messagesSynced, errors } = data.result || {};
        if (leadsSynced > 0 || messagesSynced > 0) {
          toast.success(`Đồng bộ thành công`, {
            description: `${leadsSynced} leads, ${messagesSynced} tin nhắn từ ${pagesSynced} trang`
          });
        } else if (errors && errors.length > 0) {
          toast.warning('Đồng bộ hoàn tất nhưng có lỗi', {
            description: errors[0]
          });
        } else {
          toast.info('Không có dữ liệu mới', {
            description: `Đã quét ${pagesSynced} trang, không tìm thấy lead mới`
          });
        }
      } else {
        toast.error('Đồng bộ thất bại', {
          description: data.error || 'Lỗi không xác định'
        });
      }
    },
    onError: (error: any) => {
      console.error("Sync failed", error);
      toast.error('Đồng bộ thất bại: ' + (error.message || 'Lỗi kết nối'));
    }
  });

  const selectedLead = useMemo(() =>
    leadsData?.find((l: any) => l.id === selectedLeadId),
    [leadsData, selectedLeadId]);

  // Lead Stats Aggregation
  const stats = useMemo(() => {
    return statsData || {
      spendTotal: 0,
      spendToday: 0,
      yesterdaySpend: 0,
      todayLeads: 0,
      todayQualified: 0,
      avgDailySpend: 0,
      roas: 0
    };
  }, [statsData]);

  const spendChange = useMemo(() => {
    if (!stats.yesterdaySpend || stats.yesterdaySpend === 0) return 100;
    return ((stats.spendToday - stats.yesterdaySpend) / stats.yesterdaySpend) * 100;
  }, [stats.spendToday, stats.yesterdaySpend]);

  const costPerLead = useMemo(() => {
    if (!stats.todayLeads || stats.todayLeads === 0) return 0;
    return stats.spendToday / stats.todayLeads;
  }, [stats.spendToday, stats.todayLeads]);

  if (leadsLoading) return <LoadingState text="Đang tải danh sách Lead..." />;

  return (
    <div className="space-y-6 animate-float-up pb-10 h-[calc(100vh-100px)] flex flex-col">
      <PageHeader
        title="Lead Insights"
        description="Quản lý khách hàng tiềm năng và phân bổ nhân sự xử lý tin nhắn."
      >
        <Button
          variant="outline"
          onClick={() => syncLeadsMutation.mutate()}
          disabled={syncLeadsMutation.isPending}
          className="gap-2"
        >
          {syncLeadsMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {syncLeadsMutation.isPending ? 'Đang đồng bộ...' : 'Sync Lead từ Facebook'}
        </Button>
      </PageHeader>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-4 shrink-0">
        <FloatingCard className="bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Ads Spent</p>
              <p className="text-xl font-bold">{(stats.spendTotal / 1000000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}tr</p>
              <p className="text-[10px] text-muted-foreground">Trung bình {(stats.avgDailySpend / 1000000).toFixed(1)}tr mỗi ngày</p>
            </div>
          </div>
        </FloatingCard>
        <FloatingCard className="bg-blue-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Ads hôm nay</p>
              <p className="text-xl font-bold">{(stats.spendToday / 1000000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}tr</p>
              <p className="text-[10px] text-blue-400">
                {spendChange >= 0 ? '↑' : '↓'} {Math.abs(spendChange).toFixed(0)}% so với hôm qua
              </p>
            </div>
          </div>
        </FloatingCard>
        <FloatingCard className="bg-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Target className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Ads/Revenue</p>
              <p className="text-xl font-bold">{stats.revenue > 0 ? ((stats.spendTotal / stats.revenue) * 100).toFixed(1) : 0}%</p>
              <p className="text-[10px] text-amber-400">ROAS {stats.revenue > 0 ? ((stats.revenue / stats.spendTotal) * 100).toFixed(0) : 0}%</p>
            </div>
          </div>
        </FloatingCard>
        <FloatingCard className="bg-rose-500/5 border-rose-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <Users className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <p className="text-[10px] text-rose-500 uppercase font-bold">Qualified lead hôm nay</p>
              <p className="text-xl font-bold">{stats.todayQualified}/{stats.todayLeads}</p>
              <p className="text-[10px] text-muted-foreground">{(costPerLead / 1000).toFixed(0)}k/Lead</p>
            </div>
          </div>
        </FloatingCard>
      </div>

      {/* Main Content: Split List & Detail */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        {/* Lead List */}
        <FloatingCard padding="none" className="w-[400px] flex flex-col shrink-0">
          <FloatingCardHeader className="p-4 border-b border-border/10 shrink-0">
            <div className="flex flex-col gap-3">
              <FloatingCardTitle className="text-sm font-bold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Danh sách Lead
              </FloatingCardTitle>

              <div className="grid grid-cols-2 gap-2">
                <Select value={selectedPageId} onValueChange={setSelectedPageId}>
                  <SelectTrigger className="h-8 text-[10px] bg-muted/30 border-none">
                    <SelectValue placeholder="Tất cả Fanpage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-[10px]">Tất cả Fanpage</SelectItem>
                    {availablePages.map(p => (
                      <SelectItem key={p.id} value={p.id} className="text-[10px]">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger className="h-8 text-[10px] bg-muted/30 border-none">
                    <SelectValue placeholder="Tất cả TKQC" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-[10px]">Tất cả TKQC</SelectItem>
                    {adAccountsData?.map((a: any) => (
                      <SelectItem key={a.id} value={a.id.toString()} className="text-[10px]">{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FloatingCardHeader>
          <FloatingCardContent className="p-0 flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              <div className="divide-y divide-border/5">
                {leadsData?.map((lead: any) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`p-4 cursor-pointer hover:bg-muted/30 transition-colors flex gap-3 ${selectedLeadId === lead.id ? 'bg-muted/50 border-r-2 border-primary' : ''}`}
                  >
                    <Avatar className="h-10 w-10 border border-border/10">
                      <AvatarImage src={lead.customer_avatar} />
                      <AvatarFallback>{lead.customer_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold truncate pr-1">{lead.customer_name}</p>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-[8px] px-1 h-3.5 border-none font-bold uppercase shrink-0">New</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {lead.platform_data?.labels?.map((label: any) => (
                          <Badge 
                            key={label.id} 
                            variant="outline" 
                            className="text-[9px] px-1.5 h-4 bg-primary/10 border-primary/20 text-primary-foreground/90 font-medium flex gap-1"
                          >
                            {label.name === 'Mới' || label.name.toLowerCase().includes('mới') ? '✨ ' : ''}
                            {label.name.toLowerCase().includes('tiềm năng') ? '🎯 ' : ''}
                            {label.name.toLowerCase().includes('hỏi') ? '💬 ' : ''}
                            {label.name}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1.5">
                        <span className="truncate max-w-[150px]">
                          {lead.source_campaign_id ? (
                            <>TK: {lead.platform_account?.name} • CD: {lead.source_campaign_name}</>
                          ) : (
                            <>Trang: {lead.platform_data?.fb_page_name || 'Không xác định'} • Tự nhiên</>
                          )}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-foreground/80 lowercase">
                          {(() => {
                            const date = new Date(lead.last_message_at);
                            const now = new Date();
                            const diff = now.getTime() - date.getTime();
                            const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

                            if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                              return format(date, 'HH:mm');
                            } else if (diffDays < 1) {
                              return 'Hôm qua';
                            } else {
                              return format(date, 'dd/MM');
                            }
                          })()}
                        </span>
                      </p>
                      <p className="text-[11px] text-foreground/70 line-clamp-2 italic">
                        "{lead.platform_data?.snippet || 'Không có nội dung tin nhắn'}"
                      </p>
                    </div>
                  </div>
                ))}
                {(!leadsData || leadsData.length === 0) && (
                  <EmptyState title="Chưa có lead" description="Đang chờ tin nhắn mới từ khách hàng" />
                )}
              </div>
            </div>
          </FloatingCardContent>
        </FloatingCard>

        {/* Lead Detail / Chat */}
        <FloatingCard padding="none" className="flex-1 flex flex-col min-w-0">
          {selectedLead ? (
            <>
              <FloatingCardHeader className="p-4 border-b border-border/10 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedLead.customer_avatar} />
                    <AvatarFallback>{selectedLead.customer_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold">{selectedLead.customer_name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {selectedLead.source_campaign_id ? (
                        <>Đang nhắn trên TK: {selectedLead.platform_account?.name} • CD: {selectedLead.source_campaign_name}</>
                      ) : (
                        <>Đang nhắn trên Trang: {selectedLead.platform_data?.fb_page_name || 'Không xác định'} • Tự nhiên</>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {selectedLead.platform_data?.labels?.map((label: any) => (
                        <Badge 
                          key={label.id} 
                          variant="secondary" 
                          className="text-[10px] px-2 h-5 bg-primary/20 hover:bg-primary/30 text-white border-none flex gap-1"
                        >
                          {label.name === 'Mới' || label.name.toLowerCase().includes('mới') ? '✨ ' : ''}
                          {label.name.toLowerCase().includes('tiềm năng') ? '🎯 ' : ''}
                          {label.name.toLowerCase().includes('hỏi') ? '💬 ' : ''}
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedLead.platform_data?.last_staff_name && (
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Người phụ trách</p>
                    <p className="text-sm font-medium">{selectedLead.platform_data?.last_staff_name}</p>
                  </div>
                )}
              </FloatingCardHeader>

              <FloatingCardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 p-4 bg-muted/10 overflow-auto">
                  <div className="space-y-1 px-2">
                    {messagesLoading ? (
                      <LoadingState text="Đang tải hội thoại..." />
                    ) : (
                      (() => {
                        let lastDate = "";
                        let lastSenderId = "";
                        
                        return messagesData?.map((msg: any) => {
                          const msgDate = format(new Date(msg.sent_at), 'dd/MM/yyyy');
                          const showDateSeparator = msgDate !== lastDate;
                          lastDate = msgDate;
                          
                          const isSameSender = msg.sender_id === lastSenderId && !showDateSeparator;
                          lastSenderId = msg.sender_id;

                          const dateLabel = (() => {
                            const today = format(new Date(), 'dd/MM/yyyy');
                            const yesterday = format(new Date(Date.now() - 86400000), 'dd/MM/yyyy');
                            if (msgDate === today) return "Hôm nay";
                            if (msgDate === yesterday) return "Hôm qua";
                            return msgDate;
                          })();

                          return (
                            <div key={msg.id} className={`${showDateSeparator ? 'mt-8 mb-4' : 'mt-0'}`}>
                              {showDateSeparator && (
                                <div className="flex justify-center mb-6">
                                  <div className="bg-muted/10 text-muted-foreground/60 px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/5">
                                    {dateLabel}
                                  </div>
                                </div>
                              )}
                              <div
                                className={`flex ${msg.is_from_customer ? 'justify-start' : 'justify-end'}`}
                              >
                                <div className={`relative max-w-[80%] p-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all hover:brightness-110 ${
                                  msg.is_from_customer
                                    ? `bg-[#3e4042] text-white ${isSameSender ? 'rounded-tl-md mt-0.5' : 'rounded-bl-md mt-2'}`
                                    : `bg-[#0084ff] text-white ${isSameSender ? 'rounded-tr-md mt-0.5' : 'rounded-br-md mt-2'}`
                                  }`}>
                                  {msg.message_content || <span className="italic opacity-50">Đính kèm/Hình ảnh</span>}
                                  {!isSameSender && (
                                    <p className={`text-[8px] mt-1 opacity-50 font-medium ${msg.is_from_customer ? 'text-left' : 'text-right'}`}>
                                      {format(new Date(msg.sent_at), 'HH:mm')}
                                    </p>
                                  )}
                                  {isSameSender && (
                                     <div className="absolute -right-10 bottom-1 opacity-0 hover:opacity-100 text-[8px] text-muted-foreground transition-opacity">
                                       {format(new Date(msg.sent_at), 'HH:mm')}
                                     </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                </div>

                {/* Chat Input Placeholder */}
                <div className="p-4 border-t border-border/10 shrink-0">
                  <div className="relative">
                    <textarea
                      className="w-full bg-muted/30 border border-border/20 rounded-xl p-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none h-[45px]"
                      placeholder="Trả lời khách hàng tại đây (System proxy)..."
                      disabled
                    />
                    <Button size="icon" className="absolute right-2 top-1.5 h-8 w-8 rounded-lg" disabled>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </FloatingCardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={<MessageSquare className="h-12 w-12 text-muted-foreground/20" />}
                title="Chọn một cuộc hội thoại"
                description="Vui lòng chọn khách hàng từ danh sách bên trái để xem nội dung chat."
              />
            </div>
          )}
        </FloatingCard>
      </div>
    </div>
  );
}
